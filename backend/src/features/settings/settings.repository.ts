import { state } from "../../shared/state/app-state";
import type { AppSettings } from "./settings.types";

export function getSettingsState() {
  return state.settings;
}

export function updateSettingsState(nextSettings: AppSettings) {
  state.settings = nextSettings;
}

export function setCourseExclusions(course: string, words: string[]) {
  state.settings.courseExclusions[course] = words;
}
