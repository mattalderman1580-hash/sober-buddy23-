import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/family")({ component: FamilyPage });

function FamilyPage() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const saved = useAppStore((s) => s.story);
  const saveStory = useAppStore((s) => s.saveStory);
  const [family, setFamily] = useState(saved.family);
  const [familySupport, setFamilySupport] = useState(saved.familySupport);
  const [familyNeed, setFamilyNeed] = useState(saved.familyNeed);

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  return (
    <AppFrame title="Family support">
      <p className="text-sm leading-relaxed text-muted-foreground">
        This stays on this device. Name the people who are for you, how they help, and what you
        need from them. Buddy can use a short version so replies stay personal.
      </p>
      <div className="mt-5 space-y-5">
        <Field label="Who is your family in this?" htmlFor="who">
          <Textarea
            id="who"
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            placeholder="Spouse, kids, parents, the person who still picks up…"
          />
        </Field>
        <Field label="How do they support you?" htmlFor="support">
          <Textarea
            id="support"
            value={familySupport}
            onChange={(e) => setFamilySupport(e.target.value)}
            placeholder="A ride to a meeting, prayer, a check-in text, watching the kids…"
          />
        </Field>
        <Field label="What do you need from them?" htmlFor="need">
          <Textarea
            id="need"
            value={familyNeed}
            onChange={(e) => setFamilyNeed(e.target.value)}
            placeholder="Honesty, space, patience, one call when the night gets hard…"
          />
        </Field>
        <Button
          className="w-full"
          size="lg"
          onClick={() => {
            saveStory({ ...saved, family, familySupport, familyNeed });
            toast("Family support saved on this device.");
          }}
        >
          Save family support
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
