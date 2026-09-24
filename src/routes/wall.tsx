import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { AlertTriangle, Flag, HandHelping, MessageCircle, Send, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { AvatarMark } from "@/components/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  amenWallPost,
  createWallPost,
  createWallReply,
  listWall,
  reportWallPost,
  type WallKind,
  type WallPost,
} from "@/lib/prayer-wall";
import { getDeviceId } from "@/lib/wall-identity";
import { checkWallPrivacy, WALL_MAX_BODY } from "@/lib/wall-safety";
import { ENCOURAGE_TEMPLATES, REQUEST_TEMPLATES } from "@/lib/messages";
import { useAppStore } from "@/lib/store";
import { formatRelative } from "@/lib/time";
import { useHasHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wall")({ component: Wall });

type Filter = "all" | "request" | "encourage";

function Wall() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const displayName = useAppStore((s) => s.displayName);
  const story = useAppStore((s) => s.story);
  const setDisplayName = useAppStore((s) => s.setDisplayName);
  const addLocalPrayer = useAppStore((s) => s.addLocalPrayer);
  const amenedIds = useAppStore((s) => s.amenedIds);
  const markAmen = useAppStore((s) => s.markAmen);
  const handle = displayName || story.called || "";

  const [kind, setKind] = useState<WallKind>("request");
  const [filter, setFilter] = useState<Filter>("all");
  const [name, setName] = useState(handle);
  const [body, setBody] = useState("");
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyFor, setReplyFor] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [reportTarget, setReportTarget] = useState<WallPost | null>(null);

  async function reload() {
    try {
      const rows = await listWall({ data: { deviceId: getDeviceId() } });
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

  const visible = useMemo(
    () => (filter === "all" ? posts : posts.filter((p) => p.kind === filter)),
    [posts, filter],
  );

  const privacy = useMemo(() => checkWallPrivacy(body), [body]);
  const replyPrivacy = useMemo(() => checkWallPrivacy(reply), [reply]);

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  async function publish() {
    if (privacy.blocked.length) {
      toast(privacy.blocked[0]);
      return;
    }
    let res: Awaited<ReturnType<typeof createWallPost>>;
    try {
      res = await createWallPost({
        data: { kind, displayName: name, body, deviceId: getDeviceId() },
      });
    } catch {
      toast("Could not post right now. Try again in a moment.");
      return;
    }
    if (!res.ok) {
      toast(res.error);
      return;
    }
    if (kind === "request") addLocalPrayer(body.trim());
    setDisplayName(name.trim());
    setBody("");
    toast(kind === "request" ? "Request is on the circle." : "Encouragement posted.");
    await reload();
  }

  async function sendReply(postId: number) {
    if (replyPrivacy.blocked.length) {
      toast(replyPrivacy.blocked[0]);
      return;
    }
    let res: Awaited<ReturnType<typeof createWallReply>>;
    try {
      res = await createWallReply({
        data: { postId, displayName: name || "Friend", body: reply },
      });
    } catch {
      toast("Could not send right now. Try again in a moment.");
      return;
    }
    if (!res.ok) {
      toast(res.error);
      return;
    }
    setReply("");
    setReplyFor(null);
    toast("Encouragement sent.");
    await reload();
  }

  async function amen(post: WallPost) {
    if (amenedIds.includes(post.id)) return;
    const res = await amenWallPost({ data: { postId: post.id } });
    if (!res.ok) {
      toast(res.error);
      return;
    }
    markAmen(post.id);
    setPosts((cur) => cur.map((p) => (p.id === post.id ? { ...p, amenCount: res.count } : p)));
  }

  async function confirmReport() {
    const post = reportTarget;
    setReportTarget(null);
    if (!post) return;
    try {
      const res = await reportWallPost({ data: { postId: post.id, deviceId: getDeviceId() } });
      if (!res.ok) {
        toast(res.error);
        return;
      }
    } catch {
      toast("Could not send the report. Try again in a moment.");
      return;
    }
    setPosts((cur) => cur.filter((p) => p.id !== post.id));
    toast("Thank you. We've hidden that post for you and flagged it.");
  }

  const templates = kind === "request" ? REQUEST_TEMPLATES : ENCOURAGE_TEMPLATES;

  return (
    <AppFrame title="Circle">
      <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
        PUBLIC FEED · FIRST NAME ONLY · NO PHONES
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Ask for prayer or send a word of encouragement. Reply on a request like a quiet social
        thread. Send privately from People.
      </p>

      <Card className="mt-4">
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setKind("request")}
              className={cn(
                "h-9 rounded-md text-sm font-medium",
                kind === "request" ? "bg-card text-foreground" : "text-muted-foreground",
              )}
            >
              Request
            </button>
            <button
              type="button"
              onClick={() => setKind("encourage")}
              className={cn(
                "h-9 rounded-md text-sm font-medium",
                kind === "encourage" ? "bg-card text-foreground" : "text-muted-foreground",
              )}
            >
              Encourage
            </button>
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
            aria-label="Display name"
          />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={WALL_MAX_BODY}
            placeholder={
              kind === "request"
                ? "Ask for prayer in a sentence or two…"
                : "A short word of courage for the circle…"
            }
          />
          <div className="flex flex-wrap gap-1.5">
            {templates.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setBody(t)}
                className="rounded-md border border-border px-2 py-1 text-left text-[11px] leading-snug text-muted-foreground"
              >
                {t.slice(0, 42)}…
              </button>
            ))}
          </div>
          <PrivacyNotes blocked={privacy.blocked} warnings={privacy.warnings} />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            This is public. Use a first name only, and leave out last names, phone numbers, emails,
            and addresses.
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {body.length}/{WALL_MAX_BODY}
            </p>
            <Button
              size="sm"
              onClick={() => void publish()}
              disabled={
                body.trim().length < 8 || name.trim().length < 2 || privacy.blocked.length > 0
              }
            >
              <Send className="size-4" />
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button asChild variant="outline" className="mt-3 w-full">
        <Link to="/people">Send to someone I know</Link>
      </Button>

      <div className="mt-5 flex gap-1">
        {(
          [
            ["all", "All"],
            ["request", "Requests"],
            ["encourage", "Courage"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              "h-8 rounded-full px-3 font-mono text-[10px] tracking-[0.12em]",
              filter === id ? "bg-secondary text-secondary-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="mt-3 space-y-2.5">
        {loading ? <p className="text-sm text-muted-foreground">Loading feed…</p> : null}
        {!loading && visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts in this filter. Be the first.</p>
        ) : null}
        {visible.map((p) => {
          const prayed = amenedIds.includes(p.id);
          return (
            <article key={p.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex gap-3">
                <AvatarMark name={p.displayName} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium">{p.displayName}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{formatRelative(p.createdAt)}</p>
                  </div>
                  <p
                    className={cn(
                      "font-mono text-[10px] tracking-[0.14em]",
                      p.kind === "request" ? "text-crisis" : "text-primary",
                    )}
                  >
                    {p.kind === "request" ? "PRAYER REQUEST" : "ENCOURAGEMENT"}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{p.body}</p>
                </div>
              </div>

              {p.replies.length ? (
                <ul className="mt-3 space-y-2 border-l border-border pl-3">
                  {p.replies.map((r) => (
                    <li key={r.id} className="flex gap-2">
                      <AvatarMark name={r.displayName} className="size-7 text-[9px]" />
                      <div>
                        <p className="text-xs font-medium">
                          {r.displayName}{" "}
                          <span className="font-mono font-normal text-muted-foreground">
                            {formatRelative(r.createdAt)}
                          </span>
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={prayed ? "secondary" : "outline"}
                  onClick={() => void amen(p)}
                  disabled={prayed}
                >
                  <HandHelping className="size-4" />
                  {prayed ? "Praying" : "I'm praying"}
                  <span className="font-mono tabular-nums">{p.amenCount}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReplyFor(replyFor === p.id ? null : p.id)}
                >
                  <MessageCircle className="size-4" />
                  Encourage
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto text-muted-foreground"
                  onClick={() => setReportTarget(p)}
                  aria-label={`Report post from ${p.displayName}`}
                >
                  <Flag className="size-4" />
                  Report
                </Button>
              </div>

              {replyFor === p.id ? (
                <div className="mt-3 space-y-2">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="A short word of encouragement…"
                    maxLength={WALL_MAX_BODY}
                  />
                  <PrivacyNotes blocked={replyPrivacy.blocked} warnings={replyPrivacy.warnings} />
                  <Button
                    size="sm"
                    onClick={() => void sendReply(p.id)}
                    disabled={reply.trim().length < 8 || replyPrivacy.blocked.length > 0}
                  >
                    Send encouragement
                  </Button>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      <AlertDialog open={reportTarget !== null} onOpenChange={(o) => !o && setReportTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report this post?</AlertDialogTitle>
            <AlertDialogDescription>
              Report posts that share someone&apos;s private details, are hurtful, or don&apos;t
              belong in a prayer circle. It will be hidden for you right away, and hidden for
              everyone if several people report it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmReport()}>Report post</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppFrame>
  );
}

function PrivacyNotes({ blocked, warnings }: { blocked: string[]; warnings: string[] }) {
  if (!blocked.length && !warnings.length) return null;
  return (
    <div className="space-y-1.5">
      {blocked.map((msg) => (
        <p
          key={msg}
          className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs leading-relaxed text-destructive"
        >
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
          {msg}
        </p>
      ))}
      {warnings.map((msg) => (
        <p
          key={msg}
          className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground"
        >
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {msg}
        </p>
      ))}
    </div>
  );
}
