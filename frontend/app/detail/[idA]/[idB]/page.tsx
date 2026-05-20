"use client";

import { useQuery } from "@tanstack/react-query";
import { getPairDetail } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Clock, User, AlertTriangle, CheckCircle, Copy } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const HIGHLIGHT_COLORS_A = [
  "bg-rose-200/60 ring-rose-400/40",
  "bg-blue-200/60 ring-blue-400/40",
  "bg-emerald-200/60 ring-emerald-400/40",
  "bg-amber-200/60 ring-amber-400/40",
  "bg-purple-200/60 ring-purple-400/40",
  "bg-cyan-200/60 ring-cyan-400/40",
  "bg-pink-200/60 ring-pink-400/40",
  "bg-indigo-200/60 ring-indigo-400/40",
];

const HIGHLIGHT_COLORS_B = [
  "bg-orange-200/60 ring-orange-400/40",
  "bg-teal-200/60 ring-teal-400/40",
  "bg-lime-200/60 ring-lime-400/40",
  "bg-yellow-200/60 ring-yellow-400/40",
  "bg-violet-200/60 ring-violet-400/40",
  "bg-sky-200/60 ring-sky-400/40",
  "bg-fuchsia-200/60 ring-fuchsia-400/40",
  "bg-slate-200/60 ring-slate-400/40",
];

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const idA = params.idA as string;
  const idB = params.idB as string;

  const [syncScroll, setSyncScroll] = useState(true);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [activeMatch, setActiveMatch] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["pair", idA, idB],
    queryFn: () => getPairDetail(idA, idB),
    enabled: !!idA && !!idB,
  });

  useEffect(() => {
    if (!syncScroll || !data || !leftRef.current || !rightRef.current) return;

    const handleScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
      const ratio = source.scrollTop / (source.scrollHeight - source.clientHeight || 1);
      target.scrollTop = ratio * (target.scrollHeight - target.clientHeight);
    };

    const left = leftRef.current;
    const right = rightRef.current;

    const onLeftScroll = () => handleScroll(left, right);
    const onRightScroll = () => handleScroll(right, left);

    left.addEventListener("scroll", onLeftScroll);
    right.addEventListener("scroll", onRightScroll);

    return () => {
      left.removeEventListener("scroll", onLeftScroll);
      right.removeEventListener("scroll", onRightScroll);
    };
  }, [syncScroll, data]);

  const scrollToMatch = (index: number) => {
    setActiveMatch(index);
    if (!data || !leftRef.current || !rightRef.current) return;

    const leftEl = leftRef.current.querySelector(`[data-match="${index}"]`);
    const rightEl = rightRef.current.querySelector(`[data-match="${index}"]`);

    if (leftEl) leftEl.scrollIntoView({ behavior: "smooth", block: "center" });
    if (rightEl) rightEl.scrollIntoView({ behavior: "smooth", block: "center" });
  };

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
        <Link href="/" className="text-primary hover:underline text-sm">
          Kembali ke halaman utama
        </Link>
      </div>
    );
  }

  const { fileA, fileB, similarity, direction } = data;
  const scoreColor =
    similarity.normalScore >= 80
      ? "text-error"
      : similarity.normalScore >= 60
      ? "text-warning"
      : "text-success";

  const renderHighlightedContent = (
    content: string,
    ranges: { a: [number, number]; b: [number, number] }[],
    side: "a" | "b"
  ) => {
    if (!content) return <p className="text-muted text-sm italic">Tidak ada konten</p>;

    const segments: { text: string; matchIndex: number | null }[] = [];
    let lastIndex = 0;

    const sortedRanges = [...ranges]
      .map((r, i) => ({ ...r, index: i }))
      .sort((a, b) => (side === "a" ? a.a[0] - b.a[0] : a.b[0] - b.b[0]));

    for (const range of sortedRanges) {
      const [start, end] = side === "a" ? range.a : range.b;
      if (start > lastIndex) {
        segments.push({ text: content.slice(lastIndex, start), matchIndex: null });
      }
      segments.push({ text: content.slice(start, end), matchIndex: range.index });
      lastIndex = end;
    }

    if (lastIndex < content.length) {
      segments.push({ text: content.slice(lastIndex), matchIndex: null });
    }

    const colors = side === "a" ? HIGHLIGHT_COLORS_A : HIGHLIGHT_COLORS_B;

    return (
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {segments.map((seg, i) =>
          seg.matchIndex !== null ? (
            <mark
              key={i}
              data-match={seg.matchIndex}
              className={`px-0.5 rounded ring-1 transition-colors ${
                colors[seg.matchIndex % colors.length]
              } ${seg.matchIndex === activeMatch ? "ring-2 ring-offset-1" : ""}`}
            >
              {seg.text}
            </mark>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </div>
    );
  };

  const MetadataPanel = ({
    file,
    label,
  }: {
    file: { name: string; metadata: Record<string, string>; metadataStatus: string; metadataReason: string; isOcr: boolean };
    label: string;
  }) => {
    const metaEntries = Object.entries(file.metadata).filter(([_, v]) => v);
    const isSuspicious = file.metadataStatus === "Mencurigakan";

    return (
      <div className="bg-canvas-soft rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted uppercase tracking-wide font-medium">{label} — Metadata</p>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            isSuspicious ? "bg-error/10 text-error" : "bg-success/10 text-success"
          }`}>
            {isSuspicious ? (
              <AlertTriangle className="w-3 h-3" />
            ) : (
              <CheckCircle className="w-3 h-3" />
            )}
            {file.metadataStatus}
          </span>
        </div>

        {file.metadataReason && (
          <p className="text-xs text-muted mb-3 italic">{file.metadataReason}</p>
        )}

        {file.isOcr && (
          <div className="mb-3 px-3 py-2 bg-accent-amber/10 text-accent-amber rounded-md text-xs flex items-center gap-2">
            <Copy className="w-3 h-3" />
            File ini diproses melalui OCR (PDF scan)
          </div>
        )}

        {metaEntries.length > 0 ? (
          <div className="space-y-2 text-xs">
            {metaEntries.map(([key, val]) => {
              const isAuthorField = ["author", "creator", "authors", "lastSavedBy", "lastModifiedBy"].includes(key.toLowerCase());
              const isDateField = ["created", "modified", "creationdate", "moddate"].includes(key.toLowerCase());

              return (
                <div key={key} className="flex gap-2 items-start">
                  {isAuthorField ? (
                    <User className="w-3 h-3 text-muted shrink-0 mt-0.5" />
                  ) : isDateField ? (
                    <Clock className="w-3 h-3 text-muted shrink-0 mt-0.5" />
                  ) : (
                    <FileText className="w-3 h-3 text-muted shrink-0 mt-0.5" />
                  )}
                  <span className="text-muted shrink-0">{key}:</span>
                  <span className="text-body break-all">{String(val)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-soft italic">Tidak ada metadata</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="h-16 bg-canvas border-b border-hairline flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-md hover:bg-canvas-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted" />
          </button>
          <h1 className="text-lg font-display tracking-tight text-ink">Detail Perbandingan</h1>
        </div>
        <div className={`text-2xl font-display ${scoreColor}`}>
          {similarity.normalScore}%
        </div>
      </header>

      <main className="flex-1 px-6 py-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-canvas-card rounded-lg p-4">
            <p className="text-xs text-muted uppercase tracking-wide mb-1">Similarity Normal</p>
            <p className={`text-3xl font-display ${scoreColor}`}>{similarity.normalScore}%</p>
          </div>
          <div className="bg-canvas-card rounded-lg p-4">
            <p className="text-xs text-muted uppercase tracking-wide mb-1">Similarity Strict</p>
            <p className={`text-3xl font-display ${scoreColor}`}>{similarity.strictScore}%</p>
          </div>
          <div className="bg-canvas-card rounded-lg p-4">
            <p className="text-xs text-muted uppercase tracking-wide mb-1">Word Overlap</p>
            <p className={`text-3xl font-display ${scoreColor}`}>{similarity.wordOverlap}%</p>
          </div>
        </div>

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
              {similarity.matchedRanges.slice(0, 20).map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => scrollToMatch(i)}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
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
          <div className="bg-canvas rounded-lg border border-hairline">
            <div className="p-4 border-b border-hairline flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <h3 className="text-sm font-medium truncate">{fileA.name}</h3>
              </div>
              <span className="text-xs text-muted-soft">
                {(fileA.content.length / 1024).toFixed(1)} KB
              </span>
            </div>
            <div ref={leftRef} className="p-4 max-h-[500px] overflow-y-auto">
              {renderHighlightedContent(fileA.content, similarity.matchedRanges, "a")}
            </div>
          </div>

          <div className="bg-canvas rounded-lg border border-hairline">
            <div className="p-4 border-b border-hairline flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400" />
                <h3 className="text-sm font-medium truncate">{fileB.name}</h3>
              </div>
              <span className="text-xs text-muted-soft">
                {(fileB.content.length / 1024).toFixed(1)} KB
              </span>
            </div>
            <div ref={rightRef} className="p-4 max-h-[500px] overflow-y-auto">
              {renderHighlightedContent(fileB.content, similarity.matchedRanges, "b")}
            </div>
          </div>
        </div>

        <div className="bg-canvas-card rounded-lg p-6">
          <h3 className="text-lg font-display mb-3 text-ink">Summary Kesimpulan</h3>
          <p className="text-sm text-body">
            Kedua dokumen memiliki tingkat kemiripan{" "}
            <span className={`font-medium ${scoreColor}`}>{similarity.normalScore}%</span> (normal) dan{" "}
            <span className={`font-medium ${scoreColor}`}>{similarity.strictScore}%</span> (strict).
            Word overlap sebesar {similarity.wordOverlap}%.
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
      </main>
    </div>
  );
}
