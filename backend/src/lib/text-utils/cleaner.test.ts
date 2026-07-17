import { describe, expect, test } from "bun:test";
import {
  cleanTextForAlgo,
  normalizeText,
  chunkText,
  extractTextMetadata,
} from "./cleaner";

describe("cleanTextForAlgo - normal", () => {
  test("lowercase dan normalisasi whitespace", () => {
    expect(cleanTextForAlgo("Halo   DUNIA", { strict: false, exclusions: [] })).toBe("halo dunia");
  });

  test("mode normal tidak menghapus header Nama:", () => {
    const out = cleanTextForAlgo("Nama: Budi\nisi laporan", { strict: false, exclusions: [] });
    expect(out).toContain("nama");
    expect(out).toContain("budi");
  });
});

describe("cleanTextForAlgo - strict", () => {
  test("menghapus header Nama: dan NIM:", () => {
    const out = cleanTextForAlgo("Nama: Budi\nNIM: 123\nisi asli laporan", {
      strict: true,
      exclusions: [],
    });
    expect(out).not.toContain("budi");
    expect(out).not.toContain("123");
    expect(out).toContain("isi asli laporan");
  });

  test("menghapus custom exclusions (di-escape aman)", () => {
    const out = cleanTextForAlgo("kata rahasia.com muncul", {
      strict: true,
      exclusions: ["rahasia.com"],
    });
    expect(out).not.toContain("rahasia.com");
  });

  test("maxLength memotong hasil", () => {
    const out = cleanTextForAlgo("satu dua tiga empat lima", {
      strict: false,
      exclusions: [],
      maxLength: 8,
    });
    expect(out.length).toBeLessThanOrEqual(8);
  });
});

describe("normalizeText", () => {
  test("tanda baca jadi spasi, lowercase, trim", () => {
    expect(normalizeText("Halo, Dunia!!!")).toBe("halo dunia");
  });
});

describe("chunkText", () => {
  test("membagi per chunkSize kata dan mempertahankan jumlah kata", () => {
    const chunks = chunkText("a b c d e", 2);
    expect(chunks.length).toBe(3);
    expect(chunks.join(" ").split(" ").length).toBe(5);
  });
});

describe("extractTextMetadata", () => {
  test("mendeteksi header dan menghitung kata/baris", () => {
    const meta = extractTextMetadata("Nama: Budi\nisi\ndaftar pustaka");
    expect(meta.hasHeader).toBe(true);
    expect(meta.hasFooter).toBe(true);
    expect(meta.lineCount).toBe(3);
    expect(meta.wordCount).toBeGreaterThan(0);
  });
});
