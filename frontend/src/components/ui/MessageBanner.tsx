import { CheckCircle, AlertCircle, Info } from "lucide-react";

export function MessageBanner({
  message,
  onClose,
}: {
  message: { type: "success" | "error" | "info"; text: string } | null;
  onClose: () => void;
}) {
  if (!message) return null;

  const tone =
    message.type === "success"
      ? "bg-success/10 text-success border-success/20"
      : message.type === "error"
        ? "bg-error/10 text-error border-error/20"
        : "bg-canvas-soft text-body border-hairline";

  const Icon =
    message.type === "success" ? CheckCircle : message.type === "error" ? AlertCircle : Info;

  return (
    <div className={`p-4 rounded-lg flex items-center gap-3 ${tone}`}>
      <Icon className="w-5 h-5 shrink-0" />
      <p className="text-sm">{message.text}</p>
      <button onClick={onClose} className="ml-auto text-sm underline" aria-label="Tutup">
        Tutup
      </button>
    </div>
  );
}
