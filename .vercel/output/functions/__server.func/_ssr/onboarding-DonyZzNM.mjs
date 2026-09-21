import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as cn, l as useAppStore, t as Button } from "./store-j1xjXGlW.mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as AppFrame } from "./app-frame-M2G_9hKC.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as ALL_STRUGGLES } from "./struggles-DNDZfwIG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-DonyZzNM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Onboarding() {
	const saved = useAppStore((s) => s.struggles);
	const finish = useAppStore((s) => s.finishOnboarding);
	const onboarded = useAppStore((s) => s.onboarded);
	const [selected, setSelected] = (0, import_react.useState)(saved);
	const navigate = useNavigate();
	function toggle(id) {
		setSelected((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
	}
	function done() {
		if (!selected.length) {
			toast("Choose at least one area you want help with.");
			return;
		}
		finish(selected);
		navigate({ to: "/home" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppFrame, {
		title: "Your journey",
		backTo: onboarded ? "/home" : "/",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-medium leading-tight",
				children: "What are you struggling with?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted-foreground",
				children: "Choose one or more. Support will follow what you select. You can change this later."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid grid-cols-2 gap-2.5",
				children: ALL_STRUGGLES.map(({ id, label, blurb, Icon }) => {
					const on = selected.includes(id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => toggle(id),
						className: cn("flex min-h-[7.5rem] flex-col items-start gap-2 rounded-xl border bg-card p-3.5 text-left transition-[border-color,background-color] duration-150", on ? "border-primary bg-muted" : "border-border"),
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
								className: "text-xs leading-snug text-muted-foreground",
								children: blurb
							})
						]
					}, id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "lg",
				className: "mt-6 w-full",
				onClick: done,
				children: onboarded ? "Save and continue" : "Build my Sober Buddy"
			}),
			!onboarded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				className: "mt-1 w-full",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: "Back"
				})
			}) : null
		]
	});
}
//#endregion
export { Onboarding as component };
