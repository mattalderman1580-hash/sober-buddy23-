import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/story")({ component: StoryPage });

function StoryPage() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const saved = useAppStore((s) => s.story);
  const displayName = useAppStore((s) => s.displayName);
  const saveStory = useAppStore((s) => s.saveStory);
  const setDisplayName = useAppStore((s) => s.setDisplayName);
  const [called, setCalled] = useState(saved.called);
  const [narrative, setNarrative] = useState(saved.narrative);
  const [faith, setFaith] = useState(saved.faith);
  const [protecting, setProtecting] = useState(saved.protecting);
  const [goodDay, setGoodDay] = useState(saved.goodDay);
  const [howItStarted, setHowItStarted] = useState(saved.howItStarted);
  const [hope, setHope] = useState(saved.hope);
  const [turningPoint, setTurningPoint] = useState(saved.turningPoint);
  const [handle, setHandle] = useState(displayName);

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  return (
    <AppFrame title="Your story">
      <p className="text-sm leading-relaxed text-muted-foreground">
        This stays on this device. Buddy uses it so replies sound like they know you — not a script.
      </p>
      <div className="mt-5 space-y-5">
        <Field label="What should Buddy call you?" htmlFor="called">
          <Input id="called" value={called} onChange={(e) => setCalled(e.target.value)} />
        </Field>
        <Field label="Circle name (public, first name only)" htmlFor="handle">
          <Input
            id="handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="e.g. James"
          />
        </Field>
        <Field label="Why are you here?" htmlFor="narrative">
          <Textarea
            id="narrative"
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="The short version of your story…"
          />
        </Field>
        <Field label="How does faith fit?" htmlFor="faith">
          <Textarea id="faith" value={faith} onChange={(e) => setFaith(e.target.value)} />
        </Field>
        <Field label="Who and what are you protecting?" htmlFor="protecting">
          <Textarea id="protecting" value={protecting} onChange={(e) => setProtecting(e.target.value)} />
        </Field>
        <Field label="What does a good day look like?" htmlFor="good">
          <Textarea id="good" value={goodDay} onChange={(e) => setGoodDay(e.target.value)} />
        </Field>
        <Field label="How did this start?" htmlFor="started">
          <Textarea
            id="started"
            value={howItStarted}
            onChange={(e) => setHowItStarted(e.target.value)}
            placeholder="The part of the story that still matters…"
          />
        </Field>
        <Field label="What do you want back?" htmlFor="hope">
          <Textarea
            id="hope"
            value={hope}
            onChange={(e) => setHope(e.target.value)}
            placeholder="Peace, trust, health, time with your people…"
          />
        </Field>
        <Field label="What is turning?" htmlFor="turning">
          <Textarea
            id="turning"
            value={turningPoint}
            onChange={(e) => setTurningPoint(e.target.value)}
            placeholder="The decision you are making now…"
          />
        </Field>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Family belongs on its own page so you can name who stands with you.{" "}
          <Link to="/family" className="font-medium text-foreground underline-offset-2 hover:underline">
            Open family support
          </Link>
        </p>
        <Button
          className="w-full"
          size="lg"
          onClick={() => {
            saveStory({
              ...saved,
              called,
              narrative,
              faith,
              protecting,
              goodDay,
              howItStarted,
              hope,
              turningPoint,
            });
            setDisplayName(handle.trim());
            toast("Story saved on this device.");
          }}
        >
          Save my story
        </Button>
      </div>
    </AppFrame>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
