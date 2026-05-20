import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ParsedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  metadata: Record<string, string>;
  isOcr: boolean;
}

export interface SimilarityResult {
  fileAId: string;
  fileBId: string;
  fileAName: string;
  fileBName: string;
  normalScore: number;
  strictScore: number;
  wordOverlap: number;
  matchedRanges: { a: [number, number]; b: [number, number] }[];
}

export interface Settings {
  thresholdSafe: number;
  thresholdWarning: number;
  thresholdDanger: number;
  courseExclusions: Record<string, string[]>;
}

export const uploadFiles = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const analyzeFiles = async (course?: string) => {
  const response = await api.post("/analyze", null, {
    params: { course },
  });
  return response.data;
};

export const getResults = async (threshold?: number) => {
  const response = await api.get("/results", {
    params: { threshold },
  });
  return response.data as { files: ParsedFile[]; results: SimilarityResult[]; settings: Settings };
};

export interface FileRanking {
  id: string;
  name: string;
  maxSimilarity: number;
  avgSimilarity: number;
  pairCount: number;
  metadataStatus: string;
  metadataReason: string;
  lastModifiedBy: string;
  author: string;
}

export interface GraphNode {
  id: string;
  name: string;
  fullName: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  score: number;
  label: string;
}

export const getGraph = async (threshold?: number) => {
  const response = await api.get("/graph", { params: { threshold } });
  return response.data as { nodes: GraphNode[]; edges: GraphEdge[] };
};

export const getRanking = async () => {
  const response = await api.get("/ranking");
  return response.data as { ranking: FileRanking[] };
};

export const getPairDetail = async (idA: string, idB: string) => {
  const response = await api.get(`/pair/${idA}/${idB}`);
  return response.data;
};

export const exportPDF = async () => {
  const response = await api.get("/export/pdf", {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "laporan-plagiarisme.pdf");
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const resetData = async () => {
  const response = await api.post("/reset");
  return response.data;
};

export const getSettings = async () => {
  const response = await api.get("/settings");
  return response.data as Settings;
};

export const updateSettings = async (settings: Partial<Settings>) => {
  const response = await api.put("/settings", settings);
  return response.data;
};

export const updateExclusions = async (course: string, words: string[]) => {
  const response = await api.post("/settings/exclusions", { course, words });
  return response.data;
};

export default api;
