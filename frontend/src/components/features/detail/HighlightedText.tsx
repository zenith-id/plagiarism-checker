"use client";

import { useState } from "react";
import { getHighlightColor } from "@/lib/highlight";
import type { SimilarityResult } from "@/lib/api";

export function HighlightedText({
  content,
  ranges,
  side,
  activeMatch,
}: {
  content: string;
  ranges: SimilarityResult["matchedRanges"];
  side: "a" | "b";
  activeMatch: number;
}) {
  if (!content)
    return <p className="text-muted text-sm italic">Tidak ada konten</p>;

  const segments: { text: string; matchIndex: number | null }[] = [];
  let lastIndex = 0;

  const sortedRanges = [...ranges]
    .map((r, i) => ({ ...r, index: i }))
    .sort((a, b) => (side === "a" ? a.a[0] - b.a[0] : a.b[0] - b.b[0]));

  for (const range of sortedRanges) {
    const [start, end] = side === "a" ? range.a : range.b;
    if (start > lastIndex)
      segments.push({ text: content.slice(lastIndex, start), matchIndex: null });
    segments.push({ text: content.slice(start, end), matchIndex: range.index });
    lastIndex = end;
  }

  if (lastIndex < content.length)
    segments.push({ text: content.slice(lastIndex), matchIndex: null });

  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap">
      {segments.map((seg, i) =>
        seg.matchIndex !== null ? (
          <mark
            key={i}
            data-match={seg.matchIndex}
            className={`px-0.5 rounded ring-1 transition-colors ${getHighlightColor(
              side,
              seg.matchIndex,
            )} ${seg.matchIndex === activeMatch ? "ring-2 ring-offset-1" : ""}`}
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </div>
  );
}

export function DiffPane({
  file,
  side,
  ranges,
  activeMatch,
  paneRef,
}: {
  file: { name: string; content: string };
  side: "a" | "b";
  ranges: SimilarityResult["matchedRanges"];
  activeMatch: number;
  paneRef: React.RefObject<HTMLDivElement | null>;
}) {
  const dotColor = side === "a" ? "bg-rose-400" : "bg-orange-400";
  return (
    <div className="bg-canvas rounded-lg border border-hairline">
      <div className="p-4 border-b border-hairline flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${dotColor}`} />
          <h3 className="text-sm font-medium truncate">{file.name}</h3>
        </div>
        <span className="text-xs text-muted-soft">
          {(file.content.length / 1024).toFixed(1)} KB
        </span>
      </div>
      <div ref={paneRef} className="p-4 max-h-[500px] overflow-y-auto">
        <HighlightedText
          content={file.content}
          ranges={ranges}
          side={side}
          activeMatch={activeMatch}
        />
      </div>
    </div>
  );
}
