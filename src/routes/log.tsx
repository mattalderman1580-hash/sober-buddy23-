import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { useAppStore } from "@/lib/store";
import { formatRelative } from "@/lib/time";
import { useHasHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/log")({ component: Log });

type Row = { id: string; at: string; kind: string; text: string };

function Log() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const checkins = useAppStore((s) => s.checkins);
  const wins = useAppStore((s) => s.wins);
  const slips = useAppStore((s) => s.slips);
  const journal = useAppStore((s) => s.journal);
  const prayers = useAppStore((s) => s.localPrayers);

  const rows = useMemo(() => {
    const all: Row[] = [
      ...checkins.map((c) => ({
        id: c.id,
        at: c.date,
        kind: "CHECK-IN",
        text: `Urge ${c.urge}/10${c.mood ? ` · ${c.mood}` : ""}${c.trigger ? ` · ${c.trigger}` : ""}`,
      })),
      ...wins.map((w) => ({ id: w.id, at: w.at, kind: "WIN", text: "Made it through an urge." })),
      ...slips.map((s) => ({
        id: s.id,
        at: s.at,
        kind: "SLIP",
        text: s.learned || s.whatHappened || "Logged a slip to learn from it.",
      })),
      ...journal.map((j) => ({ id: j.id, at: j.at, kind: "JOURNAL", text: j.body })),
      ...prayers.map((p) => ({ id: p.id, at: p.at, kind: "PRAYER", text: p.body })),
    ];
    return all.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 80);
  }, [checkins, wins, slips, journal, prayers]);

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  return (
    <AppFrame title="Event log">
      <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
        MERGED TIMELINE · LOCAL
      </p>
      <ol className="mt-4 space-y-0">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing logged yet.</p>
        ) : (
          rows.map((r) => (
            <li key={`${r.kind}-${r.id}`} className="grid grid-cols-[5.5rem_1fr] gap-3 border-b border-border py-3">
              <div>
                <p className="font-mono text-[10px] tracking-[0.12em] text-primary">{r.kind}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{formatRelative(r.at)}</p>
              </div>
              <p className="text-sm leading-relaxed">{r.text}</p>
            </li>
          ))
        )}
      </ol>
    </AppFrame>
  );
}
