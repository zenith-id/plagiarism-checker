"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { uploadFiles, analyzeFiles, getResults, getRanking, getGraph, resetData, exportPDF, type FileRanking, type SimilarityResult, type Settings, type GraphNode, type GraphEdge } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { uploadSchema } from "@/lib/schemas";
import dynamic from "next/dynamic";
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, BarChart3, Settings as SettingsIcon, RotateCcw, X, FileDown, ArrowUpDown, Filter, AlertTriangle, ChevronUp, Users, GitGraph, Link2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [dragActive, setDragActive] = useState(false);
  const [sortBy, setSortBy] = useState<"normal" | "strict" | "overlap">("normal");
  const [filterThreshold, setFilterThreshold] = useState(0);
  const [showFloating, setShowFloating] = useState(false);

  const {
    selectedFiles,
    courseName,
    message,
    setSelectedFiles,
    addSelectedFiles,
    removeSelectedFile,
    setCourseName,
    setMessage,
    setResults,
  } = useAppStore();

  const { data: resultsData, refetch: refetchResults, isLoading: resultsLoading } = useQuery({
    queryKey: ["results"],
    queryFn: () => getResults(filterThreshold || undefined),
    enabled: false,
  });

  const { data: rankingData } = useQuery({
    queryKey: ["ranking"],
    queryFn: getRanking,
    enabled: !!resultsData && resultsData.results.length > 0,
  });

  const { data: graphData } = useQuery({
    queryKey: ["graph", filterThreshold],
    queryFn: () => getGraph(filterThreshold || undefined),
    enabled: !!resultsData && resultsData.results.length > 0,
  });

  useEffect(() => {
    if (resultsData?.results) {
      setResults(resultsData.results);
      setShowFloating(true);
    }
  }, [resultsData, setResults]);

  const uploadMutation = useMutation({
    mutationFn: uploadFiles,
    onSuccess: (data) => {
      setMessage({ type: "success", text: data.message });
      setSelectedFiles([]);
      refetchResults();
    },
    onError: (error: any) => {
      setMessage({ type: "error", text: error.response?.data?.error || "Gagal mengunggah file" });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: (course?: string) => analyzeFiles(course),
    onSuccess: () => {
      setMessage({ type: "success", text: "Analisis selesai!" });
      refetchResults();
    },
    onError: (error: any) => {
      setMessage({ type: "error", text: error.response?.data?.error || "Gagal menganalisis" });
    },
  });

  const resetMutation = useMutation({
    mutationFn: resetData,
    onSuccess: () => {
      setMessage({ type: "success", text: "Data berhasil direset" });
      setShowFloating(false);
      refetchResults();
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addSelectedFiles(Array.from(e.dataTransfer.files));
  }, [addSelectedFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = () => {
    const validation = uploadSchema.safeParse({ files: selectedFiles, courseName });
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message;
      setMessage({ type: "error", text: firstError || "Validasi gagal" });
      return;
    }
    uploadMutation.mutate(selectedFiles);
  };

  const handleAnalyze = () => {
    analyzeMutation.mutate(courseName || undefined);
  };

  const handleExport = () => {
    exportPDF();
  };

  const handleReset = () => {
    if (confirm("Yakin ingin mereset semua data?")) {
      resetMutation.mutate();
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const settings: Settings | undefined = resultsData?.settings;
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

  const sortedResults: SimilarityResult[] = [...(resultsData?.results || [])].sort((a, b) => {
    if (sortBy === "normal") return b.normalScore - a.normalScore;
    if (sortBy === "strict") return b.strictScore - a.strictScore;
    return b.wordOverlap - a.wordOverlap;
  });

  const totalFiles = resultsData?.files.length || 0;
  const totalPairs = resultsData?.results.length || 0;
  const highRiskCount = (resultsData?.results || []).filter((r) => r.normalScore >= threshold).length;
  const safeCount = (resultsData?.results || []).filter((r) => r.normalScore < warning).length;
  const avgSimilarity = totalPairs > 0
    ? Math.round(((resultsData?.results || []).reduce((sum, r) => sum + r.normalScore, 0) / totalPairs) * 100) / 100
    : 0;

  const ranking = rankingData?.ranking || [];
  const hasResults = totalPairs > 0;

  return (
    <div className="flex-1 flex flex-col bg-canvas">
      <header className="h-16 bg-canvas border-b border-hairline flex items-center justify-between px-6 sticky top-0 z-20">
        <h1 className="text-xl font-display tracking-tight text-ink">Pemeriksa Plagiarisme</h1>
        <div className="flex items-center gap-3">
          {hasResults && (
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-primary text-on-primary rounded-md hover:bg-primary-active transition-colors text-sm flex items-center gap-1.5"
            >
              <FileDown className="w-4 h-4" />
              Export PDF
            </button>
          )}
          <Link href="/settings" className="p-2 rounded-md hover:bg-canvas-card transition-colors">
            <SettingsIcon className="w-5 h-5 text-muted" />
          </Link>
          <button
            onClick={handleReset}
            className="p-2 rounded-md hover:bg-canvas-card transition-colors"
            title="Reset Data"
          >
            <RotateCcw className="w-5 h-5 text-muted" />
          </button>
        </div>
      </header>

      {showFloating && hasResults && (
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
            onClick={() => scrollToSection("graph")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-canvas-soft transition-colors text-sm w-full text-left text-body"
          >
            <GitGraph className="w-4 h-4 text-primary" />
            Graph
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

      {!showFloating && hasResults && (
        <button
          onClick={() => setShowFloating(true)}
          className="fixed right-4 top-20 z-30 bg-primary text-on-primary p-3 rounded-full shadow-lg hover:bg-primary-active transition-colors"
          title="Buka navigasi"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        {message && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-success/10 text-success border border-success/20"
                : "bg-error/10 text-error border border-error/20"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
            <button onClick={() => setMessage(null)} className="ml-auto text-sm underline">Tutup</button>
          </div>
        )}

        <section className="bg-canvas-card rounded-xl p-8 border border-hairline">
          <h2 className="text-2xl mb-4 text-ink">Unggah File</h2>
          <p className="text-body mb-6 text-sm">
            Format didukung: .txt, .docx, .pdf. Maksimal 200 file, 10MB per file.
          </p>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-hairline hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto text-muted mb-4" />
            <p className="text-body mb-2">Seret file ke sini atau</p>
            <label className="inline-block px-4 py-2 bg-primary text-on-primary rounded-md cursor-pointer hover:bg-primary-active transition-colors text-sm">
              Pilih File
              <input type="file" multiple accept=".txt,.docx,.pdf" onChange={handleFileSelect} className="hidden" />
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-sm text-muted">{selectedFiles.length} file dipilih</p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {selectedFiles.map((file: File, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-canvas rounded-md text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted" />
                      <span className="truncate max-w-xs">{file.name}</span>
                      <span className="text-muted-soft text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button onClick={() => removeSelectedFile(i)} className="p-1 text-error hover:text-error/80">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleUpload}
              disabled={uploadMutation.isPending || selectedFiles.length === 0}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-md hover:bg-primary-active transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              {uploadMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Mengunggah...</>
              ) : "Unggah File"}
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending}
              className="px-6 py-2.5 bg-canvas text-ink border border-hairline rounded-md hover:bg-canvas-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              {analyzeMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Menganalisis...</>
              ) : (
                <><BarChart3 className="w-4 h-4" />Analisis</>
              )}
            </button>
          </div>

          <div className="mt-4">
            <label className="text-sm text-muted block mb-1">Nama Mata Kuliah (opsional, untuk mode strict)</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Contoh: Pemrograman Web"
              className="w-full max-w-md px-3 py-2 bg-canvas border border-hairline rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </section>

        {resultsLoading && (
          <div className="bg-canvas-card rounded-xl p-8 text-center border border-hairline">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
            <p className="text-muted">Memuat hasil analisis...</p>
          </div>
        )}

        {hasResults && (
          <>
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
                Ranking per File
              </h2>
              <div className="bg-canvas-card rounded-xl border border-hairline overflow-hidden">
                <div className="overflow-x-auto">
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
                                file.metadataStatus === "Mencurigakan" ? "bg-error/10 text-error" : "bg-success/10 text-success"
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
                                const firstPair = resultsData?.results.find(
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
            </section>

            <section id="graph" className="scroll-mt-24">
              <h2 className="text-lg font-display mb-4 text-ink flex items-center gap-2">
                <GitGraph className="w-5 h-5 text-primary" />
                Graph Kemiripan
              </h2>
              <div className="bg-canvas-card rounded-xl border border-hairline p-4">
                <p className="text-xs text-muted mb-3">
                  Node = file, Edge = pasangan dengan similarity &gt;= {filterThreshold || warning}%
                </p>
                <GraphVisualization nodes={graphData?.nodes || []} edges={graphData?.edges || []} />
              </div>
            </section>

            <section id="pairs" className="scroll-mt-24">
              <h2 className="text-lg font-display mb-4 text-ink flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Daftar Pasangan ({sortedResults.length})
              </h2>
              <div className="space-y-2">
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
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function GraphVisualization({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  if (nodes.length === 0) {
    return <p className="text-center text-muted py-8">Tidak ada data graph</p>;
  }

  const getEdgeColor = (score: number) => {
    if (score >= 80) return "#c64545";
    if (score >= 60) return "#d4a017";
    return "#5db872";
  };

  const graphData = {
    nodes: nodes.map((n) => ({ ...n, val: 5 })),
    links: edges.map((e) => ({
      ...e,
      color: getEdgeColor(e.score),
      label: e.label,
    })),
  };

  return (
    <div className="w-full h-[500px] bg-canvas rounded-lg">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="fullName"
        nodeRelSize={6}
        nodeColor={() => "#cc785c"}
        nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
          const label = (node as any).name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#141413";
          ctx.fillText(label as string, (node as any).x, (node as any).y + 18);
        }}
        linkColor={(link: any) => link.color}
        linkWidth={(link: any) => {
          const score = parseFloat(link.label);
          return score >= 80 ? 3 : score >= 60 ? 2 : 1.5;
        }}
        linkLabel={(link: any) => `${link.label} similarity`}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.005}
        backgroundColor="#faf9f5"
        width={800}
        height={500}
      />
    </div>
  );
}
