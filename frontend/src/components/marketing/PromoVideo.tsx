export function PromoVideo() {
  return (
    <section className="max-w-6xl w-full mx-auto px-6 py-12">
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-hairline bg-canvas-card shadow-sm"
        style={{ aspectRatio: "16 / 9" }}
      >
        <iframe
          src="/promo/index.html"
          title="Video promo Plagiarism Checker"
          className="absolute inset-0 w-full h-full"
          loading="lazy"
          allow="fullscreen"
        />
      </div>
      <p className="mt-3 text-center text-sm text-muted">
        Tonton bagaimana cek kemiripan dokumen secara massal, cepat, dan 100%
        lokal.
      </p>
    </section>
  );
}
