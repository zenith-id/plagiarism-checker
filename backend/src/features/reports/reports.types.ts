export interface ReportSummary {
  totalFiles: number;
  totalPairs: number;
  highRisk: number;
  mediumRisk: number;
  safe: number;
  avgScore: number;
  threshold: number;
  warning: number;
}
