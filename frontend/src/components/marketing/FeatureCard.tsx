import { cn } from "@/components/ui/cn";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-hairline bg-canvas-card p-6",
        className,
      )}
    >
      <Icon className="w-6 h-6 text-primary mb-4" />
      <h3 className="text-lg mb-2">{title}</h3>
      <p className="text-body text-sm">{description}</p>
    </div>
  );
}
