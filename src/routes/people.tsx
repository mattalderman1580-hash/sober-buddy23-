import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { MessageSquare, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ENCOURAGE_TEMPLATES, REQUEST_TEMPLATES } from "@/lib/messages";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";
import { cn, parseContacts } from "@/lib/utils";

export const Route = createFileRoute("/people")({ component: People });

function People() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const story = useAppStore((s) => s.story);
  const contacts = parseContacts(useAppStore((s) => s.plan.contacts));
  const name = useAppStore((s) => s.displayName) || story.called || "me";
  const sponsor = useAppStore((s) => s.sponsor);
  const setSponsor = useAppStore((s) => s.setSponsor);
  const [mode, setMode] = useState<"request" | "encourage">("request");
  const [body, setBody] = useState(REQUEST_TEMPLATES[0]!);

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  const templates = mode === "request" ? REQUEST_TEMPLATES : ENCOURAGE_TEMPLATES;
  const payload =
    mode === "request"
      ? `It's ${name}. ${body}`
      : `From ${name} via Sober Buddy:\n\n${body}`;

  function isSponsor(c: { name: string; phone: string }) {
    if (!sponsor) return false;
    const d = (v: string) => v.replace(/\D/g, "");
    return sponsor.name === c.name && d(sponsor.phone) === d(c.phone);
  }

  function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({ title: "Sober Buddy", text: payload }).catch(() => copy());
      return;
    }
    copy();
  }

  function copy() {
    void navigator.clipboard.writeText(payload).then(
      () => toast("Copied. Paste it to someone who will pray."),
      () => toast("Could not copy."),
    );
  }

  return (
    <AppFrame title="People">
      <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
        DIRECT SEND · DEVICE CONTACTS
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Write a prayer request or a word of encouragement, then text someone you trust. The public
        circle is a separate feed.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => {
            setMode("request");
            setBody(REQUEST_TEMPLATES[0]!);
          }}
          className={cn(
            "h-9 rounded-md text-sm font-medium",
            mode === "request" ? "bg-card text-foreground" : "text-muted-foreground",
          )}
        >
          Ask for prayer
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("encourage");
            setBody(ENCOURAGE_TEMPLATES[0]!);
          }}
          className={cn(
            "h-9 rounded-md text-sm font-medium",
            mode === "encourage" ? "bg-card text-foreground" : "text-muted-foreground",
          )}
        >
          Encourage
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {templates.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setBody(t)}
            className={cn(
              "rounded-md border px-2 py-1 text-left text-[11px] leading-snug",
              body === t ? "border-primary text-foreground" : "border-border text-muted-foreground",
            )}
          >
            {t.slice(0, 48)}
          </button>
        ))}
      </div>

      <Textarea className="mt-3" value={body} onChange={(e) => setBody(e.target.value)} />

      <div className="mt-3 flex gap-2">
        <Button className="flex-1" variant="outline" onClick={share}>
          <Share2 className="size-4" />
          Share
        </Button>
        <Button className="flex-1" asChild variant="outline">
          <Link to="/wall">Post to Circle</Link>
        </Button>
      </div>

      <section className="mt-6 space-y-2">
        <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">SAVED PEOPLE</p>
        {contacts.filter((c) => c.phone).length === 0 ? (
          <Card>
            <CardContent className="space-y-2 p-4">
              <p className="text-sm">No numbers saved yet.</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/recovery">Add people in Plan</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          contacts
            .filter((c) => c.phone)
            .map((c) => (
              <div
                key={`${c.name}-${c.phone}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {c.name}
                    {isSponsor(c) ? (
                      <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] tracking-[0.12em] text-secondary-foreground">
                        SPONSOR
                      </span>
                    ) : null}
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground">{c.phone}</p>
                  {!isSponsor(c) ? (
                    <button
                      type="button"
                      className="mt-0.5 text-[11px] text-muted-foreground underline-offset-2 hover:underline"
                      onClick={() => {
                        setSponsor({ name: c.name, phone: c.phone });
                        toast(`${c.name} is now your sponsor.`);
                      }}
                    >
                      Make my sponsor
                    </button>
                  ) : null}
                </div>
                <Button asChild size="sm">
                  <a href={`sms:${c.phone.replace(/[^\d+]/g, "")}?body=${encodeURIComponent(payload)}`}>
                    <MessageSquare className="size-4" />
                    Text
                  </a>
                </Button>
              </div>
            ))
        )}
      </section>
    </AppFrame>
  );
}
