import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="max-w-6xl w-full mx-auto px-6 py-20 text-center">
      <h2 className="text-3xl mb-4">Siap memeriksa dokumen?</h2>
      <p className="max-w-xl mx-auto text-body mb-8">
        Mulai sekarang tanpa akun dan tanpa unggah ke cloud. Semua berjalan di
        perangkat Anda.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-on-primary hover:bg-primary-active active:scale-95 transition-transform"
      >
        Buka Aplikasi
        <ArrowRight className="w-4 h-4" />
      </Link>
    </section>
  );
}
