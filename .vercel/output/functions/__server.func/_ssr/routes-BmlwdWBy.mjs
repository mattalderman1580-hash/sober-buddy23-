import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as useAppStore, n as CrossGlyph, t as Button } from "./store-j1xjXGlW.mjs";
import { _ as Link, v as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useHasHydrated } from "./use-hydrated-CqdKy0m7.mjs";
import { n as CardContent, t as Card } from "./card-Hyqb2Jn2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BmlwdWBy.js
var import_jsx_runtime = require_jsx_runtime();
function Welcome() {
	const hydrated = useHasHydrated();
	const onboarded = useAppStore((s) => s.onboarded);
	if (hydrated && onboarded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/home" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-[max(2.5rem,env(safe-area-inset-top))]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col items-center text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossGlyph, { className: "size-7" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium tracking-[0.18em] text-muted-foreground",
						children: "GOD FIRST · RECOVERY · PURPOSE"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-3 font-display text-[2.05rem] font-medium leading-[1.12] tracking-tight",
						children: [
							"When the urge hits,",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"you don't have to face it alone."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-sm text-[0.975rem] leading-relaxed text-muted-foreground",
						children: "A faith-based companion for the moments when you need strength, prayer, Scripture, or a next right step."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "mt-8 w-full text-left",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-2 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: "Jesus Christ is at the center."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed text-muted-foreground",
								children: "God the Father, Jesus Christ our Lord and Savior, and a life of faith come first. Sober Buddy points you toward God, Scripture, healthy choices, trusted people, and real-world support."
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "lg",
				className: "mt-8 w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/onboarding",
					children: "Begin"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-center text-xs leading-relaxed text-muted-foreground",
				children: "Support for the moment — not a replacement for professional or emergency care."
			})
		]
	});
}
//#endregion
export { Welcome as component };
