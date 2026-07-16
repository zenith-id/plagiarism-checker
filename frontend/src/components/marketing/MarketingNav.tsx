import Link from "next/link";
import { FileSearch } from "lucide-react";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-canvas/90 backdrop-blur">
      <div className="flex items-center justify-between h-14 max-w-6xl w-full mx-auto px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-ink active:scale-95 transition-transform"
        >
          <FileSearch className="w-5 h-5 text-primary" />
          <span>Plagiarisme</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-md text-sm text-muted hover:text-ink hover:bg-canvas-card active:scale-95 transition-transform"
          >
            Masuk
          </Link>
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-md text-sm bg-primary text-on-primary hover:bg-primary-active active:scale-95 transition-transform"
          >
            Mulai Cek
          </Link>
        </nav>
      </div>
    </header>
  );
}
