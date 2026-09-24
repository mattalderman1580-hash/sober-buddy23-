import { Link } from "@tanstack/react-router";
import { LifeBuoy, Phone, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = "banner" | "button" | "inline";

/**
 * Compact crisis / real-person entry. Links to /help and can open a short resource sheet.
 * Uses well-known US numbers only (988, SAMHSA, 911).
 */
export function NeedHelpNow({
  variant = "banner",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const trigger =
    variant === "button" ? (
      <Button
        type="button"
        variant="outline"
        className={cn("w-full justify-start", className)}
        onClick={() => setOpen(true)}
      >
        <LifeBuoy className="size-4" />
        Need help now?
      </Button>
    ) : variant === "inline" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "text-sm font-medium text-crisis underline-offset-2 hover:underline",
          className,
        )}
      >
        Need help now?
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border border-crisis/25 bg-crisis/5 px-4 py-3 text-left text-sm",
          className,
        )}
      >
        <LifeBuoy className="size-4 shrink-0 text-crisis" />
        <span className="min-w-0">
          <span className="block font-medium text-foreground">Need help now?</span>
          <span className="block text-xs text-muted-foreground">
            Talk to a real person · 988 · SAMHSA · your contacts
          </span>
        </span>
      </button>
    );

  return (
    <>
      {trigger}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="crisis-help-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p id="crisis-help-title" className="font-medium">
                  Talk to a real person
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Sober Buddy&apos;s AI is not crisis care. In an emergency, call local emergency
                  services.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2">
              <Button asChild variant="crisis" size="lg" className="w-full">
                <a href="tel:911">
                  <Phone className="size-4" />
                  Call 911 — emergency
                </a>
              </Button>
              <Button asChild size="lg" className="w-full">
                <a href="tel:988">Call 988 — Suicide &amp; Crisis Lifeline</a>
              </Button>
              <Button asChild variant="secondary" className="w-full">
                <a href="sms:988">Text 988</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="tel:18006624357">SAMHSA 1-800-662-HELP (4357)</a>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link to="/help" onClick={() => setOpen(false)}>
                  More options &amp; your saved contacts
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
