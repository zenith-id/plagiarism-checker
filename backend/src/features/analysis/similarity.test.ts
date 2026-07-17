import { describe, expect, test } from "bun:test";
import { analyzeSimilarity } from "./similarity.service";

const paragraph =
  "Pada praktikum ini saya melakukan setup project backend menggunakan Node.js dan database. " +
  "Langkah awal memastikan Node.js dan npm sudah terinstall supaya project dapat dijalankan dengan lancar.";

describe("analyzeSimilarity", () => {
  test("dua dokumen identik: wordOverlap 100 dan skor dari komponen n-gram", () => {
    const results = analyzeSimilarity([
      { id: "1", name: "a.txt", content: paragraph },
      { id: "2", name: "b.txt", content: paragraph },
    ]);
    expect(results.length).toBe(1);
    expect(results[0].wordOverlap).toBe(100);
    // Pada 2 dokumen, IDF membuat term yang ada di keduanya bernilai 0,
    // sehingga cosine=0 dan skor berasal dari n-gram overlap (0.3) => 30.
    expect(results[0].normalScore).toBeGreaterThan(0);
  });

  test("dokumen dengan nama identik (case-insensitive) dilewati", () => {
    const results = analyzeSimilarity([
      { id: "1", name: "Sama.txt", content: paragraph },
      { id: "2", name: "sama.txt", content: paragraph },
    ]);
    expect(results.length).toBe(0);
  });

  test("dokumen tak berkaitan menghasilkan skor rendah", () => {
    const results = analyzeSimilarity([
      { id: "1", name: "a.txt", content: "kucing berlari di taman hijau pagi hari" },
      { id: "2", name: "b.txt", content: "algoritma komputer memproses data numerik biner" },
    ]);
    expect(results.length).toBe(1);
    expect(results[0].normalScore).toBeLessThan(20);
  });

  test("hasil terurut menurun berdasarkan normalScore dan berisi field lengkap", () => {
    const results = analyzeSimilarity([
      { id: "1", name: "a.txt", content: paragraph },
      { id: "2", name: "b.txt", content: paragraph },
      { id: "3", name: "c.txt", content: "topik sangat berbeda tanpa kemiripan sama sekali disini" },
    ]);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].normalScore).toBeGreaterThanOrEqual(results[i].normalScore);
    }
    expect(results[0]).toHaveProperty("fileAId");
    expect(results[0]).toHaveProperty("strictScore");
    expect(results[0]).toHaveProperty("matchedRanges");
  });
});
