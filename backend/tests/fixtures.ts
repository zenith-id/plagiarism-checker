import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// ponytail: path fixture relatif dari backend/tests -> ../../assets/files
export const FIXTURES_DIR = join(import.meta.dir, "..", "..", "assets", "files");

function bySize(a: string, b: string): number {
  return statSync(join(FIXTURES_DIR, a)).size - statSync(join(FIXTURES_DIR, b)).size;
}

export function listFixtures(ext?: string): string[] {
  const all = readdirSync(FIXTURES_DIR).filter((f) => statSync(join(FIXTURES_DIR, f)).isFile());
  const filtered = ext ? all.filter((f) => f.toLowerCase().endsWith(ext)) : all;
  return filtered.sort(bySize);
}

export function selectSample(): string[] {
  if (process.env.TEST_ALL_FILES === "1") return listFixtures();
  return [
    ...listFixtures(".txt").slice(0, 2),
    ...listFixtures(".docx").slice(0, 2),
    ...listFixtures(".pdf").slice(0, 1),
  ];
}

export function readFixture(name: string): Buffer {
  return readFileSync(join(FIXTURES_DIR, name));
}
