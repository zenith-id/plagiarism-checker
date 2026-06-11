import type { SimilarityResult } from "../../features/analysis/similarity.service";
import type { ParsedFile } from "../../features/files/files.parser";
import type { AppSettings } from "../../features/settings/settings.types";

export interface AppState {
  files: ParsedFile[];
  results: SimilarityResult[];
  settings: AppSettings;
}

export const MAX_FILES = 200;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const state: AppState = {
  files: [],
  results: [],
  settings: {
    thresholdSafe: 30,
    thresholdWarning: 60,
    thresholdDanger: 80,
    courseExclusions: {},
  },
};
