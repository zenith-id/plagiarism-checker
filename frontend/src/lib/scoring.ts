import type { Settings } from "./api";

export type ScoreStatus = "high" | "medium" | "safe";

export function getScoreStatus(score: number, settings?: Settings): ScoreStatus {
  const threshold = settings?.thresholdDanger ?? 80;
  const warning = settings?.thresholdWarning ?? 60;
  if (score >= threshold) return "high";
  if (score >= warning) return "medium";
  return "safe";
}

export function getScoreColor(score: number, settings?: Settings): string {
  const status = getScoreStatus(score, settings);
  if (status === "high") return "text-error";
  if (status === "medium") return "text-warning";
  return "text-success";
}

export function getScoreBg(score: number, settings?: Settings): string {
  const status = getScoreStatus(score, settings);
  if (status === "high") return "bg-error/10 border-error/20";
  if (status === "medium") return "bg-warning/10 border-warning/20";
  return "bg-success/10 border-success/20";
}

export interface StatusBadge {
  label: string;
  bg: string;
}

export function getStatusBadge(score: number, settings?: Settings): StatusBadge {
  const status = getScoreStatus(score, settings);
  if (status === "high")
    return {
      label: "Plagiarisme Tinggi",
      bg: "bg-error/10 text-error border border-error/30",
    };
  if (status === "medium")
    return {
      label: "Plagiarisme Sedang",
      bg: "bg-warning/10 text-warning border border-warning/30",
    };
  return {
    label: "Aman",
    bg: "bg-success/10 text-success border border-success/30",
  };
}

export function getMetadataBadgeClass(status: string): string {
  return status === "Mencurigakan"
    ? "bg-error/10 text-error"
    : "bg-success/10 text-success";
}
