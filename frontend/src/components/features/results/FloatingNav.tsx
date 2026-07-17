"use client";

import { useState } from "react";
import { BarChart3, FileText, Users, ChevronUp } from "lucide-react";

const SECTIONS = [
  { id: "summary", label: "Summary", icon: BarChart3 },
  { id: "ranking", label: "Ranking", icon: FileText },
  { id: "pairs", label: "Pasangan", icon: Users },
];

export function FloatingNav() {
  const [show, setShow] = useState(true);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (show) {
    return (
      <div className="fixed right-4 top-20 z-30 bg-canvas-card border border-hairline rounded-xl shadow-lg p-2 space-y-1 min-w-[140px]">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-canvas-soft transition-colors text-sm w-full text-left text-body"
          >
            <Icon className="w-4 h-4 text-primary" />
            {label}
          </button>
        ))}
        <div className="border-t border-hairline my-1" />
        <button
          onClick={() => setShow(false)}
          className="flex items-center justify-center px-3 py-2 rounded-lg hover:bg-canvas-soft transition-colors text-sm w-full text-muted"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      aria-label="Buka navigasi"
      onClick={() => setShow(true)}
      className="fixed right-4 top-20 z-30 bg-primary text-on-primary p-3 rounded-full shadow-lg hover:bg-primary-active active:scale-95 transition-transform"
      title="Buka navigasi"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}
