import { describe, expect, test } from "bun:test";
import {
  tokenize,
  computeTF,
  computeIDF,
  cosineSimilarity,
  computeSimilarityMatrix,
  computeTFIDFVectors,
} from "./tf-idf";

describe("tokenize", () => {
  test("memecah spasi dan membuang tanda baca", () => {
    expect(tokenize("Hello, World!")).toEqual(["Hello", "World"]);
  });

  test("membuang token kosong dan whitespace berlebih", () => {
    expect(tokenize("  satu   dua  ")).toEqual(["satu", "dua"]);
  });

  test("string kosong menghasilkan array kosong", () => {
    expect(tokenize("")).toEqual([]);
  });
});

describe("computeTF", () => {
  test("menghitung frekuensi ternormalisasi", () => {
    const tf = computeTF(["a", "a", "b", "c"]);
    expect(tf.get("a")).toBeCloseTo(0.5, 5);
    expect(tf.get("b")).toBeCloseTo(0.25, 5);
    expect(tf.get("c")).toBeCloseTo(0.25, 5);
  });

  test("array kosong tidak error (total default 1)", () => {
    const tf = computeTF([]);
    expect(tf.size).toBe(0);
  });
});

describe("computeIDF", () => {
  test("term di semua dokumen memiliki idf 0", () => {
    const idf = computeIDF([
      ["a", "b"],
      ["a", "c"],
    ]);
    expect(idf.get("a")).toBeCloseTo(0, 5);
  });

  test("term langka memiliki idf lebih besar dari term umum", () => {
    const idf = computeIDF([
      ["a", "b"],
      ["a", "c"],
    ]);
    expect(idf.get("b")!).toBeGreaterThan(idf.get("a")!);
  });
});

describe("cosineSimilarity", () => {
  test("dokumen identik menghasilkan 1", () => {
    const docs = [
      ["alpha", "beta", "gamma"],
      ["alpha", "beta", "gamma"],
      ["delta", "epsilon", "zeta"],
    ];
    const idf = computeIDF(docs);
    const tfA = computeTF(docs[0]);
    const tfB = computeTF(docs[1]);
    expect(cosineSimilarity(tfA, tfB, idf)).toBeCloseTo(1, 5);
  });

  test("tanpa term overlap menghasilkan 0", () => {
    const docs = [
      ["alpha", "beta"],
      ["gamma", "delta"],
    ];
    const idf = computeIDF(docs);
    const tfA = computeTF(docs[0]);
    const tfB = computeTF(docs[1]);
    expect(cosineSimilarity(tfA, tfB, idf)).toBe(0);
  });

  test("vektor kosong (denominator 0) menghasilkan 0", () => {
    expect(cosineSimilarity(new Map(), new Map(), new Map())).toBe(0);
  });
});

describe("computeSimilarityMatrix", () => {
  test("matriks simetris dengan diagonal self-similarity", () => {
    const docs = [
      ["alpha", "beta", "gamma"],
      ["alpha", "beta", "delta"],
    ];
    const { tfVectors, idfVector } = computeTFIDFVectors(docs);
    const matrix = computeSimilarityMatrix(tfVectors, idfVector);
    expect(matrix.length).toBe(2);
    expect(matrix[0][1]).toBeCloseTo(matrix[1][0], 10);
  });
});
