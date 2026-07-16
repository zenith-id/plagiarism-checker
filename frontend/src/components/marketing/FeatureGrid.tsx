import { Layers, Gauge, FileText, SlidersHorizontal } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

const FEATURES = [
  {
    icon: Layers,
    title: "Pemrosesan massal",
    description:
      "Unggah hingga 200 dokumen per batch dengan berbagai format: .txt, .docx, dan .pdf.",
  },
  {
    icon: Gauge,
    title: "Multi-algoritma",
    description:
      "Kombinasi TF-IDF Cosine, 5-Gram Overlap, dan LCS untuk hasil yang akurat.",
  },
  {
    icon: FileText,
    title: "Laporan lengkap",
    description:
      "Ringkasan, peringkat pasangan, dan tampilan sorotan kemiripan yang dapat diekspor PDF.",
  },
  {
    icon: SlidersHorizontal,
    title: "Ambang batas kustom",
    description:
      "Atur threshold kemiripan dan mode analisis (Normal, Strict, Word Overlap) sesuai kebutuhan.",
  },
];

export function FeatureGrid() {
  return (
    <section className="max-w-6xl w-full mx-auto px-6 py-16">
      <h2 className="text-3xl text-center mb-10">Fitur utama</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </section>
  );
}
