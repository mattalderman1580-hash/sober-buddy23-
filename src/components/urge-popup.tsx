import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AiDisclosure } from "@/components/ai-disclosure";
import { SpeakButton } from "@/components/speak-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askCompanion } from "@/lib/companion";
import { labelsFor } from "@/lib/struggles";
import { speakQueued } from "@/lib/speak";
import { personalContext, useAppStore } from "@/lib/store";
import { closeUrgeTalk, URGE_HELLO, useUrgeTalkOpen } from "@/lib/urge-talk";
import { cn } from "@/lib/utils";

let lastStart = 0;

export function UrgePopup() {
  const open = useUrgeTalkOpen();
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
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const now = Date.now();
    if (now - lastStart < 1200) return;
    lastStart = now;

    addChat({ role: "user", content: "I'm thinking about using right now." });
    addChat({ role: "assistant", content: URGE_HELLO });

    let cancelled = false;
    setBusy(true);
    void (async () => {
      try {
        const history = useAppStore
          .getState()
          .chat.slice(-8)
          .map((m) => ({ role: m.role, content: m.content }));
        const res = await askCompanion({
          data: {
            struggles: labelsFor(struggles),
            profile: personalContext({
              story,
              plan,
              triggers,
              standingGoals,
              slips,
              goal,
              lifeGoals,
            }),
            action: "talk",
            message: "I'm thinking about using right now.",
            history,
          },
        });
        if (cancelled) return;
        if (res.text && res.text !== URGE_HELLO) {
          addChat({ role: "assistant", content: res.text });
          speakQueued(res.text);
        }
      } catch {
        if (cancelled) return;
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    addChat,
    struggles,
    story,
    plan,
    triggers,
    standingGoals,
    slips,
    goal,
    lifeGoals,
  ]);

  if (!open || typeof document === "undefined") return null;

  const lastAssistant = [...chat].reverse().find((m) => m.role === "assistant");

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buddy is with you"
        className="flex max-h-[88dvh] w-full max-w-md flex-col rounded-t-3xl bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-lg"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Right now
            </p>
            <h2 className="font-display text-xl font-medium">Buddy is talking</h2>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={closeUrgeTalk}>
            <X className="size-4" />
          </Button>
        </div>

        {lastAssistant ? (
          <p className="mb-3 text-lg leading-snug">{lastAssistant.content}</p>
        ) : null}

        <AiDisclosure className="mb-2" />

        <div ref={listRef} className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto">
          {chat.slice(-6).map((m) => (
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
            <p className="text-sm text-muted-foreground">Buddy is still with you…</p>
          ) : null}
        </div>

        {lastAssistant && !busy ? (
          <div className="mt-3">
            <SpeakButton text={lastAssistant.content} label="Hear Buddy again" />
          </div>
        ) : null}

        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const spoken = draft.trim();
            if (!spoken || busy) return;
            addChat({ role: "user", content: spoken });
            setDraft("");
            setBusy(true);
            void (async () => {
              try {
                const history = useAppStore
                  .getState()
                  .chat.slice(-8)
                  .map((m) => ({ role: m.role, content: m.content }));
                const res = await askCompanion({
                  data: {
                    struggles: labelsFor(struggles),
                    profile: personalContext({
                      story,
                      plan,
                      triggers,
                      standingGoals,
                      slips,
                      goal,
                      lifeGoals,
                    }),
                    action: "free",
                    message: spoken,
                    history,
                  },
                });
                addChat({ role: "assistant", content: res.text });
                speakQueued(res.text);
              } catch {
                const text = "I'm still here. Take one slow breath, then tell me the next true thing.";
                addChat({ role: "assistant", content: text });
                speakQueued(text);
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Answer Buddy…"
            aria-label="Reply"
            disabled={busy}
          />
          <Button type="submit" disabled={busy || !draft.trim()}>
            Send
          </Button>
        </form>

        <Button asChild variant="ghost" className="mt-1 w-full">
          <Link to="/urge" onClick={closeUrgeTalk}>
            Open the full urge screen
          </Link>
        </Button>
      </div>
    </div>,
    document.body,
  );
}
