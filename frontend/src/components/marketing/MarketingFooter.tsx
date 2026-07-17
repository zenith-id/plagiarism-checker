import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline bg-canvas-soft">
      <div className="max-w-6xl w-full mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} Pemeriksa Plagiarisme. Semua data lokal.</p>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:text-ink active:scale-95 transition-transform">
            Aplikasi
          </Link>
          <Link href="/settings" className="hover:text-ink active:scale-95 transition-transform">
            Pengaturan
          </Link>
        </nav>
      </div>
    </footer>
  );
}
