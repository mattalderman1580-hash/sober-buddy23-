import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { SpeakButton } from "@/components/speak-button";
import { Input } from "@/components/ui/input";
import { VERSES } from "@/lib/scripture";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/scripture")({ component: Scripture });

function Scripture() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return VERSES;
    return VERSES.filter((v) => `${v.ref} ${v.text}`.toLowerCase().includes(n));
  }, [q]);

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  return (
    <AppFrame title="Scripture">
      <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">KJV · ON-DEVICE</p>
      <Input
        className="mt-3"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search reference or words…"
        aria-label="Search Scripture"
      />
      <ul className="mt-4 space-y-2">
        {list.map((v) => (
          <li key={v.ref} className="rounded-xl border border-border bg-card px-4 py-4">
            <p className="text-sm leading-relaxed">“{v.text}”</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] tracking-wide text-muted-foreground">{v.ref}</p>
              <SpeakButton text={`${v.text} ${v.ref}`} label="Hear" className="h-9 w-auto min-h-9" />
            </div>
          </li>
        ))}
        {list.length === 0 ? <p className="text-sm text-muted-foreground">No matches.</p> : null}
      </ul>
    </AppFrame>
  );
}
