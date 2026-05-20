"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings, updateExclusions, type Settings } from "@/lib/api";
import { exclusionSchema } from "@/lib/schemas";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [course, setCourse] = useState("");
  const [exclusionWord, setExclusionWord] = useState("");
  const [exclusions, setExclusions] = useState<string[]>([]);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const exclusionMutation = useMutation({
    mutationFn: ({ course, words }: { course: string; words: string[] }) =>
      updateExclusions(course, words),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setCourse("");
      setExclusions([]);
      setExclusionWord("");
    },
  });

  const handleSaveThresholds = (key: keyof Settings, value: number) => {
    updateMutation.mutate({ [key]: value });
  };

  const handleAddExclusion = () => {
    if (exclusionWord.trim()) {
      setExclusions((prev) => [...prev, exclusionWord.trim()]);
      setExclusionWord("");
    }
  };

  const handleRemoveExclusion = (index: number) => {
    setExclusions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveExclusions = () => {
    const validation = exclusionSchema.safeParse({ course, words: exclusions });
    if (!validation.success) {
      alert(validation.error.issues[0]?.message);
      return;
    }
    exclusionMutation.mutate({ course, words: exclusions });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted">Memuat pengaturan...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="text-xl text-muted mb-4">Pengaturan tidak tersedia</p>
        <Link href="/" className="text-primary hover:underline text-sm">
          Kembali ke halaman utama
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="h-16 bg-canvas border-b border-hairline flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-md hover:bg-canvas-card transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted" />
          </Link>
          <h1 className="text-xl font-display tracking-tight text-ink">Pengaturan</h1>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 space-y-8">
        <section className="bg-canvas-card rounded-xl p-6">
          <h2 className="text-lg font-display mb-4 text-ink">Ambang Batas Kemiripan</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted block mb-1">
                Aman (hijau) - di bawah nilai ini
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.thresholdSafe}
                onChange={(e) => handleSaveThresholds("thresholdSafe", Number(e.target.value))}
                className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted block mb-1">
                Waspada (kuning) - di bawah nilai ini
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.thresholdWarning}
                onChange={(e) => handleSaveThresholds("thresholdWarning", Number(e.target.value))}
                className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted block mb-1">
                Bahaya (merah) - di atas nilai ini
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.thresholdDanger}
                onChange={(e) => handleSaveThresholds("thresholdDanger", Number(e.target.value))}
                className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-sm"
              />
            </div>
          </div>
        </section>

        <section className="bg-canvas-card rounded-xl p-6">
          <h2 className="text-lg font-display mb-4 text-ink">
            Pengecualian Mode Strict per Mata Kuliah
          </h2>
          <p className="text-sm text-muted mb-4">
            Kata-kata ini akan diabaikan saat menghitung similarity strict.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted block mb-1">Nama Mata Kuliah</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Contoh: Pemrograman Web"
                className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-muted block mb-1">Kata Pengecualian</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={exclusionWord}
                  onChange={(e) => setExclusionWord(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddExclusion()}
                  placeholder="Tambah kata..."
                  className="flex-1 px-3 py-2 bg-canvas border border-hairline rounded-md text-sm"
                />
                <button
                  onClick={handleAddExclusion}
                  className="px-3 py-2 bg-canvas border border-hairline rounded-md hover:bg-canvas-soft transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {exclusions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {exclusions.map((word: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-canvas rounded-full text-sm"
                  >
                    {word}
                    <button
                      onClick={() => handleRemoveExclusion(i)}
                      className="text-muted hover:text-error"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={handleSaveExclusions}
              disabled={exclusionMutation.isPending || !course || exclusions.length === 0}
              className="px-4 py-2 bg-primary text-on-primary rounded-md hover:bg-primary-active transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan Pengecualian
            </button>
          </div>

          {Object.keys(settings.courseExclusions).length > 0 && (
            <div className="mt-6 pt-6 border-t border-hairline">
              <h3 className="text-sm font-medium text-ink mb-3">Pengecualian Tersimpan</h3>
              <div className="space-y-3">
                {Object.entries(settings.courseExclusions).map(([courseName, words]) => (
                  <div key={courseName} className="p-3 bg-canvas rounded-lg">
                    <p className="text-sm font-medium text-ink">{courseName}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(words as string[]).map((word: string, i: number) => (
                        <span key={i} className="text-xs text-muted bg-canvas-soft px-2 py-0.5 rounded">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
