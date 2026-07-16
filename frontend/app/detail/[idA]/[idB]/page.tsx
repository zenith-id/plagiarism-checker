"use client";

import { useQuery } from "@tanstack/react-query";
import { getPairDetail } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/layout/Container";
import { getScoreColor } from "@/lib/scoring";
import { MetadataPanel } from "@/components/features/detail/MetadataPanel";
import { ScoreCards } from "@/components/features/detail/ScoreCards";
import { DiffViewer } from "@/components/features/detail/DiffViewer";

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const idA = params.idA as string;
  const idB = params.idB as string;

  const { data, isLoading } = useQuery({
    queryKey: ["pair", idA, idB],
    queryFn: () => getPairDetail(idA, idB),
    enabled: !!idA && !!idB,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted">Memuat detail...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="text-xl text-muted mb-4">Data tidak ditemukan</p>
        <button onClick={() => router.push("/")} className="text-primary hover:underline text-sm">
          Kembali ke halaman utama
        </button>
      </div>
    );
  }

  const { fileA, fileB, similarity, direction } = data;
  const scoreColor = getScoreColor(similarity.normalScore);

  return (
    <div className="flex-1 flex flex-col">
      <PageHeader
        title="Detail Perbandingan"
        onBack={() => router.back()}
        right={<div className={`text-2xl font-display ${scoreColor}`}>{similarity.normalScore}%</div>}
      />

      <Container className="max-w-7xl py-6 space-y-6">
        <ScoreCards similarity={similarity} />

        {direction && (
          <div className="bg-canvas-card rounded-lg p-4 border-l-4 border-primary">
            <p className="text-sm text-ink">
              <span className="font-medium">Indikasi Arah:</span> {direction}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MetadataPanel file={fileA} label="File A" />
          <MetadataPanel file={fileB} label="File B" />
        </div>

        <DiffViewer fileA={fileA} fileB={fileB} similarity={similarity} />
      </Container>
    </div>
  );
}
