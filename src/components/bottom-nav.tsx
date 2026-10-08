import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, BookOpen, LayoutGrid, ShieldAlert, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { openUrgeTalk } from "@/lib/urge-talk";

const ITEMS = [
  { to: "/home", label: "Home", Icon: LayoutGrid },
  { to: "/wall", label: "Circle", Icon: Users },
  { to: "/urge", label: "Urge", Icon: ShieldAlert, crisis: true },
  { to: "/faith", label: "Faith", Icon: BookOpen },
  { to: "/insights", label: "Data", Icon: Activity },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      aria-label="Primary"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {ITEMS.map((item) => {
          const { to, label, Icon } = item;
          const crisis = "crisis" in item && item.crisis;
          const active = pathname === to;
          if (crisis) {
            return (
              <button
                key={to}
                type="button"
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-crisis",
                )}
                onClick={() => openUrgeTalk()}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                {label}
              </button>
            );
          }
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
                crisis && !active ? "text-crisis" : null,
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
