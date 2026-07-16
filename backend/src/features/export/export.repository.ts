import { state } from "../../shared/state/app-state";

export function getReportState() {
  return {
    files: state.files,
    results: state.results,
    settings: state.settings,
  };
}
