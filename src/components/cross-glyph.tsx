import { cn } from "@/lib/utils";

export function CrossGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("fill-current", className)}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M10.25 2.5h3.5v6.25H20v3.5h-6.25V21.5h-3.5v-9.25H4v-3.5h6.25V2.5Z" />
    </svg>
  );
}

export function Mark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden="true"
    >
      <CrossGlyph className="size-5" />
    </span>
  );
}
