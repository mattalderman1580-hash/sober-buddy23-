import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as cn, l as useAppStore, t as Button } from "./store-j1xjXGlW.mjs";
import { v as Navigate, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as LoadingScreen, t as AppFrame } from "./app-frame-M2G_9hKC.mjs";
import { t as Input } from "./input-DteINHNl.mjs";
import { n as Textarea, t as Label } from "./textarea-DUvF3mf6.mjs";
import { t as useHasHydrated } from "./use-hydrated-CqdKy0m7.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkin-DwI9OT0g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Slider = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
	ref,
	className: cn("relative flex w-full touch-none select-none items-center", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
		className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-primary" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-5 rounded-full border border-primary bg-card shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50" })]
}));
Slider.displayName = Slider$1.displayName;
function Checkin() {
	const hydrated = useHasHydrated();
	const onboarded = useAppStore((s) => s.onboarded);
	const save = useAppStore((s) => s.saveCheckin);
	const history = useAppStore((s) => s.checkins);
	const navigate = useNavigate();
	const [mood, setMood] = (0, import_react.useState)("");
	const [urge, setUrge] = (0, import_react.useState)(0);
	const [trigger, setTrigger] = (0, import_react.useState)("");
	const [win, setWin] = (0, import_react.useState)("");
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingScreen, {});
	if (!onboarded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	function submit() {
		save({
			mood,
			urge,
			trigger,
			win
		});
		toast("Check-in saved. Keep going.");
		navigate({ to: "/home" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppFrame, {
		title: "Daily check-in",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "mood",
						children: "How are you feeling?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "mood",
						value: mood,
						onChange: (e) => setMood(e.target.value),
						placeholder: "hopeful, stressed, tired…"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
						"Urge level: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: urge
						}),
						"/10"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						value: [urge],
						min: 0,
						max: 10,
						step: 1,
						onValueChange: (v) => setUrge(v[0] ?? 0)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "trigger",
						children: "What triggered you?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "trigger",
						value: trigger,
						onChange: (e) => setTrigger(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "win",
						children: "What went well today?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "win",
						value: win,
						onChange: (e) => setWin(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					size: "lg",
					onClick: submit,
					children: "Save check-in"
				})
			]
		}), history.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-medium",
				children: "Recent check-ins"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2",
				children: history.slice(0, 6).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-card px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							new Date(c.date).toLocaleString(),
							" · urge ",
							c.urge,
							"/10"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm",
						children: c.mood || c.win || c.trigger || "Saved."
					})]
				}, c.id))
			})]
		}) : null]
	});
}
//#endregion
export { Checkin as component };
