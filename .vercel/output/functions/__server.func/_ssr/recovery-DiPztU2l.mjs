import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as useAppStore, t as Button } from "./store-j1xjXGlW.mjs";
import { v as Navigate, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as LoadingScreen, t as AppFrame } from "./app-frame-M2G_9hKC.mjs";
import { t as Input } from "./input-DteINHNl.mjs";
import { n as Textarea, t as Label } from "./textarea-DUvF3mf6.mjs";
import { t as useHasHydrated } from "./use-hydrated-CqdKy0m7.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recovery-DiPztU2l.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Recovery() {
	const hydrated = useHasHydrated();
	const onboarded = useAppStore((s) => s.onboarded);
	const saved = useAppStore((s) => s.plan);
	const savePlan = useAppStore((s) => s.savePlan);
	const navigate = useNavigate();
	const [startDate, setStartDate] = (0, import_react.useState)(saved.startDate);
	const [reasons, setReasons] = (0, import_react.useState)(saved.reasons);
	const [contacts, setContacts] = (0, import_react.useState)(saved.contacts);
	const [goals, setGoals] = (0, import_react.useState)(saved.goals);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingScreen, {});
	if (!onboarded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	function submit() {
		savePlan({
			startDate,
			reasons,
			contacts,
			goals
		});
		toast("Recovery plan saved.");
		navigate({ to: "/home" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppFrame, {
		title: "My recovery",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "sobriety",
						children: "Sobriety / start date"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "sobriety",
						type: "date",
						value: startDate,
						onChange: (e) => setStartDate(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "reasons",
						children: "Why am I choosing this life?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "reasons",
						value: reasons,
						onChange: (e) => setReasons(e.target.value),
						placeholder: "God, family, freedom, future, purpose…"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "contacts",
						children: "People I can call"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "contacts",
						value: contacts,
						onChange: (e) => setContacts(e.target.value),
						placeholder: "One per line: Name 555-123-4567"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "goals",
						children: "My goals"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "goals",
						value: goals,
						onChange: (e) => setGoals(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					size: "lg",
					onClick: submit,
					children: "Save my recovery plan"
				})
			]
		})
	});
}
//#endregion
export { Recovery as component };
