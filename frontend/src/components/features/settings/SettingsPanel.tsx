"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Plus, Trash2 } from "lucide-react";
import {
  getSettings,
  updateSettings,
  updateExclusions,
  type Settings,
} from "@/lib/api";
import { exclusionSchema } from "@/lib/schemas";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";

export function ThresholdSettings() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });

  const mutation = useMutation({
    mutationFn: (s: Partial<Settings>) => updateSettings(s),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });

  if (!settings) return null;

  const thresholds: { key: keyof Settings; label: string; hint: string }[] = [
    { key: "thresholdSafe", label: "Aman (hijau) - di bawah nilai ini", hint: "safe" },
    { key: "thresholdWarning", label: "Waspada (kuning) - di bawah nilai ini", hint: "warning" },
    { key: "thresholdDanger", label: "Bahaya (merah) - di atas nilai ini", hint: "danger" },
  ];

  return (
    <section className="bg-canvas-card rounded-xl p-6">
      <h2 className="text-lg font-display mb-4 text-ink">Ambang Batas Kemiripan</h2>
      <div className="space-y-4">
        {thresholds.map(({ key, label }) => (
          <div key={key}>
            <label className="text-sm text-muted block mb-1">{label}</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={settings[key] as number}
              onChange={(e) => mutation.mutate({ [key]: Number(e.target.value) })}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ExclusionManager() {
  const queryClient = useQueryClient();
  const [course, setCourse] = useState("");
  const [exclusionWord, setExclusionWord] = useState("");
  const [exclusions, setExclusions] = useState<string[]>([]);

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });

  const mutation = useMutation({
    mutationFn: ({ course, words }: { course: string; words: string[] }) =>
      updateExclusions(course, words),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setCourse("");
      setExclusions([]);
      setExclusionWord("");
    },
  });

  const handleAdd = () => {
    if (exclusionWord.trim()) {
      setExclusions((prev) => [...prev, exclusionWord.trim()]);
      setExclusionWord("");
    }
  };

  const handleRemove = (index: number) =>
    setExclusions((prev) => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    const validation = exclusionSchema.safeParse({ course, words: exclusions });
    if (!validation.success) {
      alert(validation.error.issues[0]?.message);
      return;
    }
    mutation.mutate({ course, words: exclusions });
  };

  return (
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
          <Input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="Contoh: Pemrograman Web"
          />
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">Kata Pengecualian</label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={exclusionWord}
              onChange={(e) => setExclusionWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Tambah kata..."
            />
            <Button variant="secondary" onClick={handleAdd} aria-label="Tambah">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {exclusions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {exclusions.map((word, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1 bg-canvas rounded-full text-sm"
              >
                {word}
                <button onClick={() => handleRemove(i)} className="text-muted hover:text-error">
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={mutation.isPending || !course || exclusions.length === 0}
        >
          <Save className="w-4 h-4" />
          Simpan Pengecualian
        </Button>
      </div>

      {settings && Object.keys(settings.courseExclusions).length > 0 && (
        <div className="mt-6 pt-6 border-t border-hairline">
          <h3 className="text-sm font-medium text-ink mb-3">Pengecualian Tersimpan</h3>
          <div className="space-y-3">
            {Object.entries(settings.courseExclusions).map(([courseName, words]) => (
              <div key={courseName} className="p-3 bg-canvas rounded-lg">
                <p className="text-sm font-medium text-ink">{courseName}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(words as string[]).map((word, i) => (
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
  );
}
