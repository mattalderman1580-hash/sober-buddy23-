import { Link } from "@tanstack/react-router";
import { ChevronLeft, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Mark } from "@/components/cross-glyph";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppFrame({
  children,
  title,
  backTo = "/home",
  showSettings = false,
  brand = false,
  nav = true,
}: {
  children: ReactNode;
  title?: string;
  backTo?: "/" | "/home";
  showSettings?: boolean;
  brand?: boolean;
  nav?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))]",
        nav ? "pb-[calc(4.75rem+env(safe-area-inset-bottom))]" : "pb-10",
      )}
    >
      <header className="mb-5 flex items-center justify-between gap-3">
        {brand ? (
          <div className="flex min-w-0 items-center gap-3">
            <Mark />
            <div className="min-w-0">
              <p className="font-display text-lg font-medium leading-tight">Sober Buddy</p>
              <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
                LOCAL PROFILE · GOD FIRST
              </p>
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-1">
            <Button variant="ghost" size="icon" asChild className="-ml-2">
              <Link to={backTo} aria-label="Back">
                <ChevronLeft className="size-5" />
              </Link>
            </Button>
            <h1 className="truncate font-display text-xl font-medium">{title}</h1>
          </div>
        )}
        {showSettings ? (
          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings" aria-label="Settings">
              <Settings className="size-5" />
            </Link>
          </Button>
        ) : brand ? null : (
          <span className="size-11 shrink-0" aria-hidden="true" />
        )}
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      {nav ? <BottomNav /> : null}
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background">
      <Mark />
      <p className="font-display text-lg font-medium">Sober Buddy</p>
    </div>
  );
}
