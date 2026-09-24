import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";
import { cn, parseContacts } from "@/lib/utils";

export const Route = createFileRoute("/recovery")({ component: Recovery });

function Recovery() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const saved = useAppStore((s) => s.plan);
  const savePlan = useAppStore((s) => s.savePlan);
  const savedSponsor = useAppStore((s) => s.sponsor);
  const setSponsor = useAppStore((s) => s.setSponsor);
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(saved.startDate);
  const [reasons, setReasons] = useState(saved.reasons);
  const [contacts, setContacts] = useState(saved.contacts);
  const [goals, setGoals] = useState(saved.goals);
  const [sponsorName, setSponsorName] = useState(savedSponsor?.name ?? "");
  const [sponsorPhone, setSponsorPhone] = useState(savedSponsor?.phone ?? "");

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  function submit() {
    savePlan({ startDate, reasons, contacts, goals });
    const name = sponsorName.trim();
    const phone = sponsorPhone.trim();
    setSponsor(name || phone ? { name: name || "Sponsor", phone } : null);
    toast("Recovery plan saved.");
    navigate({ to: "/home" });
  }

  return (
    <AppFrame title="My recovery">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="sobriety">Sobriety / start date</Label>
          <Input id="sobriety" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reasons">Why am I choosing this life?</Label>
          <Textarea
            id="reasons"
            value={reasons}
            onChange={(e) => setReasons(e.target.value)}
            placeholder="God, family, freedom, future, purpose…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contacts">People I can call</Label>
          <Textarea
            id="contacts"
            value={contacts}
            onChange={(e) => setContacts(e.target.value)}
            placeholder={"One per line: Name 555-123-4567"}
          />
        </div>
        <SponsorFields
          contacts={contacts}
          name={sponsorName}
          phone={sponsorPhone}
          onChange={(n, p) => {
            setSponsorName(n);
            setSponsorPhone(p);
          }}
        />
        <div className="space-y-2">
          <Label htmlFor="goals">My goals</Label>
          <Textarea id="goals" value={goals} onChange={(e) => setGoals(e.target.value)} />
        </div>
        <Button className="w-full" size="lg" onClick={submit}>
          Save my recovery plan
        </Button>
      </div>
    </AppFrame>
  );
}

function SponsorFields({
  contacts,
  name,
  phone,
  onChange,
}: {
  contacts: string;
  name: string;
  phone: string;
  onChange: (name: string, phone: string) => void;
}) {
  const withPhones = parseContacts(contacts).filter((c) => c.phone);
  const digits = (v: string) => v.replace(/\D/g, "");
  return (
    <div id="sponsor" className="scroll-mt-20 space-y-2 rounded-xl border border-border bg-card p-4">
      <Label>My sponsor</Label>
      <p className="text-xs leading-relaxed text-muted-foreground">
        The one person you call first. They&apos;ll get a one-tap Call and Text button in Urge
        mode and on Get help. Stays on this device.
      </p>
      {withPhones.length ? (
        <div className="flex flex-wrap gap-1.5">
          {withPhones.map((c) => {
            const active = name === c.name && digits(phone) === digits(c.phone);
            return (
              <button
                key={`${c.name}-${c.phone}`}
                type="button"
                onClick={() => onChange(c.name, c.phone)}
                className={cn(
                  "rounded-md border px-2 py-1 text-xs",
                  active ? "border-primary text-foreground" : "border-border text-muted-foreground",
                )}
              >
                {active ? "✓ " : ""}
                {c.name}
              </button>
            );
          })}
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <Input
          aria-label="Sponsor name"
          placeholder="Name"
          value={name}
          maxLength={60}
          onChange={(e) => onChange(e.target.value, phone)}
        />
        <Input
          aria-label="Sponsor phone"
          placeholder="Phone"
          type="tel"
          inputMode="tel"
          value={phone}
          maxLength={32}
          onChange={(e) => onChange(name, e.target.value)}
        />
      </div>
      {name || phone ? (
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => onChange("", "")}
        >
          Clear sponsor
        </button>
      ) : null}
    </div>
  );
}
