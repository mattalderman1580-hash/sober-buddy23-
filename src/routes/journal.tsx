import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { formatRelative } from "@/lib/time";
import { useHasHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/journal")({ component: Journal });

function Journal() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const entries = useAppStore((s) => s.journal);
  const addJournal = useAppStore((s) => s.addJournal);
  const [body, setBody] = useState("");

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  return (
    <AppFrame title="Journal">
      <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
        PRIVATE · THIS DEVICE ONLY
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        A private log. Not posted to the circle. Write what happened, what you asked God, what you
        learned.
      </p>
      <Textarea
        className="mt-4"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Today…"
      />
      <Button
        className="mt-3 w-full"
        onClick={() => {
          addJournal(body);
          setBody("");
          toast("Saved locally.");
        }}
        disabled={body.trim().length < 2}
      >
        Save entry
      </Button>

      <ul className="mt-6 space-y-2">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entries yet.</p>
        ) : (
          entries.map((e) => (
            <li key={e.id} className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="font-mono text-[10px] text-muted-foreground">{formatRelative(e.at)}</p>
              <p className="mt-1 text-sm leading-relaxed">{e.body}</p>
            </li>
          ))
        )}
      </ul>
    </AppFrame>
  );
}
