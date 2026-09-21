import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { SpeakButton } from "@/components/speak-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GUIDED_PRAYERS, VERSES, verseForDay } from "@/lib/scripture";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faith")({ component: Faith });

type Tab = "pray" | "word" | "ask";

function Faith() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const story = useAppStore((s) => s.story);
  const start = useMemo(() => VERSES.findIndex((v) => v.ref === verseForDay().ref), []);
  const [i, setI] = useState(start >= 0 ? start : 0);
  const [tab, setTab] = useState<Tab>("pray");
  const [prayerId, setPrayerId] = useState("urge");
  const verse = VERSES[i]!;
  const prayer = GUIDED_PRAYERS.find((p) => p.id === prayerId) ?? GUIDED_PRAYERS[0]!;

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  const spoken = story.protecting
    ? `${prayer.text} I am asking You to guard ${story.protecting}.`
    : prayer.text;

  return (
    <AppFrame title="God first">
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
        {(
          [
            ["pray", "Pray"],
            ["word", "Scripture"],
            ["ask", "Ask"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "h-10 rounded-lg text-sm font-medium",
              tab === id ? "bg-card text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "pray" ? (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {GUIDED_PRAYERS.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant={prayerId === p.id ? "default" : "outline"}
                onClick={() => setPrayerId(p.id)}
              >
                {p.title}
              </Button>
            ))}
          </div>
          <Card className="bg-muted">
            <CardContent className="space-y-3 p-5">
              <p className="text-xs text-muted-foreground">{prayer.blurb}</p>
              <p className="text-sm leading-relaxed">“{spoken}”</p>
              <SpeakButton text={spoken} />
            </CardContent>
          </Card>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Put both feet on the floor.</li>
            <li>Name the feeling in one word.</li>
            <li>Pray the words above — or tap Speak and pray along.</li>
            <li>Take the next ten minutes. Nothing else.</li>
          </ol>
        </div>
      ) : null}

      {tab === "word" ? (
        <Card className="mt-4">
          <CardContent className="space-y-3 p-5">
            <p className="font-display text-xl font-medium leading-snug">“{verse.text}”</p>
            <p className="font-mono text-[10px] tracking-wide text-muted-foreground">{verse.ref}</p>
            <SpeakButton text={`${verse.text} ${verse.ref}`} label="Hear this verse" />
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setI((n) => (n + VERSES.length - 1) % VERSES.length)}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setI((n) => (n + 1) % VERSES.length)}>
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "ask" ? (
        <Card className="mt-4">
          <CardContent className="space-y-3 p-5">
            <p className="font-medium">Bring these to God, then to a person.</p>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>What am I feeling right now?</li>
              <li>What am I trying to escape?</li>
              <li>What would honoring God look like in the next 10 minutes?</li>
              <li>Who can I ask to pray with me?</li>
            </ul>
            <Button asChild className="w-full">
              <Link to="/wall">Ask the circle</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Button asChild variant="crisis" className="mt-5 w-full">
        <Link to="/urge">I need strength right now</Link>
      </Button>
    </AppFrame>
  );
}
