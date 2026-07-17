import { state } from "../../shared/state/app-state";

export function listAnalysisFiles() {
  return state.files;
}

export function listAnalysisResults() {
  return state.results;
}

export function saveAnalysisResults(results: typeof state.results) {
  state.results = results;
}

export function getAnalysisSettings() {
  return state.settings;
}

export function findAnalysisFileById(id: string) {
  return state.files.find((file) => file.id === id);
}

export function findAnalysisPairResult(idA: string, idB: string) {
  return state.results.find(
    (result) => (result.fileAId === idA && result.fileBId === idB)
      || (result.fileAId === idB && result.fileBId === idA),
  );
}
