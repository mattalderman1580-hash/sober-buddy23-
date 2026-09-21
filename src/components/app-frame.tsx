import { Link } from "@tanstack/react-router";
import { ChevronLeft, Settings } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Mark } from "@/components/cross-glyph";
import { Button } from "@/components/ui/button";
import { formatStamp } from "@/lib/time";
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
  backTo?: "/" | "/home" | "/wall";
  showSettings?: boolean;
  brand?: boolean;
  nav?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))]",
        nav ? "pb-[calc(4.75rem+env(safe-area-inset-bottom))]" : "pb-10",
      )}
    >
      <header className="mb-4 border-b border-border pb-3">
        <div className="flex items-center justify-between gap-3">
          {brand ? (
            <div className="flex min-w-0 items-center gap-3">
              <Mark className="size-10 rounded-md" />
              <div className="min-w-0">
                <p className="text-[15px] font-medium leading-tight tracking-tight">Sober Buddy</p>
                <ClockLine />
              </div>
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-1">
              <Button variant="ghost" size="icon" asChild className="-ml-2">
                <Link to={backTo} aria-label="Back">
                  <ChevronLeft className="size-5" />
                </Link>
              </Button>
              <h1 className="truncate text-lg font-medium tracking-tight">{title}</h1>
            </div>
          )}
          {showSettings ? (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/settings" aria-label="Settings">
                <Settings className="size-5" />
              </Link>
            </Button>
          ) : brand ? (
            <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">SYS</span>
          ) : (
            <span className="size-11 shrink-0" aria-hidden="true" />
          )}
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      {nav ? <BottomNav /> : null}
    </div>
  );
}

function ClockLine() {
  const [now, setNow] = useState(() => formatStamp());
  useEffect(() => {
    const id = window.setInterval(() => setNow(formatStamp()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">LOCAL · {now}</p>
  );
}

export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background">
      <Mark className="rounded-md" />
      <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground">SOBER BUDDY</p>
    </div>
  );
}
