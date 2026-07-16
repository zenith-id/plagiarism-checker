import { cn } from "./cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-canvas-card rounded-xl border border-hairline",
        className,
      )}
    >
      {children}
    </div>
  );
}
