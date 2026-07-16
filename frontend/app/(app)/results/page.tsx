"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getResults, getRanking, exportPDF, type SimilarityResult } from "@/lib/api";
import { FileDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { SummaryCards } from "@/components/features/results/SummaryCards";
import { RankingTable } from "@/components/features/results/RankingTable";
import { PairsList } from "@/components/features/results/PairsList";
import { FloatingNav } from "@/components/features/results/FloatingNav";
import { ResultsControls } from "@/components/features/results/ResultsControls";
import { getCompleteRanking, computeSummary, sortResults, type SortKey } from "@/lib/ranking";

export default function ResultsPage() {
  const [filterThreshold, setFilterThreshold] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>("normal");

  const { data, isLoading } = useQuery({
    queryKey: ["results"],
    queryFn: () => getResults(filterThreshold || undefined),
  });

  const { data: rankingData, isLoading: rankingLoading } = useQuery({
    queryKey: ["ranking"],
    queryFn: getRanking,
    enabled: !!data && data.results.length > 0,
  });

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

  const sortedResults: SimilarityResult[] = sortResults(data.results, sortBy);
  const ranking = getCompleteRanking(data.files, rankingData?.ranking || []);
  const summary = computeSummary(data.results, data.files.length, data.settings);

  return (
    <div className="flex-1 flex flex-col bg-canvas">
      <PageHeader
        title="Hasil Analisis"
        backHref="/"
        right={
          <Button onClick={exportPDF}>
            <FileDown className="w-4 h-4" />
            Export PDF
          </Button>
        }
      />

      <FloatingNav />

      <Container>
        <ResultsControls
          filterThreshold={filterThreshold}
          setFilterThreshold={setFilterThreshold}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <SummaryCards summary={summary} />

        {rankingLoading ? (
          <div className="bg-canvas-card rounded-xl p-8 text-center text-muted">Memuat ranking...</div>
        ) : ranking.length === 0 ? (
          <div className="bg-canvas-card rounded-xl p-8 text-center text-muted">Tidak ada data ranking</div>
        ) : (
          <RankingTable ranking={ranking} totalFiles={summary.totalFiles} results={data.results} />
        )}

        <PairsList results={sortedResults} />
      </Container>
    </div>
  );
}
