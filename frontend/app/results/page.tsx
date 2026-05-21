"use client";

import { useQuery } from "@tanstack/react-query";
import { getResults, getRanking, exportPDF, type SimilarityResult, type ParsedFile, type Settings, type FileRanking } from "@/lib/api";
import { FileDown, ArrowLeft, ArrowUpDown, Filter, FileText, AlertTriangle, CheckCircle, ChevronUp, BarChart3, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ResultsPage() {
  const [sortBy, setSortBy] = useState<"normal" | "strict" | "overlap">("normal");
  const [filterThreshold, setFilterThreshold] = useState(0);
  const [showFloating, setShowFloating] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["results"],
    queryFn: () => getResults(filterThreshold || undefined),
  });

  const { data: rankingData, isLoading: rankingLoading } = useQuery({
    queryKey: ["ranking"],
    queryFn: getRanking,
    enabled: !!data && data.results.length > 0,
  });

  const sortedResults: SimilarityResult[] = [...(data?.results || [])].sort((a, b) => {
    if (sortBy === "normal") return b.normalScore - a.normalScore;
    if (sortBy === "strict") return b.strictScore - a.strictScore;
    return b.wordOverlap - a.wordOverlap;
  });

  const settings: Settings | undefined = data?.settings;
  const threshold = settings?.thresholdDanger || 80;
  const warning = settings?.thresholdWarning || 60;

  const getScoreColor = (score: number) => {
    if (score >= threshold) return "text-error";
    if (score >= warning) return "text-warning";
    return "text-success";
  };

  const getScoreBg = (score: number) => {
    if (score >= threshold) return "bg-error/10 border-error/20";
    if (score >= warning) return "bg-warning/10 border-warning/20";
    return "bg-success/10 border-success/20";
  };

  const getStatusBadge = (score: number) => {
    if (score >= threshold) return { label: "Plagiarisme Tinggi", bg: "bg-error/10 text-error border border-error/30" };
    if (score >= warning) return { label: "Plagiarisme Sedang", bg: "bg-warning/10 text-warning border border-warning/30" };
    return { label: "Aman", bg: "bg-success/10 text-success border border-success/30" };
  };

  const handleExport = () => {
    exportPDF();
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted">Memuat hasil...</p>
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="text-xl text-muted mb-4">Belum ada hasil analisis</p>
        <Link href="/" className="text-primary hover:underline text-sm">
          Kembali ke halaman utama
        </Link>
      </div>
    );
  }

  const totalFiles = data.files.length;
  const totalPairs = data.results.length;
  const highRiskCount = data.results.filter((r) => r.normalScore >= threshold).length;
  const mediumRiskCount = data.results.filter((r) => r.normalScore >= warning && r.normalScore < threshold).length;
  const safeCount = data.results.filter((r) => r.normalScore < warning).length;
  const avgSimilarity = data.results.length > 0
    ? Math.round((data.results.reduce((sum, r) => sum + r.normalScore, 0) / data.results.length) * 100) / 100
    : 0;

  const ranking = getCompleteRanking(data.files, rankingData?.ranking || []);

  return (
    <div className="flex-1 flex flex-col bg-canvas">
      <header className="h-16 bg-canvas border-b border-hairline flex items-center justify-between px-6 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-md hover:bg-canvas-card transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted" />
          </Link>
          <h1 className="text-xl font-display tracking-tight text-ink">Hasil Analisis</h1>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-primary text-on-primary rounded-md hover:bg-primary-active transition-colors text-sm flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          Export PDF
        </button>
      </header>

      {showFloating && (
        <div className="fixed right-4 top-20 z-30 bg-canvas-card border border-hairline rounded-xl shadow-lg p-2 space-y-1 min-w-[140px]">
          <button
            onClick={() => scrollToSection("summary")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-canvas-soft transition-colors text-sm w-full text-left text-body"
          >
            <BarChart3 className="w-4 h-4 text-primary" />
            Summary
          </button>
          <button
            onClick={() => scrollToSection("ranking")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-canvas-soft transition-colors text-sm w-full text-left text-body"
          >
            <FileText className="w-4 h-4 text-primary" />
            Ranking
          </button>
          <button
            onClick={() => scrollToSection("pairs")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-canvas-soft transition-colors text-sm w-full text-left text-body"
          >
            <Users className="w-4 h-4 text-primary" />
            Pasangan
          </button>
          <div className="border-t border-hairline my-1" />
          <button
            onClick={() => setShowFloating(false)}
            className="flex items-center justify-center px-3 py-2 rounded-lg hover:bg-canvas-soft transition-colors text-sm w-full text-muted"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      )}

      {!showFloating && (
        <button
          onClick={() => setShowFloating(true)}
          className="fixed right-4 top-20 z-30 bg-primary text-on-primary p-3 rounded-full shadow-lg hover:bg-primary-active transition-colors"
          title="Buka navigasi"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
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
              onChange={(e) => setSortBy(e.target.value as "normal" | "strict" | "overlap")}
              className="px-3 py-1.5 bg-canvas border border-hairline rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="normal">Similarity Normal</option>
              <option value="strict">Similarity Strict</option>
              <option value="overlap">Word Overlap</option>
            </select>
          </div>
        </div>

        <section id="summary" className="scroll-mt-24">
          <h2 className="text-lg font-display mb-4 text-ink flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Summary Analisis
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-canvas-card rounded-xl p-4 text-center border border-hairline">
              <p className="text-3xl font-display text-ink">{totalFiles}</p>
              <p className="text-xs text-muted mt-1">Total File</p>
            </div>
            <div className="bg-canvas-card rounded-xl p-4 text-center border border-hairline">
              <p className="text-3xl font-display text-ink">{totalPairs}</p>
              <p className="text-xs text-muted mt-1">Total Pasangan</p>
            </div>
            <div className="bg-canvas-card rounded-xl p-4 text-center border border-hairline">
              <p className={`text-3xl font-display ${getScoreColor(avgSimilarity)}`}>{avgSimilarity}%</p>
              <p className="text-xs text-muted mt-1">Rata-rata Similarity</p>
            </div>
            <div className="bg-canvas-card rounded-xl p-4 text-center border border-hairline">
              <p className="text-3xl font-display text-error">{highRiskCount}</p>
              <p className="text-xs text-muted mt-1">Risiko Tinggi</p>
            </div>
            <div className="bg-canvas-card rounded-xl p-4 text-center border border-hairline">
              <p className="text-3xl font-display text-success">{safeCount}</p>
              <p className="text-xs text-muted mt-1">Aman</p>
            </div>
          </div>
        </section>

        <section id="ranking" className="scroll-mt-24">
          <h2 className="text-lg font-display mb-4 text-ink flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Ranking per File ({ranking.length}/{totalFiles})
          </h2>
          {rankingLoading ? (
            <div className="bg-canvas-card rounded-xl p-8 text-center text-muted">Memuat ranking...</div>
          ) : ranking.length === 0 ? (
            <div className="bg-canvas-card rounded-xl p-8 text-center text-muted">Tidak ada data ranking</div>
          ) : (
            <div className="bg-canvas-card rounded-xl border border-hairline overflow-hidden">
              <div className="border-b border-hairline bg-canvas px-4 py-3 text-xs text-muted">
                Semua file ditampilkan pada ranking, termasuk file dengan similarity 0%.
              </div>
              <div className="grid gap-3 p-3 md:hidden">
                {ranking.map((file: FileRanking, idx: number) => {
                  const status = getStatusBadge(file.maxSimilarity);
                  const firstPair = data?.results.find(
                    (r) => r.fileAId === file.id || r.fileBId === file.id
                  );
                  const otherId = firstPair
                    ? firstPair.fileAId === file.id
                      ? firstPair.fileBId
                      : firstPair.fileAId
                    : null;

                  return (
                    <div key={file.id} className="rounded-xl border border-hairline bg-canvas p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-muted">#{idx + 1}</p>
                          <p className="mt-1 truncate text-sm font-medium text-ink" title={file.name}>{file.name}</p>
                        </div>
                        <div className={`rounded-lg px-3 py-2 text-right ${getScoreBg(file.maxSimilarity)}`}>
                          <p className="text-[11px] uppercase tracking-wide text-muted">Similarity</p>
                          <p className={`text-lg font-display font-semibold ${getScoreColor(file.maxSimilarity)}`}>
                            {file.maxSimilarity}%
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${status.bg}`}>
                          {status.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          file.metadataStatus === "Mencurigakan" ? "bg-error/10 text-error" : "bg-success/10 text-success"
                        }`}>
                          {file.metadataStatus === "Mencurigakan" ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {file.metadataStatus}
                        </span>
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
                })}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-canvas-soft border-b border-hairline">
                      <th className="p-3 text-left text-muted font-medium text-xs uppercase tracking-wide">#</th>
                      <th className="p-3 text-left text-muted font-medium text-xs uppercase tracking-wide">File</th>
                      <th className="p-3 text-left text-muted font-medium text-xs uppercase tracking-wide">Status</th>
                      <th className="p-3 text-left text-muted font-medium text-xs uppercase tracking-wide">Similarity</th>
                      <th className="p-3 text-left text-muted font-medium text-xs uppercase tracking-wide">Rata-rata</th>
                      <th className="p-3 text-left text-muted font-medium text-xs uppercase tracking-wide">Metadata</th>
                      <th className="p-3 text-left text-muted font-medium text-xs uppercase tracking-wide">Last Modified By</th>
                      <th className="p-3 text-left text-muted font-medium text-xs uppercase tracking-wide">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((file: FileRanking, idx: number) => {
                      const status = getStatusBadge(file.maxSimilarity);
                      return (
                        <tr key={file.id} className="border-b border-hairline/50 last:border-0 hover:bg-canvas-soft/50 transition-colors">
                          <td className="p-3 text-muted text-xs">{idx + 1}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted shrink-0" />
                              <span className="truncate max-w-[180px]" title={file.name}>{file.name}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${status.bg}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`font-display font-semibold ${getScoreColor(file.maxSimilarity)}`}>
                              {file.maxSimilarity}%
                            </span>
                          </td>
                          <td className="p-3 text-body font-medium">{file.avgSimilarity}%</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              file.metadataStatus === "Mencurigakan"
                                ? "bg-error/10 text-error"
                                : "bg-success/10 text-success"
                            }`}>
                              {file.metadataStatus === "Mencurigakan" ? (
                                <AlertTriangle className="w-3 h-3" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              {file.metadataStatus}
                            </span>
                          </td>
                          <td className="p-3 text-muted text-xs max-w-[150px] truncate">{file.lastModifiedBy}</td>
                          <td className="p-3">
                            {(() => {
                              const firstPair = data?.results.find(
                                (r) => r.fileAId === file.id || r.fileBId === file.id
                              );
                              if (!firstPair) return <span className="text-muted-soft text-xs">-</span>;
                              const otherId = firstPair.fileAId === file.id ? firstPair.fileBId : firstPair.fileAId;
                              return (
                                <Link
                                  href={`/detail/${file.id}/${otherId}`}
                                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-xs font-medium"
                                >
                                  Buka
                                </Link>
                              );
                            })()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section id="pairs" className="scroll-mt-24">
          <h2 className="text-lg font-display mb-4 text-ink flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Daftar Pasangan ({sortedResults.length})
          </h2>
          <div className="space-y-2">
            <div className="grid gap-3 md:hidden">
              {sortedResults.map((result: SimilarityResult, i: number) => {
                const status = getStatusBadge(result.normalScore);
                return (
                  <Link
                    key={i}
                    href={`/detail/${result.fileAId}/${result.fileBId}`}
                    className="block rounded-xl border border-hairline bg-canvas-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-muted">Pasangan #{i + 1}</p>
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
                        <p className={`mt-1 font-medium ${getScoreColor(result.strictScore)}`}>{result.strictScore}%</p>
                      </div>
                      <div className="rounded-lg bg-canvas px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-muted">Overlap</p>
                        <p className={`mt-1 font-medium ${getScoreColor(result.wordOverlap)}`}>{result.wordOverlap}%</p>
                      </div>
                    </div>

                    <div className="mt-3 inline-flex rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                      Buka Perbandingan
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="hidden space-y-2 md:block">
            {sortedResults.map((result: SimilarityResult, i: number) => {
              const status = getStatusBadge(result.normalScore);
              return (
                <Link
                  key={i}
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
            })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function getCompleteRanking(files: ParsedFile[], ranking: FileRanking[]) {
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
        lastModifiedBy: file.metadata.lastSavedBy || file.metadata.lastModifiedBy || "-",
        author: file.metadata.author || file.metadata.creator || file.metadata.authors || "-",
      } satisfies FileRanking;
    })
    .sort((a, b) => {
      if (b.maxSimilarity !== a.maxSimilarity) return b.maxSimilarity - a.maxSimilarity;
      return (fileOrder.get(a.id) || 0) - (fileOrder.get(b.id) || 0);
    });
}
