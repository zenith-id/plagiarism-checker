import { BarChart3 } from "lucide-react";
import { Card } from "../../ui/Card";
import { getScoreColor } from "@/lib/scoring";
import type { AnalysisSummary } from "@/lib/ranking";

export function SummaryCards({ summary }: { summary: AnalysisSummary }) {
  const items = [
    { label: "Total File", value: summary.totalFiles, className: "text-ink" },
    { label: "Total Pasangan", value: summary.totalPairs, className: "text-ink" },
    {
      label: "Rata-rata Similarity",
      value: `${summary.avgSimilarity}%`,
      className: getScoreColor(summary.avgSimilarity),
    },
    {
      label: "Risiko Tinggi",
      value: summary.highRiskCount,
      className: "text-error",
    },
    { label: "Aman", value: summary.safeCount, className: "text-success" },
  ];

  return (
    <section id="summary" className="scroll-mt-24">
      <h2 className="text-lg font-display mb-4 text-ink flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        Summary Analisis
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {items.map((item) => (
          <Card key={item.label} className="p-4 text-center">
            <p className={`text-3xl font-display ${item.className}`}>
              {item.value}
            </p>
            <p className="text-xs text-muted mt-1">{item.label}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
