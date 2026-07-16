import { cn } from "./cn";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-block px-2.5 py-1 rounded-full text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}
