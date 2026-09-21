import { createFileRoute, Navigate } from "@tanstack/react-router";
import { MessageSquare, Phone } from "lucide-react";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";
import { formatPhoneHref, parseContacts } from "@/lib/utils";

export const Route = createFileRoute("/help")({ component: Help });

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
          <a href="tel:988">Call or text 988 — crisis line</a>
        </Button>
        <Button asChild variant="secondary" size="lg" className="w-full">
          <a href="tel:18006624357">SAMHSA helpline 1-800-662-HELP</a>
        </Button>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        If you are in immediate physical danger, call <strong className="text-foreground">911</strong>.
        In the U.S., call or text <strong className="text-foreground">988</strong> for the Suicide &
        Crisis Lifeline. Save people you trust in My Recovery so they appear here.
      </p>
    </AppFrame>
  );
}
