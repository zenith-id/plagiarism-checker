"use client";

import { useState, useRef, useEffect } from "react";
import { getScoreColor } from "@/lib/scoring";
import { DiffPane } from "./HighlightedText";
import type { SimilarityResult } from "@/lib/api";

export function DiffViewer({
  fileA,
  fileB,
  similarity,
}: {
  fileA: { name: string; content: string };
  fileB: { name: string; content: string };
  similarity: SimilarityResult;
}) {
  const [syncScroll, setSyncScroll] = useState(true);
  const [activeMatch, setActiveMatch] = useState(0);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const scoreColor = getScoreColor(similarity.normalScore);

  useEffect(() => {
    if (!syncScroll || !leftRef.current || !rightRef.current) return;
    const handleScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
      const ratio = source.scrollTop / (source.scrollHeight - source.clientHeight || 1);
      target.scrollTop = ratio * (target.scrollHeight - target.clientHeight);
    };
    const left = leftRef.current;
    const right = rightRef.current;
    const onLeft = () => handleScroll(left, right);
    const onRight = () => handleScroll(right, left);
    left.addEventListener("scroll", onLeft);
    right.addEventListener("scroll", onRight);
    return () => {
      left.removeEventListener("scroll", onLeft);
      right.removeEventListener("scroll", onRight);
    };
  }, [syncScroll]);

  const scrollToMatch = (index: number) => {
    setActiveMatch(index);
    const leftEl = leftRef.current?.querySelector(`[data-match="${index}"]`);
    const rightEl = rightRef.current?.querySelector(`[data-match="${index}"]`);
    if (leftEl) leftEl.scrollIntoView({ behavior: "smooth", block: "center" });
    if (rightEl) rightEl.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      {similarity.matchedRanges.length > 0 && (
        <div className="bg-canvas-card rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-ink font-medium">
              {similarity.matchedRanges.length} bagian mirip ditemukan
            </p>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={syncScroll}
                onChange={(e) => setSyncScroll(e.target.checked)}
                className="rounded"
              />
              Sinkronkan scroll
            </label>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {similarity.matchedRanges.slice(0, 20).map((_, i) => (
              <button
                key={i}
                aria-label={`Lihat bagian mirip #${i + 1}`}
                onClick={() => scrollToMatch(i)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-transform active:scale-95 ${
                  i === activeMatch
                    ? "bg-primary text-on-primary"
                    : "bg-canvas text-muted hover:bg-canvas-soft"
                }`}
              >
                #{i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DiffPane
          file={fileA}
          side="a"
          ranges={similarity.matchedRanges}
          activeMatch={activeMatch}
          paneRef={leftRef}
        />
        <DiffPane
          file={fileB}
          side="b"
          ranges={similarity.matchedRanges}
          activeMatch={activeMatch}
          paneRef={rightRef}
        />
      </div>

      <div className="bg-canvas-card rounded-lg p-6">
        <h3 className="text-lg font-display mb-3 text-ink">Summary Kesimpulan</h3>
        <p className="text-sm text-body">
          Kedua dokumen memiliki tingkat kemiripan{" "}
          <span className={`font-medium ${scoreColor}`}>{similarity.normalScore}%</span> (normal) dan{" "}
          <span className={`font-medium ${scoreColor}`}>{similarity.strictScore}%</span> (strict). Word overlap
          sebesar {similarity.wordOverlap}%.
          {similarity.normalScore >= 80 && (
            <span className="text-error font-medium"> Indikasi plagiarisme tinggi.</span>
          )}
          {similarity.normalScore >= 60 && similarity.normalScore < 80 && (
            <span className="text-warning font-medium"> Perlu pemeriksaan lebih lanjut.</span>
          )}
          {similarity.normalScore < 60 && (
            <span className="text-success font-medium"> Kemiripan dalam batas wajar.</span>
          )}
        </p>
      </div>
    </>
  );
}
