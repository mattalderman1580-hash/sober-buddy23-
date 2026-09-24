import { Link } from "@tanstack/react-router";
import { MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { cn, formatPhoneHref } from "@/lib/utils";

export function smsHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `sms:${digits}` : "";
}

/**
 * One-tap Call / Text for the user's sponsor. Renders nothing (or a gentle
 * setup link when `showSetupLink`) if no sponsor phone is saved.
 */
export function SponsorCall({
  className,
  size = "lg",
  showSetupLink = false,
  onNavigate,
}: {
  className?: string;
  size?: "default" | "lg";
  showSetupLink?: boolean;
  onNavigate?: () => void;
}) {
  const sponsor = useAppStore((s) => s.sponsor);
  const tel = sponsor ? formatPhoneHref(sponsor.phone) : "";
  const sms = sponsor ? smsHref(sponsor.phone) : "";

  if (!sponsor || !tel) {
    if (!showSetupLink) return null;
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Have a sponsor or someone you call first?{" "}
        <Link
          to="/recovery"
          hash="sponsor"
          onClick={onNavigate}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Add them here
        </Link>
      </p>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <Button asChild size={size} className="h-auto min-h-12 whitespace-normal">
        <a href={tel}>
          <Phone className="size-4" />
          Call {sponsor.name}
        </a>
      </Button>
      <Button asChild size={size} variant="secondary" className="h-auto min-h-12 whitespace-normal">
        <a href={sms}>
          <MessageSquare className="size-4" />
          Text {sponsor.name}
        </a>
      </Button>
    </div>
  );
}
