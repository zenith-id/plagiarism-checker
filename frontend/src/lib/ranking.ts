import type { ParsedFile, FileRanking } from "./api";

export function getCompleteRanking(
  files: ParsedFile[],
  ranking: FileRanking[],
): FileRanking[] {
  const rankingById = new Map(ranking.map((item) => [item.id, item]));
  const fileOrder = new Map(files.map((file, index) => [file.id, index]));

  return files
    .map((file) => {
      const ranked = rankingById.get(file.id);
      if (ranked) return ranked;

      return {
        id: file.id,
        name: file.name,
        maxSimilarity: 0,
        avgSimilarity: 0,
        pairCount: 0,
        metadataStatus: "Aman",
        metadataReason: "Belum ada pasangan pembanding",
        lastModifiedBy:
          file.metadata.lastSavedBy || file.metadata.lastModifiedBy || "-",
        author:
          file.metadata.author ||
          file.metadata.creator ||
          file.metadata.authors ||
          "-",
      } satisfies FileRanking;
    })
    .sort((a, b) => {
      if (b.maxSimilarity !== a.maxSimilarity)
        return b.maxSimilarity - a.maxSimilarity;
      return (fileOrder.get(a.id) || 0) - (fileOrder.get(b.id) || 0);
    });
}

export type SortKey = "normal" | "strict" | "overlap";

export function sortResults<T extends { normalScore: number; strictScore: number; wordOverlap: number }>(
  results: T[],
  sortBy: SortKey,
): T[] {
  return [...results].sort((a, b) => {
    if (sortBy === "normal") return b.normalScore - a.normalScore;
    if (sortBy === "strict") return b.strictScore - a.strictScore;
    return b.wordOverlap - a.wordOverlap;
  });
}

export interface AnalysisSummary {
  totalFiles: number;
  totalPairs: number;
  highRiskCount: number;
  mediumRiskCount: number;
  safeCount: number;
  avgSimilarity: number;
}

export function computeSummary(
  results: { normalScore: number }[],
  totalFiles: number,
  settings?: { thresholdDanger?: number; thresholdWarning?: number },
): AnalysisSummary {
  const totalPairs = results.length;
  const threshold = settings?.thresholdDanger ?? 80;
  const warning = settings?.thresholdWarning ?? 60;
  const highRiskCount = results.filter((r) => r.normalScore >= threshold).length;
  const mediumRiskCount = results.filter(
    (r) => r.normalScore >= warning && r.normalScore < threshold,
  ).length;
  const safeCount = results.filter((r) => r.normalScore < warning).length;
  const avgSimilarity =
    totalPairs > 0
      ? Math.round(
          (results.reduce((sum, r) => sum + r.normalScore, 0) / totalPairs) *
            100,
        ) / 100
      : 0;
  return {
    totalFiles,
    totalPairs,
    highRiskCount,
    mediumRiskCount,
    safeCount,
    avgSimilarity,
  };
}

export function findOtherId(
  results: { fileAId: string; fileBId: string }[],
  fileId: string,
): string | null {
  const pair = results.find((r) => r.fileAId === fileId || r.fileBId === fileId);
  if (!pair) return null;
  return pair.fileAId === fileId ? pair.fileBId : pair.fileAId;
}
