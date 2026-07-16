import { cn } from "../ui/cn";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <main
      className={cn(
        "flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8",
        className,
      )}
    >
      {children}
    </main>
  );
}
