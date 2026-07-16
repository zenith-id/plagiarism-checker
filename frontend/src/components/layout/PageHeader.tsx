import { cn } from "../ui/cn";

export function PageHeader({
  title,
  right,
  backHref,
  onBack,
}: {
  title: string;
  right?: React.ReactNode;
  backHref?: string;
  onBack?: () => void;
}) {
  return (
    <header className="h-16 bg-canvas border-b border-hairline flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {backHref && (
          <a
            href={backHref}
            aria-label="Kembali"
            className="p-2 rounded-md hover:bg-canvas-card active:scale-95 transition-transform"
          >
            <svg
              className="w-5 h-5 text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </a>
        )}
        {onBack && (
          <button
            aria-label="Kembali"
            onClick={onBack}
            className="p-2 rounded-md hover:bg-canvas-card active:scale-95 transition-transform"
          >
            <svg
              className="w-5 h-5 text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-display tracking-tight text-ink">{title}</h1>
      </div>
      {right && <div className="flex items-center gap-3">{right}</div>}
    </header>
  );
}
