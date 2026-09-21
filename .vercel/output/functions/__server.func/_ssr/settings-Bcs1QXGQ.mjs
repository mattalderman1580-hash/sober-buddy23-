import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as useAppStore, t as Button } from "./store-j1xjXGlW.mjs";
import { _ as Link, v as Navigate, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Smartphone } from "../_libs/lucide-react.mjs";
import { n as LoadingScreen, t as AppFrame } from "./app-frame-M2G_9hKC.mjs";
import { t as useHasHydrated } from "./use-hydrated-CqdKy0m7.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as CardContent, t as Card } from "./card-Hyqb2Jn2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-Bcs1QXGQ.js
var import_jsx_runtime = require_jsx_runtime();
function Settings() {
	const hydrated = useHasHydrated();
	const onboarded = useAppStore((s) => s.onboarded);
	const resetAll = useAppStore((s) => s.resetAll);
	const navigate = useNavigate();
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingScreen, {});
	if (!onboarded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppFrame, {
		title: "Settings",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						className: "w-full justify-start",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/onboarding",
							children: "Change my struggles"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						className: "w-full justify-start",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/recovery",
							children: "Edit recovery plan"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "w-full justify-start text-destructive",
						onClick: () => {
							resetAll();
							toast("Local data cleared.");
							navigate({ to: "/" });
						},
						children: "Reset all local data"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-2 p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4" }), "Put this on your phone"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted-foreground",
						children: "On Android, open this app in Chrome, tap the menu, and choose Add to Home screen. It will sit with your other apps. Your notes stay on this device."
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-sm leading-relaxed text-muted-foreground",
				children: "Check-ins, goals, and your recovery plan are stored only in this browser. This companion is not medical care, therapy, or emergency response."
			})
		]
	});
}
//#endregion
export { Settings as component };
