import { successResponse } from "../../shared/utils/response";
import { getSettingsState, setCourseExclusions, updateSettingsState } from "./settings.repository";
import type { AppSettings, SettingsExclusionInput } from "./settings.types";

export function getSettings() {
  return getSettingsState();
}

export function updateSettings(partialSettings: Partial<AppSettings>) {
  const nextSettings = { ...getSettingsState(), ...partialSettings };
  updateSettingsState(nextSettings);
  return successResponse("Pengaturan diperbarui", { settings: nextSettings });
}

export function updateExclusions(input: SettingsExclusionInput) {
  setCourseExclusions(input.course, input.words);
  return successResponse("Pengecualian diperbarui", { exclusions: getSettingsState().courseExclusions });
}
