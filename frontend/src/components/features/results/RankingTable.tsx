import Link from "next/link";
import { FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { Card } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import {
  getScoreColor,
  getScoreBg,
  getStatusBadge,
  getMetadataBadgeClass,
} from "@/lib/scoring";
import { findOtherId } from "@/lib/ranking";
import type { FileRanking, SimilarityResult } from "@/lib/api";

export function RankingTable({
  ranking,
  totalFiles,
  results,
}: {
  ranking: FileRanking[];
  totalFiles: number;
  results: SimilarityResult[];
}) {
  return (
    <section id="ranking" className="scroll-mt-24">
      <h2 className="text-lg font-display mb-4 text-ink flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        Ranking per File ({ranking.length}/{totalFiles})
      </h2>
      <Card className="overflow-hidden">
        <div className="border-b border-hairline bg-canvas px-4 py-3 text-xs text-muted">
          Semua file ditampilkan pada ranking, termasuk file dengan similarity 0%.
        </div>
        <div className="grid gap-3 p-3 md:hidden">
          {ranking.map((file, idx) => (
            <MobileRankingCard key={file.id} file={file} results={results} idx={idx} />
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-canvas-soft border-b border-hairline">
                {["#", "File", "Status", "Similarity", "Rata-rata", "Metadata", "Last Modified By", "Detail"].map(
                  (h) => (
                    <th
                      key={h}
                      className="p-3 text-left text-muted font-medium text-xs uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {ranking.map((file, idx) => (
                <DesktopRankingRow key={file.id} file={file} results={results} idx={idx} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

function MetadataBadge({ status }: { status: string }) {
  return (
    <Badge
      className={`inline-flex items-center gap-1 ${getMetadataBadgeClass(status)}`}
    >
      {status === "Mencurigakan" ? (
        <AlertTriangle className="w-3 h-3" />
      ) : (
        <CheckCircle className="w-3 h-3" />
      )}
      {status}
    </Badge>
  );
}

function MobileRankingCard({
  file,
  results,
  idx,
}: {
  file: FileRanking;
  results: SimilarityResult[];
  idx: number;
}) {
  const status = getStatusBadge(file.maxSimilarity);
  const otherId = findOtherId(results, file.id);
  return (
    <div className="rounded-xl border border-hairline bg-canvas p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">#{idx + 1}</p>
          <p className="mt-1 truncate text-sm font-medium text-ink" title={file.name}>
            {file.name}
          </p>
        </div>
        <div className={`rounded-lg px-3 py-2 text-right ${getScoreBg(file.maxSimilarity)}`}>
          <p className="text-[11px] uppercase tracking-wide text-muted">Similarity</p>
          <p className={`text-lg font-display font-semibold ${getScoreColor(file.maxSimilarity)}`}>
            {file.maxSimilarity}%
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge className={status.bg}>{status.label}</Badge>
        <MetadataBadge status={file.metadataStatus} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-canvas-card px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-muted">Rata-rata</p>
          <p className="mt-1 font-medium text-ink">{file.avgSimilarity}%</p>
        </div>
        <div className="rounded-lg bg-canvas-card px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-muted">Jumlah Pair</p>
          <p className="mt-1 font-medium text-ink">{file.pairCount}</p>
        </div>
      </div>
      <div className="rounded-lg bg-canvas-card px-3 py-2 text-sm">
        <p className="text-[11px] uppercase tracking-wide text-muted">Last Modified By</p>
        <p className="mt-1 truncate text-ink">{file.lastModifiedBy}</p>
      </div>
      {otherId ? (
        <Link
          href={`/detail/${file.id}/${otherId}`}
          className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          Buka Detail
        </Link>
      ) : (
        <span className="inline-flex rounded-lg bg-canvas-card px-3 py-2 text-xs text-muted">
          Belum ada pasangan
        </span>
      )}
    </div>
  );
}

function DesktopRankingRow({
  file,
  results,
  idx,
}: {
  file: FileRanking;
  results: SimilarityResult[];
  idx: number;
}) {
  const status = getStatusBadge(file.maxSimilarity);
  const otherId = findOtherId(results, file.id);
  return (
    <tr className="border-b border-hairline/50 last:border-0 hover:bg-canvas-soft/50 transition-colors">
      <td className="p-3 text-muted text-xs">{idx + 1}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted shrink-0" />
          <span className="truncate max-w-[180px]" title={file.name}>
            {file.name}
          </span>
        </div>
      </td>
      <td className="p-3">
        <Badge className={status.bg}>{status.label}</Badge>
      </td>
      <td className="p-3">
        <span className={`font-display font-semibold ${getScoreColor(file.maxSimilarity)}`}>
          {file.maxSimilarity}%
        </span>
      </td>
      <td className="p-3 text-body font-medium">{file.avgSimilarity}%</td>
      <td className="p-3">
        <MetadataBadge status={file.metadataStatus} />
      </td>
      <td className="p-3 text-muted text-xs max-w-[150px] truncate">
        {file.lastModifiedBy}
      </td>
      <td className="p-3">
        {otherId ? (
          <Link
            href={`/detail/${file.id}/${otherId}`}
            className="px-3 py-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-xs font-medium"
          >
            Buka
          </Link>
        ) : (
          <span className="text-muted-soft text-xs">-</span>
        )}
      </td>
    </tr>
  );
}
