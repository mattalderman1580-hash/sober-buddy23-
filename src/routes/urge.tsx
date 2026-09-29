import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { BookOpen, HandHelping, Heart, MessageCircle, Phone, Waves, Wind } from "lucide-react";
import { useRef, useState } from "react";
import { AiDisclosure } from "@/components/ai-disclosure";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { NeedHelpNow } from "@/components/need-help-now";
import { Breathing } from "@/components/breathing";
import { SpeakButton } from "@/components/speak-button";
import { SponsorCall } from "@/components/sponsor-call";
import { UrgeTimer } from "@/components/urge-timer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askCompanion } from "@/lib/companion";
import { personalize } from "@/lib/personalize";
import { labelsFor } from "@/lib/struggles";
import { personalContext, useAppStore } from "@/lib/store";
import type { CompanionAction } from "@/lib/types";
import { useHasHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/urge")({ component: Urge });

const ACTIONS: { id: CompanionAction; label: string; Icon: typeof Wind }[] = [
  { id: "talk", label: "Talk to me", Icon: MessageCircle },
  { id: "calm", label: "Help me calm down", Icon: Wind },
  { id: "distract", label: "Distract me", Icon: Waves },
  { id: "reasons", label: "Remind me why", Icon: Heart },
  { id: "pray", label: "Pray with me", Icon: HandHelping },
  { id: "scripture", label: "Give me Scripture", Icon: BookOpen },
];

function Urge() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const struggles = useAppStore((s) => s.struggles);
  const story = useAppStore((s) => s.story);
  const plan = useAppStore((s) => s.plan);
  const triggers = useAppStore((s) => s.triggers);
  const standingGoals = useAppStore((s) => s.standingGoals);
  const slips = useAppStore((s) => s.slips);
  const goal = useAppStore((s) => s.goal);
  const lifeGoals = useAppStore((s) => s.lifeGoals);
  const chat = useAppStore((s) => s.chat);
  const addChat = useAppStore((s) => s.addChat);
  const resetChat = useAppStore((s) => s.resetChat);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [showBreath, setShowBreath] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  const lastAssistant = [...chat].reverse().find((m) => m.role === "assistant");

  async function send(action: CompanionAction, message?: string) {
    if (busy) return;
    const spoken =
      action === "free" ? message?.trim() : ACTIONS.find((a) => a.id === action)?.label;
    if (action === "free" && !spoken) return;
    if (action === "calm") setShowBreath(true);

    if (spoken) addChat({ role: "user", content: spoken });
    setBusy(true);
    setDraft("");

    const history = [
      ...chat.map((m) => ({ role: m.role, content: m.content })),
      ...(spoken ? [{ role: "user" as const, content: spoken }] : []),
    ].slice(-8);

    try {
      const res = await askCompanion({
        data: {
          struggles: labelsFor(struggles),
          profile: personalContext({ story, plan, triggers, standingGoals, slips, goal, lifeGoals }),
          action,
          message: spoken,
          history,
        },
      });
      addChat({ role: "assistant", content: res.text });
    } catch {
      addChat({
        role: "assistant",
        content: "I'm still with you. Take a slow breath. Reach a trusted person if you need one.",
      });
    } finally {
      setBusy(false);
      requestAnimationFrame(() => {
        listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    }
  }

  return (
    <AppFrame title="Stay with me">
      <div className="mb-3 rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed">
        {personalize(struggles).urgeFraming}
        {story.called ? ` I'm with you, ${story.called}.` : null}
      </div>

      <SponsorCall className="mb-3" showSetupLink />

      <AiDisclosure className="mb-3" />
      <NeedHelpNow variant="banner" className="mb-3" />

      <div ref={listRef} className="flex min-h-40 flex-col gap-2.5">
        {chat.map((m) => (
          <p
            key={m.id}
            className={cn(
              "max-w-[92%] rounded-xl px-3.5 py-3 text-sm leading-relaxed",
              m.role === "assistant"
                ? "bg-muted text-foreground"
                : "ml-auto bg-primary text-primary-foreground",
            )}
          >
            {m.content}
          </p>
        ))}
        {busy ? (
          <p className="max-w-[70%] rounded-xl bg-muted px-3.5 py-3 text-sm text-muted-foreground">
            Stay with me…
          </p>
        ) : null}
      </div>

      {lastAssistant && !busy ? (
        <div className="mt-3">
          <SpeakButton text={lastAssistant.content} label="Hear Buddy" />
        </div>
      ) : null}

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send("free", draft);
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tell me what's happening…"
          aria-label="Message"
          disabled={busy}
        />
        <Button type="submit" disabled={busy || !draft.trim()}>
          Send
        </Button>
      </form>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {ACTIONS.map(({ id, label, Icon }) => (
          <Button
            key={id}
            type="button"
            variant="outline"
            className="h-auto min-h-11 justify-start whitespace-normal py-2.5 text-left"
            disabled={busy}
            onClick={() => void send(id)}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Button>
        ))}
      </div>

      {showBreath ? (
        <div className="mt-4 rounded-2xl border border-border bg-card px-4 py-4">
          <Breathing />
        </div>
      ) : null}

      <div className="mt-4">
        <UrgeTimer />
      </div>

      <Button variant="secondary" className="mt-3 w-full" asChild>
        <Link to="/help">
          <Phone className="size-4" />I need a real person right now
        </Link>
      </Button>
      <Button variant="ghost" className="mt-1 w-full" onClick={resetChat} disabled={busy}>
        Start a new moment
      </Button>
    </AppFrame>
  );
}
