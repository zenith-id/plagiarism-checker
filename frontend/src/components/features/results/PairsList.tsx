import Link from "next/link";
import { Users } from "lucide-react";
import {
  getScoreColor,
  getScoreBg,
  getStatusBadge,
} from "@/lib/scoring";
import type { SimilarityResult } from "@/lib/api";

export function PairsList({ results }: { results: SimilarityResult[] }) {
  return (
    <section id="pairs" className="scroll-mt-24">
      <h2 className="text-lg font-display mb-4 text-ink flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        Daftar Pasangan ({results.length})
      </h2>
      <div className="space-y-2">
        <div className="grid gap-3 md:hidden">
          {results.map((result, i) => (
            <MobilePairCard key={i} result={result} index={i} />
          ))}
        </div>
        <div className="hidden space-y-2 md:block">
          {results.map((result, i) => (
            <DesktopPairCard key={i} result={result} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MobilePairCard({ result, index }: { result: SimilarityResult; index: number }) {
  const status = getStatusBadge(result.normalScore);
  return (
    <Link
      href={`/detail/${result.fileAId}/${result.fileBId}`}
      className="block rounded-xl border border-hairline bg-canvas-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">Pasangan #{index + 1}</p>
          <p className="mt-1 truncate text-sm font-medium text-ink">{result.fileAName}</p>
          <p className="truncate text-sm text-muted">{result.fileBName}</p>
        </div>
        <div className={`rounded-lg px-3 py-2 text-right ${getScoreBg(result.normalScore)}`}>
          <p className="text-[11px] uppercase tracking-wide text-muted">Normal</p>
          <p className={`text-lg font-display font-semibold ${getScoreColor(result.normalScore)}`}>
            {result.normalScore}%
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${status.bg}`}>
          {status.label}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-canvas px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-muted">Strict</p>
          <p className={`mt-1 font-medium ${getScoreColor(result.strictScore)}`}>
            {result.strictScore}%
          </p>
        </div>
        <div className="rounded-lg bg-canvas px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-muted">Overlap</p>
          <p className={`mt-1 font-medium ${getScoreColor(result.wordOverlap)}`}>
            {result.wordOverlap}%
          </p>
        </div>
      </div>
      <div className="mt-3 inline-flex rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
        Buka Perbandingan
      </div>
    </Link>
  );
}

function DesktopPairCard({ result }: { result: SimilarityResult }) {
  const status = getStatusBadge(result.normalScore);
  return (
    <Link
      href={`/detail/${result.fileAId}/${result.fileBId}`}
      className="block p-4 bg-canvas-card rounded-xl border border-hairline hover:border-primary/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">
            {result.fileAName} ↔ {result.fileBName}
          </p>
          <div className="flex gap-4 mt-1.5">
            <span className="text-xs text-muted">
              Strict: <span className={getScoreColor(result.strictScore)}>{result.strictScore}%</span>
            </span>
            <span className="text-xs text-muted">
              Overlap: <span className={getScoreColor(result.wordOverlap)}>{result.wordOverlap}%</span>
            </span>
          </div>
        </div>
        <div className="text-right ml-4 flex items-center gap-3">
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${status.bg}`}>
            {status.label}
          </span>
          <div className={`inline-flex items-center justify-center w-16 h-10 rounded-lg ${getScoreBg(result.normalScore)}`}>
            <p className={`text-lg font-display font-semibold ${getScoreColor(result.normalScore)}`}>
              {result.normalScore}%
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
