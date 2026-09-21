import "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { a as daysSince, c as todayKey, i as cn, l as useAppStore, t as Button } from "./store-j1xjXGlW.mjs";
import { _ as Link, v as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as BookOpen, f as LifeBuoy, i as Target, p as Heart, s as RefreshCw, y as ClipboardList } from "../_libs/lucide-react.mjs";
import { n as LoadingScreen, t as AppFrame } from "./app-frame-M2G_9hKC.mjs";
import { t as useHasHydrated } from "./use-hydrated-CqdKy0m7.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as CardContent, t as Card } from "./card-Hyqb2Jn2.mjs";
import { r as verseForDay } from "./scripture-CzSPCkZW.mjs";
import { n as labelsFor } from "./struggles-DNDZfwIG.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground",
		secondary: "border-transparent bg-secondary text-secondary-foreground",
		outline: "border-border text-muted-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var LINKS = [
	{
		to: "/checkin",
		label: "Daily Check-In",
		blurb: "How are you doing?",
		Icon: ClipboardList
	},
	{
		to: "/recovery",
		label: "My Recovery",
		blurb: "Reasons, faith & goals",
		Icon: Heart
	},
	{
		to: "/faith",
		label: "God First",
		blurb: "Prayer & Scripture",
		Icon: BookOpen
	},
	{
		to: "/goal",
		label: "Today's Goal",
		blurb: "One small win",
		Icon: Target
	},
	{
		to: "/help",
		label: "Get Help",
		blurb: "Reach someone now",
		Icon: LifeBuoy
	},
	{
		to: "/onboarding",
		label: "My Struggles",
		blurb: "Change your focus",
		Icon: RefreshCw
	}
];
function Home() {
	const hydrated = useHasHydrated();
	const onboarded = useAppStore((s) => s.onboarded);
	const struggles = useAppStore((s) => s.struggles);
	const plan = useAppStore((s) => s.plan);
	const wins = useAppStore((s) => s.wins);
	const goal = useAppStore((s) => s.goal);
	const recordWin = useAppStore((s) => s.recordWin);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingScreen, {});
	if (!onboarded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	const days = plan.startDate ? daysSince(plan.startDate) : null;
	const verse = verseForDay();
	const labels = labelsFor(struggles);
	const goalToday = goal.date === todayKey() ? goal.text : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppFrame, {
		brand: true,
		showSettings: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-hidden bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-5 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "God first" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: labels.length ? labels.join(" · ") : "Your journey"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-display text-5xl font-medium tabular-nums leading-none tracking-tight",
							children: days === null ? "—" : days
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: days === null ? "Set your start date in My Recovery." : days === 1 ? "day. Keep going." : "days. Keep going."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-1 p-5 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium leading-snug",
						children: "When the urge hits, you don't have to face it alone."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Turn toward God. Take the next right step."
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "crisis",
				size: "xl",
				className: "mt-4 w-full font-semibold tracking-wide",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/urge",
					children: "I'm thinking about giving in"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid grid-cols-2 gap-2.5",
				children: LINKS.map(({ to, label, blurb, Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to,
					className: "flex min-h-[7.25rem] flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left shadow-[0_1px_2px_color-mix(in_oklab,var(--color-foreground)_6%,transparent)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-5 text-primary",
							strokeWidth: 1.75
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium leading-snug",
							children: label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: blurb
						})
					]
				}, to))
			}),
			goalToday ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-center text-sm text-muted-foreground",
				children: ["Today's goal: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-foreground",
					children: goalToday
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3 p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-lg font-medium leading-snug",
						children: [
							"“",
							verse.text,
							"”"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-muted-foreground",
						children: verse.ref
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-2xl border border-border bg-card p-5 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Made it through an urge?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3 w-full",
						onClick: () => {
							recordWin();
							toast("That's a win. One urge at a time. Keep God first.");
						},
						children: "I made it through"
					}),
					wins.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-muted-foreground tabular-nums",
						children: [
							wins.length,
							" urge",
							wins.length === 1 ? "" : "s",
							" recorded"
						]
					}) : null
				]
			})
		]
	});
}
//#endregion
export { Home as component };
