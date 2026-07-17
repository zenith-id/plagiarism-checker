import { describe, expect, test } from "bun:test";
import { parseFile } from "../src/features/documents/documents.parser";
import { analyzeSimilarity } from "../src/features/analysis/similarity.service";
import { selectSample, readFixture, listFixtures } from "./fixtures";

describe("pipeline analisis (fixture nyata)", () => {
  test(
    "dua file .txt serupa menghasilkan pasangan dengan skor > 0",
    async () => {
      const txts = listFixtures(".txt").slice(0, 2);
      if (txts.length < 2) return; // ponytail: skip bila fixture .txt < 2
      const files = await Promise.all(
        txts.map(async (name) => {
          const p = await parseFile(readFixture(name), name);
          return { id: p.id, name: p.name, content: p.content };
        }),
      );
      const results = analyzeSimilarity(files);
      expect(results.length).toBe(1);
      expect(results[0].normalScore).toBeGreaterThan(0);
    },
    30000,
  );

  test(
    "sampel campuran: skor dalam 0..100 dan terurut menurun",
    async () => {
      const names = selectSample();
      const files = await Promise.all(
        names.map(async (name) => {
          const p = await parseFile(readFixture(name), name);
          return { id: p.id, name: p.name, content: p.content };
        }),
      );
      const results = analyzeSimilarity(files);
      for (const r of results) {
        expect(r.normalScore).toBeGreaterThanOrEqual(0);
        expect(r.normalScore).toBeLessThanOrEqual(100);
      }
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].normalScore).toBeGreaterThanOrEqual(results[i].normalScore);
      }
    },
    60000,
  );
});
