export function Sparkline({ values, max = 10 }: { values: number[]; max?: number }) {
  if (values.length < 2) {
    return (
      <p className="py-4 text-center text-xs text-muted-foreground">
        Log a few check-ins to plot urge intensity.
      </p>
    );
  }
  const w = 320;
  const h = 56;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = i * step;
    const y = h - (Math.min(max, Math.max(0, v)) / max) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const d = `M ${pts.join(" L ")}`;
  const last = values[values.length - 1] ?? 0;
  const lx = (values.length - 1) * step;
  const ly = h - (Math.min(max, Math.max(0, last)) / max) * (h - 4) - 2;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full" role="img" aria-label="Urge intensity over recent check-ins">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.75" className="text-primary" />
      <circle cx={lx} cy={ly} r="3" className="fill-primary" />
    </svg>
  );
}
