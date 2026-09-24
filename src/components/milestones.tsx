import { PartyPopper, Sprout } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { daysSinceLastSlip, nextMilestone, pendingCelebration, type Milestone } from "@/lib/milestones";
import { VERSES, type Verse } from "@/lib/scripture";
import { useAppStore } from "@/lib/store";

/** Verse (by reference prefix in src/lib/scripture.ts) chosen for each milestone. */
const MILESTONE_VERSE: Record<string, string> = {
  d1: "Lamentations 3:22",
  d7: "Isaiah 41:10",
  d30: "Philippians 4:13",
  d60: "Galatians 5:22",
  d90: "2 Timothy 1:7",
  d180: "Psalm 23:1",
};
const YEAR_VERSES = ["John 8:36", "Proverbs 3:5", "Romans 12:2", "Psalm 34:17"];

function verseFor(key: string): Verse {
  let ref = MILESTONE_VERSE[key];
  if (!ref && key.startsWith("y")) {
    const n = Math.max(1, Number(key.slice(1)) || 1);
    ref = YEAR_VERSES[(n - 1) % YEAR_VERSES.length];
  }
  return VERSES.find((v) => ref && v.ref.startsWith(ref)) ?? VERSES[0]!;
}

function messageFor(m: Milestone): string {
  if (m.key === "d1") {
    return "Your first 24 hours. That took real courage. Tomorrow isn't yours to carry yet, just today, and today you did it.";
  }
  if (m.key.startsWith("y")) {
    return `${m.label}. Every one of those days was lived one at a time, with God's help. Take a moment to thank Him and the people who walked with you.`;
  }
  return `${m.label}. Not by perfection, but by grace, one day at a time. Celebrate this, then keep your eyes on today.`;
}

/**
 * Shows one celebration dialog when the most recent milestone hasn't been
 * celebrated yet. Earlier unseen milestones are quietly marked as seen.
 */
export function MilestoneCelebration() {
  const startDate = useAppStore((s) => s.plan.startDate);
  const celebrated = useAppStore((s) => s.celebratedMilestones);
  const markCelebrated = useAppStore((s) => s.markMilestonesCelebrated);
  const [showing, setShowing] = useState<{ milestone: Milestone; keys: string[] } | null>(null);

  useEffect(() => {
    if (showing || !startDate) return;
    const { celebrate, markSeen } = pendingCelebration(startDate, celebrated);
    if (!markSeen.length) return;
    if (celebrate) {
      setShowing({ milestone: celebrate, keys: markSeen });
    } else {
      markCelebrated(markSeen);
    }
  }, [startDate, celebrated, showing, markCelebrated]);

  if (!showing) return null;
  const { milestone, keys } = showing;
  const verse = verseFor(milestone.key);

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open) {
          markCelebrated(keys);
          setShowing(null);
        }
      }}
    >
      <AlertDialogContent className="text-center">
        <AlertDialogHeader className="items-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
            <PartyPopper className="size-6" />
          </div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">MILESTONE</p>
          <AlertDialogTitle className="font-display text-2xl">{milestone.label}</AlertDialogTitle>
          <AlertDialogDescription>{messageFor(milestone)}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-4 rounded-xl bg-muted px-4 py-3 text-left">
          <p className="text-sm leading-relaxed">“{verse.text}”</p>
          <p className="mt-1 text-xs text-muted-foreground">{verse.ref}</p>
        </div>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction
            onClick={() => {
              markCelebrated(keys);
              setShowing(null);
            }}
          >
            Thank You, Lord
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Compact "next milestone" line with a small progress bar, plus slip-aware context. */
export function NextMilestoneCard({ className }: { className?: string }) {
  const startDate = useAppStore((s) => s.plan.startDate);
  const slips = useAppStore((s) => s.slips);
  if (!startDate) return null;
  const next = nextMilestone(startDate);
  const sinceSlip = daysSinceLastSlip(startDate, slips);
  if (!next) return null;
  return (
    <div className={className}>
      <div className="rounded-xl bg-card px-4 py-3 shadow-border">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm">
            <span className="text-muted-foreground">Next · </span>
            <span className="font-medium">{next.label}</span>
          </p>
          <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {next.daysAway === 1 ? "tomorrow" : `${next.daysAway} days to go`}
          </p>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-label={`Progress toward ${next.label}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(next.progress * 100)}
        >
          <div className="h-full bg-primary" style={{ width: `${next.progress * 100}%` }} />
        </div>
        {sinceSlip !== null ? (
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
            <Sprout className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span>
              <span className="text-foreground">
                {sinceSlip === 0 ? "Starting fresh today" : `${sinceSlip} day${sinceSlip === 1 ? "" : "s"} since your last slip`}
              </span>
              . Your journey still counts. Learning, not shame.
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
