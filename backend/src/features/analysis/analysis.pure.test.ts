import { describe, expect, test } from "bun:test";
import {
  checkMetadataSuspicion,
  detectDirection,
  getFileRanking,
} from "./analysis.service";
import type { ParsedFile } from "../documents/documents.parser";
import type { SimilarityResult } from "./similarity.service";

function makeFile(over: Partial<ParsedFile>): ParsedFile {
  return {
    id: "x",
    name: "x.txt",
    size: 10,
    type: "text/plain",
    content: "isi",
    metadata: {},
    isOcr: false,
    ...over,
  };
}

describe("checkMetadataSuspicion", () => {
  test("metadata tidak lengkap dianggap Aman", () => {
    expect(checkMetadataSuspicion({}).status).toBe("Aman");
  });

  test("lastModifiedBy sama dengan author dianggap Aman", () => {
    expect(
      checkMetadataSuspicion({ lastModifiedBy: "Budi", author: "Budi" }).status,
    ).toBe("Aman");
  });

  test("lastModifiedBy berbeda dari author dianggap Mencurigakan", () => {
    expect(
      checkMetadataSuspicion({ lastModifiedBy: "Andi", author: "Budi" }).status,
    ).toBe("Mencurigakan");
  });

  test("mendukung field authors (comma-separated)", () => {
    expect(
      checkMetadataSuspicion({ lastModifiedBy: "Budi", authors: "Andi, Budi" }).status,
    ).toBe("Aman");
  });
});

describe("detectDirection", () => {
  test("tanpa result mengembalikan tidak dapat ditentukan", () => {
    expect(detectDirection(makeFile({}), makeFile({}))).toBe("Tidak dapat ditentukan");
  });

  test("dokumen jauh lebih panjang dianggap sumber", () => {
    const a = makeFile({ name: "panjang.txt", content: "kata ".repeat(100) });
    const b = makeFile({ name: "pendek.txt", content: "kata" });
    const result = {} as SimilarityResult;
    expect(detectDirection(a, b, result)).toContain("pendek.txt");
  });
});

describe("getFileRanking", () => {
  test("menghitung maxSimilarity, avgSimilarity, pairCount dan mengurutkan menurun", () => {
    const files = [
      makeFile({ id: "1", name: "a.txt" }),
      makeFile({ id: "2", name: "b.txt" }),
      makeFile({ id: "3", name: "c.txt" }),
    ];
    const results: SimilarityResult[] = [
      { fileAId: "1", fileBId: "2", fileAName: "a.txt", fileBName: "b.txt", normalScore: 80, strictScore: 0, wordOverlap: 0, matchedRanges: [] },
      { fileAId: "1", fileBId: "3", fileAName: "a.txt", fileBName: "c.txt", normalScore: 20, strictScore: 0, wordOverlap: 0, matchedRanges: [] },
    ];
    const ranking = getFileRanking(files, results);
    expect(ranking[0].id).toBe("1");
    expect(ranking[0].maxSimilarity).toBe(80);
    expect(ranking[0].pairCount).toBe(2);
    for (let i = 1; i < ranking.length; i++) {
      expect(ranking[i - 1].maxSimilarity).toBeGreaterThanOrEqual(ranking[i].maxSimilarity);
    }
  });
});
