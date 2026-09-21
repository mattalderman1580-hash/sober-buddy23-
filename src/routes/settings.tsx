import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { Smartphone } from "lucide-react";
import { toast } from "sonner";
import { AppFrame, LoadingScreen } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  const hydrated = useHasHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const resetAll = useAppStore((s) => s.resetAll);
  const navigate = useNavigate();

  if (!hydrated) return <LoadingScreen />;
  if (!onboarded) return <Navigate to="/" />;

  return (
    <AppFrame title="Settings">
      <div className="space-y-2">
        <Button asChild variant="outline" className="w-full justify-start">
          <Link to="/story">Your story</Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link to="/onboarding">Change my struggles</Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link to="/recovery">Edit recovery plan</Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link to="/wall">Prayer circle</Link>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-destructive"
          onClick={() => {
            resetAll();
            toast("Local data cleared.");
            navigate({ to: "/" });
          }}
        >
          Reset all local data
        </Button>
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-2 p-5">
          <p className="flex items-center gap-2 font-medium">
            <Smartphone className="size-4" />
            Update on your phone
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Publish this version, open it in Chrome on Android, then Add to Home screen again so
            the new pages replace the old shortcut.
          </p>
        </CardContent>
      </Card>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        Your story, check-ins, and recovery plan stay on this device. The prayer circle is a public
        board — first names only. This companion is not medical care, therapy, or emergency
        response.
      </p>
    </AppFrame>
  );
}
