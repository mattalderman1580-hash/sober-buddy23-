import { initials } from "@/lib/time";
import { cn } from "@/lib/utils";

export function AvatarMark({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary font-mono text-[11px] font-medium tracking-wide text-secondary-foreground",
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
