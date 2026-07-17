export interface AppSettings {
  thresholdSafe: number;
  thresholdWarning: number;
  thresholdDanger: number;
  courseExclusions: Record<string, string[]>;
}

export interface SettingsExclusionInput {
  course: string;
  words: string[];
}
