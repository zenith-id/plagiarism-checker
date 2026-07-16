import { getScoreColor } from "@/lib/scoring";

export function ScoreCards({
  similarity,
}: {
  similarity: { normalScore: number; strictScore: number; wordOverlap: number };
}) {
  const scoreColor = getScoreColor(similarity.normalScore);
  const items = [
    { label: "Similarity Normal", value: similarity.normalScore },
    { label: "Similarity Strict", value: similarity.strictScore },
    { label: "Word Overlap", value: similarity.wordOverlap },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-canvas-card rounded-lg p-4">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">{item.label}</p>
          <p className={`text-3xl font-display ${scoreColor}`}>{item.value}%</p>
        </div>
      ))}
    </div>
  );
}
