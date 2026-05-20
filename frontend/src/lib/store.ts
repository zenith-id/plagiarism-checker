import { create } from "zustand";
import { ParsedFile, SimilarityResult, Settings } from "./api";

interface AppState {
  files: ParsedFile[];
  results: SimilarityResult[];
  settings: Settings;
  selectedFiles: File[];
  courseName: string;
  isAnalyzing: boolean;
  isUploading: boolean;
  message: { type: "success" | "error" | "info"; text: string } | null;

  setFiles: (files: ParsedFile[]) => void;
  setResults: (results: SimilarityResult[]) => void;
  setSettings: (settings: Settings) => void;
  setSelectedFiles: (files: File[]) => void;
  addSelectedFiles: (files: File[]) => void;
  removeSelectedFile: (index: number) => void;
  setCourseName: (name: string) => void;
  setIsAnalyzing: (value: boolean) => void;
  setIsUploading: (value: boolean) => void;
  setMessage: (msg: { type: "success" | "error" | "info"; text: string } | null) => void;
  clearAll: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  files: [],
  results: [],
  settings: {
    thresholdSafe: 30,
    thresholdWarning: 60,
    thresholdDanger: 80,
    courseExclusions: {},
  },
  selectedFiles: [],
  courseName: "",
  isAnalyzing: false,
  isUploading: false,
  message: null,

  setFiles: (files) => set({ files }),
  setResults: (results) => set({ results }),
  setSettings: (settings) => set({ settings }),
  setSelectedFiles: (files) => set({ selectedFiles: files }),
  addSelectedFiles: (files) =>
    set((state) => ({ selectedFiles: [...state.selectedFiles, ...files] })),
  removeSelectedFile: (index) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.filter((_, i) => i !== index),
    })),
  setCourseName: (name) => set({ courseName: name }),
  setIsAnalyzing: (value) => set({ isAnalyzing: value }),
  setIsUploading: (value) => set({ isUploading: value }),
  setMessage: (msg) => set({ message: msg }),
  clearAll: () =>
    set({
      files: [],
      results: [],
      selectedFiles: [],
      courseName: "",
      message: null,
    }),
}));
