import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { canSpeak, speak, stopSpeak } from "@/lib/speak";
import { cn } from "@/lib/utils";

export function SpeakButton({
  text,
  label = "Speak this prayer",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [on, setOn] = useState(false);

  useEffect(() => () => stopSpeak(), []);

  return (
    <Button
      type="button"
      variant="secondary"
      className={cn("w-full", className)}
      onClick={() => {
        if (on) {
          stopSpeak();
          setOn(false);
          return;
        }
        if (!canSpeak()) {
          toast("This device cannot read aloud in this browser.");
          return;
        }
        const ok = speak(text);
        if (!ok) {
          toast("This device cannot read aloud in this browser.");
          return;
        }
        setOn(true);
        const estimated = Math.min(60_000, Math.max(4000, text.split(/\s+/).length * 420));
        window.setTimeout(() => setOn(false), estimated);
      }}
    >
      {on ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      {on ? "Stop" : label}
    </Button>
  );
}
