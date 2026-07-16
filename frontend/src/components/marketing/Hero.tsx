import Link from "next/link";
import { ArrowRight, Upload, Search, FileDown, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="max-w-6xl w-full mx-auto px-6 pt-20 pb-16 text-center">
      <span className="inline-block px-3 py-1 rounded-full bg-canvas-card text-muted text-sm mb-6">
        Deteksi plagiarisme tugas mahasiswa
      </span>
      <h1 className="text-4xl sm:text-5xl leading-tight max-w-3xl mx-auto">
        Cek kemiripan dokumen secara massal, cepat, dan lokal.
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-body">
        Unggah ratusan file sekaligus, dapatkan laporan kemiripan berbasis TF-IDF,
        N-Gram, dan LCS tanpa mengunggah data ke server eksternal.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-on-primary hover:bg-primary-active active:scale-95 transition-transform"
        >
          Mulai Cek
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-hairline text-ink hover:bg-canvas-card active:scale-95 transition-transform"
        >
          Lihat Aplikasi
        </Link>
      </div>
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {[
          { icon: Upload, label: "200 file/batch" },
          { icon: Search, label: "3 algoritma" },
          { icon: FileDown, label: "Export PDF" },
          { icon: ShieldCheck, label: "100% lokal" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-xl border border-hairline bg-canvas-card p-4"
          >
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
