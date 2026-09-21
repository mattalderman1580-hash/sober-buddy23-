import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const DURATION = 10 * 60;

function format(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function UrgeTimer() {
  const [left, setLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const end = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((end.current - Date.now()) / 1000));
      setLeft(next);
      if (next === 0) {
        setRunning(false);
        toast("You made it through 10 minutes. Pause, pray, and take the next right step.");
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [running]);

  function start() {
    end.current = Date.now() + DURATION * 1000;
    setLeft(DURATION);
    setRunning(true);
  }

  function stop() {
    setRunning(false);
    setLeft(DURATION);
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-5 py-5">
      <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground">TEN MINUTES</p>
      <p className="font-display text-5xl font-medium tabular-nums leading-none tracking-tight">{format(left)}</p>
      {running ? (
        <Button variant="outline" onClick={stop}>
          Reset timer
        </Button>
      ) : (
        <Button variant="secondary" onClick={start}>
          Start 10-minute timer
        </Button>
      )}
    </div>
  );
}
