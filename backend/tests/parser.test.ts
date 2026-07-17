import { describe, expect, test } from "bun:test";
import { parseFile } from "../src/features/documents/documents.parser";
import { selectSample, readFixture } from "./fixtures";

const sample = selectSample();

describe("parseFile (fixture nyata)", () => {
  test("ada minimal satu file sampel", () => {
    expect(sample.length).toBeGreaterThan(0);
  });

  for (const name of sample) {
    test(
      `parse ${name}`,
      async () => {
        const parsed = await parseFile(readFixture(name), name);
        expect(typeof parsed.content).toBe("string");
        expect(typeof parsed.isOcr).toBe("boolean");
        expect(parsed.metadata).toBeInstanceOf(Object);
        if (name.toLowerCase().endsWith(".txt")) {
          expect(parsed.type).toBe("text/plain");
          expect(parsed.content.length).toBeGreaterThan(0);
        }
      },
      30000,
    );
  }
});
