import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-active transition-[transform,background-color,color]",
  secondary:
    "bg-canvas text-ink border border-hairline hover:bg-canvas-card transition-[transform,background-color,color]",
  ghost: "hover:bg-canvas-card transition-[transform,background-color,color]",
  danger: "text-error hover:text-error/80 transition-[transform,color]",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 active:scale-[0.98] active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:active:translate-y-0",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
