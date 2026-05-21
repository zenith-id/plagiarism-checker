import { create } from "zustand";
import { ParsedFile, Settings } from "./api";

interface AppState {
  files: ParsedFile[];
  settings: Settings;
  selectedFiles: File[];
  courseName: string;
  isAnalyzing: boolean;
  isUploading: boolean;
  message: { type: "success" | "error" | "info"; text: string } | null;

  setFiles: (files: ParsedFile[]) => void;
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
      selectedFiles: [],
      courseName: "",
      message: null,
    }),
}));
