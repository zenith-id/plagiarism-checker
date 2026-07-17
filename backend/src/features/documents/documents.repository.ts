import { state } from "../../shared/state/app-state";
import type { ParsedFile } from "./documents.parser";

export function appendFiles(files: ParsedFile[]) {
  state.files = [...state.files, ...files];
}

export function clearStoredFiles() {
  state.files = [];
  state.results = [];
}
