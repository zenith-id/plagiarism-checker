export const HIGHLIGHT_COLORS_A = [
  "bg-rose-200/60 ring-rose-400/40",
  "bg-blue-200/60 ring-blue-400/40",
  "bg-emerald-200/60 ring-emerald-400/40",
  "bg-amber-200/60 ring-amber-400/40",
  "bg-purple-200/60 ring-purple-400/40",
  "bg-cyan-200/60 ring-cyan-400/40",
  "bg-pink-200/60 ring-pink-400/40",
  "bg-indigo-200/60 ring-indigo-400/40",
];

export const HIGHLIGHT_COLORS_B = [
  "bg-orange-200/60 ring-orange-400/40",
  "bg-teal-200/60 ring-teal-400/40",
  "bg-lime-200/60 ring-lime-400/40",
  "bg-yellow-200/60 ring-yellow-400/40",
  "bg-violet-200/60 ring-violet-400/40",
  "bg-sky-200/60 ring-sky-400/40",
  "bg-fuchsia-200/60 ring-fuchsia-400/40",
  "bg-slate-200/60 ring-slate-400/40",
];

export function getHighlightColor(side: "a" | "b", index: number): string {
  const colors = side === "a" ? HIGHLIGHT_COLORS_A : HIGHLIGHT_COLORS_B;
  return colors[index % colors.length];
}
