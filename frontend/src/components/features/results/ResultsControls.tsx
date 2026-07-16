"use client";

import { Filter, ArrowUpDown } from "lucide-react";
import { Input } from "../../ui/Input";
import type { SortKey } from "@/lib/ranking";

export function ResultsControls({
  filterThreshold,
  setFilterThreshold,
  sortBy,
  setSortBy,
}: {
  filterThreshold: number;
  setFilterThreshold: (v: number) => void;
  sortBy: SortKey;
  setSortBy: (v: SortKey) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted" />
        <label className="text-sm text-muted">Min. Similarity:</label>
        <input
          type="range"
          min="0"
          max="100"
          value={filterThreshold}
          onChange={(e) => setFilterThreshold(Number(e.target.value))}
          className="w-32 accent-primary"
        />
        <span className="text-sm text-ink font-medium">{filterThreshold}%</span>
      </div>
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-muted" />
        <label className="text-sm text-muted">Urutkan:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="px-3 py-1.5 bg-canvas border border-hairline rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="normal">Similarity Normal</option>
          <option value="strict">Similarity Strict</option>
          <option value="overlap">Word Overlap</option>
        </select>
      </div>
    </div>
  );
}
