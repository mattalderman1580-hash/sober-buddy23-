import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createWallPost, createWallReply, listWall, type WallKind, type WallPost } from "@/lib/prayer-wall";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";
import { cn, parseContacts } from "@/lib/utils";

export const Route = createFileRoute("/wall")({ component: Wall });

function Wall() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const displayName = useAppStore((s) => s.displayName);
  const story = useAppStore((s) => s.story);
  const setDisplayName = useAppStore((s) => s.setDisplayName);
  const addLocalPrayer = useAppStore((s) => s.addLocalPrayer);
  const localPrayers = useAppStore((s) => s.localPrayers);
  const contacts = parseContacts(useAppStore((s) => s.plan.contacts));
  const handle = displayName || story.called || "Anonymous";

  const [kind, setKind] = useState<WallKind>("request");
  const [name, setName] = useState(handle);
  const [body, setBody] = useState("");
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyFor, setReplyFor] = useState<number | null>(null);
  const [reply, setReply] = useState("");

  async function reload() {
    try {
      const rows = await listWall();
      setPosts(rows);
    } catch {
      toast("Circle is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  async function publish() {
    const res = await createWallPost({ data: { kind, displayName: name, body } });
    if (!res.ok) {
      toast(res.error);
      return;
    }
    if (kind === "request") addLocalPrayer(body.trim());
    setDisplayName(name.trim());
    setBody("");
    toast(kind === "request" ? "Request posted to the circle." : "Encouragement posted.");
    await reload();
  }

  async function sendReply(postId: number) {
    const res = await createWallReply({
      data: { postId, displayName: name, body: reply },
    });
    if (!res.ok) {
      toast(res.error);
      return;
    }
    setReply("");
    setReplyFor(null);
    toast("Sent.");
    await reload();
  }

  function shareText(text: string) {
    const payload = `Prayer from Sober Buddy:\n\n${text}\n\nI'm asking you to pray with me.`;
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({ title: "Prayer request", text: payload }).catch(() => {
        copy(payload);
      });
      return;
    }
    copy(payload);
  }

  function copy(text: string) {
    void navigator.clipboard.writeText(text).then(
      () => toast("Copied. Paste it to someone who will pray."),
      () => toast("Could not copy."),
    );
  }

  return (
    <AppFrame title="Prayer circle">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Post a request or a word of encouragement. This wall is public — first name only, no
        medical details, no phone numbers.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant={kind === "request" ? "default" : "outline"} onClick={() => setKind("request")}>
          Prayer request
        </Button>
        <Button
          variant={kind === "encourage" ? "default" : "outline"}
          onClick={() => setKind("encourage")}
        >
          Encouragement
        </Button>
      </div>

      <div className="mt-3 space-y-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name"
          aria-label="Display name"
        />
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            kind === "request"
              ? "Ask for prayer in a sentence or two…"
              : "A short word of courage for someone on this wall…"
          }
        />
        <Button className="w-full" onClick={() => void publish()} disabled={body.trim().length < 8}>
          Post to the circle
        </Button>
      </div>

      {contacts.filter((c) => c.phone).length ? (
        <Card className="mt-4">
          <CardContent className="space-y-2 p-4">
            <p className="text-sm font-medium">Send to my people</p>
            <p className="text-xs text-muted-foreground">
              Uses numbers you saved in My Recovery. Opens a text with your words.
            </p>
            <div className="flex flex-col gap-2">
              {contacts
                .filter((c) => c.phone)
                .map((c) => (
                  <Button key={`${c.name}-${c.phone}`} asChild variant="outline" size="sm">
                    <a
                      href={`sms:${c.phone.replace(/[^\d+]/g, "")}?body=${encodeURIComponent(
                        `It's ${name || "me"}. Can you pray? ${body.trim() || "I need prayer today."}`,
                      )}`}
                    >
                      Text {c.name}
                    </a>
                  </Button>
                ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() =>
                shareText(body.trim() || "Would you pray for me today? I need strength.")
              }
            >
              <Share2 className="size-4" />
              Share another way
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          Add people in My Recovery to text a request directly.
        </p>
      )}

      <section className="mt-6 space-y-3">
        <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">FEED</p>
        {loading ? <p className="text-sm text-muted-foreground">Loading circle…</p> : null}
        {!loading && posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Be the first to post.</p>
        ) : null}
        {posts.map((p) => (
          <Card key={p.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium">{p.displayName}</p>
                <span
                  className={cn(
                    "font-mono text-[10px] tracking-wide",
                    p.kind === "request" ? "text-crisis" : "text-muted-foreground",
                  )}
                >
                  {p.kind === "request" ? "REQUEST" : "ENCOURAGE"}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{p.body}</p>
              {p.replies.map((r) => (
                <div key={r.id} className="rounded-lg bg-muted px-3 py-2">
                  <p className="text-xs font-medium">{r.displayName}</p>
                  <p className="text-sm leading-relaxed">{r.body}</p>
                </div>
              ))}
              {replyFor === p.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="A short word of encouragement…"
                  />
                  <Button size="sm" onClick={() => void sendReply(p.id)} disabled={reply.trim().length < 8}>
                    Send encouragement
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setReplyFor(p.id)}>
                  Encourage
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      {localPrayers.length ? (
        <section className="mt-8">
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">ON THIS DEVICE</p>
          <ul className="mt-2 space-y-2">
            {localPrayers.slice(0, 5).map((p) => (
              <li key={p.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
                {p.body}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AppFrame>
  );
}
