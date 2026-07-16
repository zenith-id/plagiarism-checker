import { describe, expect, test } from "bun:test";
import {
  generateNGrams,
  ngramOverlap,
  weightedNGramScore,
  multiNGramOverlap,
} from "./n-gram";

describe("generateNGrams", () => {
  test("token lebih sedikit dari n menghasilkan set kosong", () => {
    expect(generateNGrams(["a", "b"], 5).size).toBe(0);
  });

  test("jumlah n-gram = len - n + 1", () => {
    const tokens = ["a", "b", "c", "d", "e", "f"];
    expect(generateNGrams(tokens, 5).size).toBe(2);
  });

  test("membuat n-gram yang benar untuk n=2", () => {
    const grams = generateNGrams(["a", "b", "c"], 2);
    expect(grams.has("a b")).toBe(true);
    expect(grams.has("b c")).toBe(true);
    expect(grams.size).toBe(2);
  });
});

describe("ngramOverlap", () => {
  const identical = "satu dua tiga empat lima enam tujuh";

  test("teks identik menghasilkan 1", () => {
    expect(ngramOverlap(identical, identical, 5)).toBeCloseTo(1, 5);
  });

  test("teks dengan token kurang dari n menghasilkan 0", () => {
    expect(ngramOverlap("satu dua", "satu dua", 5)).toBe(0);
  });

  test("overlap sebagian menghasilkan nilai antara 0 dan 1", () => {
    const a = "satu dua tiga empat lima enam";
    const b = "satu dua tiga empat lima tujuh delapan sembilan";
    const score = ngramOverlap(a, b, 5);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });
});

describe("multiNGramOverlap", () => {
  test("mengembalikan skor untuk tiap nilai n", () => {
    const text = "satu dua tiga empat lima enam tujuh";
    const result = multiNGramOverlap(text, text, [3, 4, 5]);
    expect(result[3]).toBeCloseTo(1, 5);
    expect(result[5]).toBeCloseTo(1, 5);
  });
});

describe("weightedNGramScore", () => {
  test("teks identik menghasilkan 1", () => {
    const text = "satu dua tiga empat lima enam tujuh";
    expect(weightedNGramScore(text, text)).toBeCloseTo(1, 5);
  });

  test("teks tanpa overlap n-gram menghasilkan 0", () => {
    const a = "aaa bbb ccc ddd eee";
    const b = "fff ggg hhh iii jjj";
    expect(weightedNGramScore(a, b)).toBe(0);
  });
});
