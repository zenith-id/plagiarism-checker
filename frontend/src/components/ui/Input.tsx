import { cn } from "./cn";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
        className,
      )}
      {...props}
    />
  );
}
