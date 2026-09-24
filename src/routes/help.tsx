import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ExternalLink, MessageSquare, Phone } from "lucide-react";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { SponsorCall } from "@/components/sponsor-call";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";
import { formatPhoneHref, parseContacts } from "@/lib/utils";

export const Route = createFileRoute("/help")({ component: Help });

/** Official meeting finders. Each URL was checked to resolve before shipping. */
const MEETING_FINDERS = [
  {
    name: "Alcoholics Anonymous",
    blurb: "Find A.A. meetings near you or online",
    href: "https://www.aa.org/find-aa",
  },
  {
    name: "Narcotics Anonymous",
    blurb: "NA meeting search",
    href: "https://na.org/meetingsearch/",
  },
  {
    name: "Celebrate Recovery",
    blurb: "Christ-centered recovery groups",
    href: "https://crlocator.com/",
  },
  {
    name: "SMART Recovery",
    blurb: "In-person and online meetings",
    href: "https://meetings.smartrecovery.org/meetings/",
  },
] as const;

function Help() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const contactsRaw = useAppStore((s) => s.plan.contacts);
  const contacts = parseContacts(contactsRaw);

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  return (
    <AppFrame title="Get help now">
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-5 text-sm leading-relaxed">
          <p className="font-medium">Don't face a dangerous moment alone.</p>
          <p className="mt-1 text-muted-foreground">
            Sober Buddy is support, not a replacement for professional care or emergency services.
          </p>
        </CardContent>
      </Card>

      <div className="mt-4 space-y-2">
        <SponsorCall showSetupLink />
        {contacts.filter((c) => c.phone).map((c) => (
          <div key={`${c.name}-${c.phone}`} className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="h-auto min-h-12 whitespace-normal">
              <a href={formatPhoneHref(c.phone)}>
                <Phone className="size-4" />
                Call {c.name}
              </a>
            </Button>
            <Button asChild variant="outline" className="h-auto min-h-12 whitespace-normal">
              <a href={`sms:${c.phone.replace(/[^\d+]/g, "")}`}>
                <MessageSquare className="size-4" />
                Text {c.name}
              </a>
            </Button>
          </div>
        ))}

        <Button asChild variant="crisis" size="lg" className="w-full">
          <a href="tel:911">Call 911 — emergency</a>
        </Button>
        <Button asChild size="lg" className="w-full">
          <a href="tel:988">Call 988 — Suicide &amp; Crisis Lifeline</a>
        </Button>
        <Button asChild variant="secondary" size="lg" className="w-full">
          <a href="sms:988">Text 988</a>
        </Button>
        <Button asChild variant="secondary" size="lg" className="w-full">
          <a href="tel:18006624357">SAMHSA helpline 1-800-662-HELP (4357)</a>
        </Button>
      </div>

      <section className="mt-6 space-y-2">
        <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
          FIND A MEETING
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          You don&apos;t have to walk this road alone. A room full of people who understand is
          often one search away.
        </p>
        {MEETING_FINDERS.map((m) => (
          <a
            key={m.href}
            href={m.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium">{m.name}</span>
              <span className="block text-xs text-muted-foreground">{m.blurb}</span>
            </span>
            <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
          </a>
        ))}
      </section>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        If you are in immediate physical danger, call <strong className="text-foreground">911</strong>.
        In the U.S., call or text <strong className="text-foreground">988</strong> for the Suicide &amp;
        Crisis Lifeline. SAMHSA can help you find treatment and support. These resources are for
        crisis and finding help — the app does not provide therapy. Sober Buddy&apos;s AI is a
        support tool, not a crisis line. Save people you trust in your recovery plan so they appear
        here.
      </p>
    </AppFrame>
  );
}
