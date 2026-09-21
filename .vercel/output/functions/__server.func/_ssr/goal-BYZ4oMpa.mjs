import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as todayKey, l as useAppStore, t as Button } from "./store-j1xjXGlW.mjs";
import { v as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as LoadingScreen, t as AppFrame } from "./app-frame-M2G_9hKC.mjs";
import { t as Input } from "./input-DteINHNl.mjs";
import { t as useHasHydrated } from "./use-hydrated-CqdKy0m7.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as CardContent, t as Card } from "./card-Hyqb2Jn2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/goal-BYZ4oMpa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Goal() {
	const hydrated = useHasHydrated();
	const onboarded = useAppStore((s) => s.onboarded);
	const goal = useAppStore((s) => s.goal);
	const saveGoal = useAppStore((s) => s.saveGoal);
	const existing = goal.date === todayKey() ? goal.text : "";
	const [text, setText] = (0, import_react.useState)(existing);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingScreen, {});
	if (!onboarded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppFrame, {
		title: "Today's goal",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4 p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-medium",
					children: "Keep it simple."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-relaxed text-muted-foreground",
					children: "Choose one thing today that supports your recovery, faith, or future."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: text,
					onChange: (e) => setText(e.target.value),
					placeholder: "My goal today is…",
					"aria-label": "Today's goal"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					onClick: () => {
						saveGoal(text.trim());
						toast("Goal saved.");
					},
					disabled: !text.trim(),
					children: "Save goal"
				})
			]
		}) })
	});
}
//#endregion
export { Goal as component };
