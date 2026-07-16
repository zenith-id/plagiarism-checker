import { AppError } from "../../shared/errors/AppError";
import { successResponse } from "../../shared/utils/response";
import type { ParsedFile } from "../documents/documents.parser";
import {
  findAnalysisFileById,
  findAnalysisPairResult,
  getAnalysisSettings,
  listAnalysisFiles,
  listAnalysisResults,
  saveAnalysisResults,
} from "./analysis.repository";
import { analyzeSimilarity } from "./similarity.service";
import type { PairDetailResponse, RankedFile } from "./analysis.types";
import type { SimilarityResult } from "./similarity.service";

export function checkMetadataSuspicion(metadata: Record<string, string>): {
  status: string;
  reason: string;
} {
  const lastModifiedBy = metadata.lastSavedBy || metadata.lastModifiedBy || "";
  const author = metadata.author || metadata.creator || "";
  const authors = metadata.authors || "";

  if (!lastModifiedBy || (!author && !authors)) {
    return { status: "Aman", reason: "Metadata tidak lengkap" };
  }

  const authorList = authors
    ? authors.split(",").map((item) => item.trim())
    : [author];
  for (const item of authorList) {
    if (item.toLowerCase() === lastModifiedBy.toLowerCase()) {
      return { status: "Aman", reason: "LastModifiedBy sama dengan Author" };
    }
  }

  return {
    status: "Mencurigakan",
    reason: "LastModifiedBy berbeda dengan Author",
  };
}

export function getFileRanking(
  files: ParsedFile[],
  results: SimilarityResult[],
): RankedFile[] {
  const fileMap = new Map<
    string,
    { similarities: number[]; metadata: Record<string, string>; name: string }
  >();

  for (const file of files) {
    fileMap.set(file.id, {
      similarities: [],
      metadata: file.metadata,
      name: file.name,
    });
  }

  for (const result of results) {
    const entryA = fileMap.get(result.fileAId);
    const entryB = fileMap.get(result.fileBId);
    if (entryA) entryA.similarities.push(result.normalScore);
    if (entryB) entryB.similarities.push(result.normalScore);
  }

  const ranking: RankedFile[] = [];
  for (const [id, data] of fileMap.entries()) {
    const maxSimilarity =
      data.similarities.length > 0 ? Math.max(...data.similarities) : 0;
    const avgSimilarity =
      data.similarities.length > 0
        ? Math.round(
            (data.similarities.reduce((a, b) => a + b, 0) /
              data.similarities.length) *
              100,
          ) / 100
        : 0;
    const metaCheck = checkMetadataSuspicion(data.metadata);

    ranking.push({
      id,
      name: data.name,
      maxSimilarity,
      avgSimilarity,
      pairCount: data.similarities.length,
      metadataStatus: metaCheck.status,
      metadataReason: metaCheck.reason,
      lastModifiedBy:
        data.metadata.lastSavedBy || data.metadata.lastModifiedBy || "-",
      author:
        data.metadata.author ||
        data.metadata.creator ||
        data.metadata.authors ||
        "-",
    });
  }

  return ranking.sort((a, b) => b.maxSimilarity - a.maxSimilarity);
}

export function detectDirection(
  fileA: ParsedFile,
  fileB: ParsedFile,
  result?: SimilarityResult,
): string {
  if (!result) return "Tidak dapat ditentukan";

  const lenA = fileA.content.length;
  const lenB = fileB.content.length;
  if (lenA > lenB * 1.5)
    return `${fileB.name} kemungkinan menyalin dari ${fileA.name}`;
  if (lenB > lenA * 1.5)
    return `${fileA.name} kemungkinan menyalin dari ${fileB.name}`;

  const dateA = fileA.metadata.created
    ? new Date(fileA.metadata.created).getTime()
    : 0;
  const dateB = fileB.metadata.created
    ? new Date(fileB.metadata.created).getTime()
    : 0;
  if (dateA && dateB) {
    if (dateA < dateB)
      return `${fileB.name} kemungkinan menyalin dari ${fileA.name}`;
    if (dateB < dateA)
      return `${fileA.name} kemungkinan menyalin dari ${fileB.name}`;
  }

  return "Arah tidak dapat ditentukan (dokumen serupa panjang/waktu)";
}

export function runAnalysis(courseName: string) {
  const files = listAnalysisFiles();
  if (files.length < 2)
    throw new AppError("Minimal 2 file untuk analisis", 400);

  const settings = getAnalysisSettings();
  const exclusions = settings.courseExclusions[courseName] || [];
  const results = analyzeSimilarity(files, exclusions);
  saveAnalysisResults(results);

  return successResponse("Analisis selesai", {
    totalPairs: results.length,
    results,
  });
}

export function getAnalysisResults(threshold: number) {
  const files = listAnalysisFiles();
  const results = listAnalysisResults();
  const settings = getAnalysisSettings();

  return {
    files,
    results:
      threshold > 0
        ? results.filter((result) => result.normalScore >= threshold)
        : results,
    settings,
  };
}

export function getRanking() {
  return {
    ranking: getFileRanking(listAnalysisFiles(), listAnalysisResults()),
  };
}

export function getPairDetail(idA: string, idB: string): PairDetailResponse {
  const fileA = findAnalysisFileById(idA);
  const fileB = findAnalysisFileById(idB);
  if (!fileA || !fileB) throw new AppError("File tidak ditemukan", 404);

  const fileAMetadata = checkMetadataSuspicion(fileA.metadata);
  const fileBMetadata = checkMetadataSuspicion(fileB.metadata);
  const similarity = findAnalysisPairResult(idA, idB);

  return {
    fileA: {
      ...fileA,
      metadataStatus: fileAMetadata.status,
      metadataReason: fileAMetadata.reason,
    },
    fileB: {
      ...fileB,
      metadataStatus: fileBMetadata.status,
      metadataReason: fileBMetadata.reason,
    },
    similarity: similarity || {
      normalScore: 0,
      strictScore: 0,
      wordOverlap: 0,
      matchedRanges: [],
    },
    direction: detectDirection(fileA, fileB, similarity),
  };
}
