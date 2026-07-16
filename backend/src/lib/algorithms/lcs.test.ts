import { describe, expect, test } from "bun:test";
import {
  lcsWordOverlap,
  findMatchedRanges,
  findLongestCommonSubsequence,
  calculateLCSMetrics,
} from "./lcs";

describe("lcsWordOverlap", () => {
  test("salah satu teks kosong menghasilkan 0", () => {
    expect(lcsWordOverlap("", "satu dua")).toBe(0);
    expect(lcsWordOverlap("satu dua", "")).toBe(0);
  });

  test("subset penuh menghasilkan 1", () => {
    expect(lcsWordOverlap("satu dua", "satu dua tiga empat")).toBeCloseTo(1, 5);
  });

  test("overlap sebagian menghasilkan rasio terhadap set terkecil", () => {
    const score = lcsWordOverlap("satu dua tiga empat", "satu dua lima enam");
    expect(score).toBeCloseTo(0.5, 5);
  });
});

describe("findLongestCommonSubsequence", () => {
  test("menemukan subsequence umum", () => {
    expect(
      findLongestCommonSubsequence(["a", "b", "c", "d"], ["b", "d"]),
    ).toEqual(["b", "d"]);
  });

  test("tanpa kesamaan menghasilkan array kosong", () => {
    expect(findLongestCommonSubsequence(["a", "b"], ["c", "d"])).toEqual([]);
  });
});

describe("findMatchedRanges", () => {
  test("run identik minimal 5 kata menghasilkan minimal satu range", () => {
    const shared = "kalimat panjang yang sama persis antara dua dokumen berbeda";
    const a = `awalan berbeda ${shared} akhiran a`;
    const b = `pembuka lain ${shared} penutup b`;
    const ranges = findMatchedRanges(a, b);
    expect(ranges.length).toBeGreaterThanOrEqual(1);
    expect(ranges[0].a.length).toBe(2);
    expect(ranges[0].b.length).toBe(2);
  });

  test("teks tanpa run panjang menghasilkan array kosong", () => {
    const ranges = findMatchedRanges("aaa bbb ccc", "ddd eee fff");
    expect(ranges).toEqual([]);
  });
});

describe("calculateLCSMetrics", () => {
  test("mengembalikan overlap, matchedRanges, dan commonWords", () => {
    const result = calculateLCSMetrics("satu dua tiga", "satu dua empat");
    expect(result.overlap).toBeGreaterThan(0);
    expect(Array.isArray(result.matchedRanges)).toBe(true);
    expect(result.commonWords).toContain("satu");
  });
});
