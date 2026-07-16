/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  uploadFiles,
  analyzeFiles,
  getResults,
  getRanking,
  resetData,
  exportPDF,
  type SimilarityResult,
} from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { uploadSchema } from "@/lib/schemas";
import { Settings as SettingsIcon, RotateCcw, FileDown, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { FileUploader, CourseNameInput } from "@/components/features/upload/FileUploader";
import { SummaryCards } from "@/components/features/results/SummaryCards";
import { RankingTable } from "@/components/features/results/RankingTable";
import { PairsList } from "@/components/features/results/PairsList";
import { FloatingNav } from "@/components/features/results/FloatingNav";
import { ResultsControls } from "@/components/features/results/ResultsControls";
import { getCompleteRanking, computeSummary, sortResults, type SortKey } from "@/lib/ranking";

export default function Home() {
  const [filterThreshold, setFilterThreshold] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>("normal");
  const [showFloating, setShowFloating] = useState(false);

  const { selectedFiles, courseName, message, setSelectedFiles, setMessage } =
    useAppStore();

  const { data: resultsData, refetch: refetchResults, isLoading: resultsLoading } =
    useQuery({
      queryKey: ["results"],
      queryFn: () => getResults(filterThreshold || undefined),
      enabled: false,
    });

  const { data: rankingData } = useQuery({
    queryKey: ["ranking"],
    queryFn: getRanking,
    enabled: !!resultsData && resultsData.results.length > 0,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadFiles,
    onSuccess: (data) => {
      setMessage({ type: "success", text: data.message });
      setSelectedFiles([]);
      refetchResults().then(({ data: next }) => {
        if (next?.results) setShowFloating(true);
      });
    },
    onError: (error: any) =>
      setMessage({ type: "error", text: error.response?.data?.error || "Gagal mengunggah file" }),
  });

  const analyzeMutation = useMutation({
    mutationFn: (course?: string) => analyzeFiles(course),
    onSuccess: () => {
      setMessage({ type: "success", text: "Analisis selesai!" });
      refetchResults().then(({ data: next }) => {
        if (next?.results) setShowFloating(true);
      });
    },
    onError: (error: any) =>
      setMessage({ type: "error", text: error.response?.data?.error || "Gagal menganalisis" }),
  });

  const resetMutation = useMutation({
    mutationFn: resetData,
    onSuccess: () => {
      setMessage({ type: "success", text: "Data berhasil direset" });
      setShowFloating(false);
      refetchResults();
    },
  });

  const handleUpload = () => {
    const validation = uploadSchema.safeParse({ files: selectedFiles, courseName });
    if (!validation.success) {
      setMessage({ type: "error", text: validation.error.issues[0]?.message || "Validasi gagal" });
      return;
    }
    uploadMutation.mutate(selectedFiles);
  };

  const handleAnalyze = () => analyzeMutation.mutate(courseName || undefined);
  const handleExport = () => exportPDF();
  const handleReset = () => {
    if (confirm("Yakin ingin mereset semua data?")) resetMutation.mutate();
  };

  const hasResults = (resultsData?.results.length || 0) > 0;
  const sortedResults: SimilarityResult[] = sortResults(
    resultsData?.results || [],
    sortBy,
  );
  const ranking = getCompleteRanking(
    resultsData?.files || [],
    rankingData?.ranking || [],
  );
  const summary = computeSummary(
    resultsData?.results || [],
    resultsData?.files.length || 0,
    resultsData?.settings,
  );

  return (
    <div className="flex-1 flex flex-col bg-canvas">
      <PageHeader
        title="Pemeriksa Plagiarisme"
        right={
          <>
            {hasResults && (
              <Button variant="primary" onClick={handleExport} className="px-3 py-1.5">
                <FileDown className="w-4 h-4" />
                Export PDF
              </Button>
            )}
            <Link href="/settings" aria-label="Pengaturan" className="p-2 rounded-md hover:bg-canvas-card active:scale-95 transition-transform">
              <SettingsIcon className="w-5 h-5 text-muted" />
            </Link>
            <button
              aria-label="Reset Data"
              onClick={handleReset}
              className="p-2 rounded-md hover:bg-canvas-card active:scale-95 transition-transform"
              title="Reset Data"
            >
              <RotateCcw className="w-5 h-5 text-muted" />
            </button>
          </>
        }
      />

      {showFloating && hasResults && <FloatingNav />}

      <Container>
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
            <button onClick={() => setMessage(null)} className="ml-auto text-sm underline">
              Tutup
            </button>
          </div>
        )}

        <FileUploader />

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleUpload} disabled={uploadMutation.isPending || selectedFiles.length === 0}>
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengunggah...
              </>
            ) : (
              "Unggah File"
            )}
          </Button>
          <Button variant="secondary" onClick={handleAnalyze} disabled={analyzeMutation.isPending}>
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menganalisis...
              </>
            ) : (
              "Analisis"
            )}
          </Button>
        </div>

        <CourseNameInput />

        {resultsLoading && (
          <div className="bg-canvas-card rounded-xl p-8 text-center border border-hairline">
            <Spinner className="w-8 h-8 mx-auto mb-3" />
            <p className="text-muted">Memuat hasil analisis...</p>
          </div>
        )}

        {hasResults && (
          <>
            <ResultsControls
              filterThreshold={filterThreshold}
              setFilterThreshold={setFilterThreshold}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
            <SummaryCards summary={summary} />
            <RankingTable
              ranking={ranking}
              totalFiles={summary.totalFiles}
              results={resultsData!.results}
            />
            <PairsList results={sortedResults} />
          </>
        )}
      </Container>
    </div>
  );
}
