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

export const Route = createFileRoute("/recovery")({ component: Recovery });

function Recovery() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const saved = useAppStore((s) => s.plan);
  const savePlan = useAppStore((s) => s.savePlan);
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(saved.startDate);
  const [reasons, setReasons] = useState(saved.reasons);
  const [contacts, setContacts] = useState(saved.contacts);
  const [goals, setGoals] = useState(saved.goals);

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  function submit() {
    savePlan({ startDate, reasons, contacts, goals });
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
