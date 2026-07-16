"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSearch } from "lucide-react";
import { cn } from "@/components/ui/cn";

const NAV = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/results", label: "Hasil" },
  { href: "/settings", label: "Pengaturan" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-20 border-b border-hairline bg-canvas/90 backdrop-blur">
        <div className="flex items-center justify-between h-14 max-w-6xl w-full mx-auto px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-ink active:scale-95 transition-transform"
          >
            <FileSearch className="w-5 h-5 text-primary" />
            <span>Plagiarisme</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm transition-colors active:scale-95 transition-transform",
                    active
                      ? "bg-canvas-card text-ink font-medium"
                      : "text-muted hover:text-ink hover:bg-canvas-card",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </Container>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
