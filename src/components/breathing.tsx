import { useEffect, useState } from "react";

const PHASES = [
  { label: "Breathe in", ms: 4000 },
  { label: "Hold", ms: 4000 },
  { label: "Breathe out", ms: 4000 },
  { label: "Hold", ms: 4000 },
] as const;

export function Breathing() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = window.setTimeout(() => setI((n) => (n + 1) % PHASES.length), PHASES[i]!.ms);
    return () => window.clearTimeout(t);
  }, [i]);

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="relative flex size-36 items-center justify-center">
        <span className="breathe-ring absolute inset-0 rounded-full bg-secondary" />
        <span className="relative z-10 font-display text-base font-medium text-primary">
          {PHASES[i]!.label}
        </span>
      </div>
      <p className="text-center text-sm text-muted-foreground">Box breathing. Stay for a few rounds.</p>
    </div>
  );
}
