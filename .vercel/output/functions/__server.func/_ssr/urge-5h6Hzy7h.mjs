import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as cn, l as useAppStore, t as Button } from "./store-j1xjXGlW.mjs";
import { _ as Link, v as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as BookOpen, d as MessageCircle, h as HandHelping, l as Phone, n as Waves, p as Heart, t as Wind } from "../_libs/lucide-react.mjs";
import { n as LoadingScreen, t as AppFrame } from "./app-frame-M2G_9hKC.mjs";
import { t as Input } from "./input-DteINHNl.mjs";
import { t as useHasHydrated } from "./use-hydrated-CqdKy0m7.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as object, n as array, o as string, t as _enum } from "../_libs/zod.mjs";
import { n as labelsFor } from "./struggles-DNDZfwIG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/urge-5h6Hzy7h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PHASES = [
	{
		label: "Breathe in",
		ms: 4e3
	},
	{
		label: "Hold",
		ms: 4e3
	},
	{
		label: "Breathe out",
		ms: 4e3
	},
	{
		label: "Hold",
		ms: 4e3
	}
];
function Breathing() {
	const [i, setI] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const t = window.setTimeout(() => setI((n) => (n + 1) % PHASES.length), PHASES[i].ms);
		return () => window.clearTimeout(t);
	}, [i]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-4 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex size-36 items-center justify-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "breathe-ring absolute inset-0 rounded-full bg-secondary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "relative z-10 font-display text-base font-medium text-primary",
				children: PHASES[i].label
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-center text-sm text-muted-foreground",
			children: "Box breathing. Stay for a few rounds."
		})]
	});
}
var DURATION = 600;
function format(s) {
	const m = Math.floor(s / 60);
	const r = s % 60;
	return `${m}:${String(r).padStart(2, "0")}`;
}
function UrgeTimer() {
	const [left, setLeft] = (0, import_react.useState)(DURATION);
	const [running, setRunning] = (0, import_react.useState)(false);
	const end = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		if (!running) return;
		const id = window.setInterval(() => {
			const next = Math.max(0, Math.ceil((end.current - Date.now()) / 1e3));
			setLeft(next);
			if (next === 0) {
				setRunning(false);
				toast("You made it through 10 minutes. Pause, pray, and take the next right step.");
			}
		}, 250);
		return () => window.clearInterval(id);
	}, [running]);
	function start() {
		end.current = Date.now() + DURATION * 1e3;
		setLeft(DURATION);
		setRunning(true);
	}
	function stop() {
		setRunning(false);
		setLeft(DURATION);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-5 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.16em] text-muted-foreground",
				children: "TEN MINUTES"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-5xl font-medium tabular-nums leading-none tracking-tight",
				children: format(left)
			}),
			running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: stop,
				children: "Reset timer"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: start,
				children: "Start 10-minute timer"
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var ActionSchema = _enum([
	"talk",
	"calm",
	"distract",
	"reasons",
	"pray",
	"scripture",
	"free"
]);
var InputSchema = object({
	struggles: array(string()).max(12),
	reasons: string().max(800),
	action: ActionSchema,
	message: string().max(800).optional(),
	history: array(object({
		role: _enum(["user", "assistant"]),
		content: string().max(1400)
	})).max(8)
});
var askCompanion = createServerFn({ method: "POST" }).validator((input) => InputSchema.parse(input)).handler(createSsrRpc("69c99a8de926f4613f3bc3f194db291df69df4b8b157231fe60f1a20b8a2fe37"));
var ACTIONS = [
	{
		id: "talk",
		label: "Talk to me",
		Icon: MessageCircle
	},
	{
		id: "calm",
		label: "Help me calm down",
		Icon: Wind
	},
	{
		id: "distract",
		label: "Distract me",
		Icon: Waves
	},
	{
		id: "reasons",
		label: "Remind me why",
		Icon: Heart
	},
	{
		id: "pray",
		label: "Pray with me",
		Icon: HandHelping
	},
	{
		id: "scripture",
		label: "Give me Scripture",
		Icon: BookOpen
	}
];
function Urge() {
	const hydrated = useHasHydrated();
	const onboarded = useAppStore((s) => s.onboarded);
	const struggles = useAppStore((s) => s.struggles);
	const reasons = useAppStore((s) => s.plan.reasons);
	const chat = useAppStore((s) => s.chat);
	const addChat = useAppStore((s) => s.addChat);
	const resetChat = useAppStore((s) => s.resetChat);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [showBreath, setShowBreath] = (0, import_react.useState)(false);
	const listRef = (0, import_react.useRef)(null);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingScreen, {});
	if (!onboarded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	async function send(action, message) {
		if (busy) return;
		const spoken = action === "free" ? message?.trim() : ACTIONS.find((a) => a.id === action)?.label;
		if (action === "free" && !spoken) return;
		if (action === "calm") setShowBreath(true);
		if (spoken) addChat({
			role: "user",
			content: spoken
		});
		setBusy(true);
		setDraft("");
		const history = [...chat.map((m) => ({
			role: m.role,
			content: m.content
		})), ...spoken ? [{
			role: "user",
			content: spoken
		}] : []].slice(-8);
		try {
			const res = await askCompanion({ data: {
				struggles: labelsFor(struggles),
				reasons,
				action,
				message: spoken,
				history
			} });
			addChat({
				role: "assistant",
				content: res.text
			});
		} catch {
			addChat({
				role: "assistant",
				content: "I'm still with you. Take a slow breath. Reach a trusted person if you need one."
			});
		} finally {
			setBusy(false);
			requestAnimationFrame(() => {
				listRef.current?.lastElementChild?.scrollIntoView({
					behavior: "smooth",
					block: "end"
				});
			});
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppFrame, {
		title: "Stay with me",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed",
				children: "God first. Take a breath. Ask Jesus Christ for strength for this moment."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: listRef,
				className: "flex min-h-40 flex-col gap-2.5",
				children: [chat.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("max-w-[92%] rounded-xl px-3.5 py-3 text-sm leading-relaxed", m.role === "assistant" ? "bg-muted text-foreground" : "ml-auto bg-primary text-primary-foreground"),
					children: m.content
				}, m.id)), busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-[70%] rounded-xl bg-muted px-3.5 py-3 text-sm text-muted-foreground",
					children: "Stay with me…"
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 flex gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					send("free", draft);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					placeholder: "Tell me what's happening…",
					"aria-label": "Message",
					disabled: busy
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy || !draft.trim(),
					children: "Send"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: ACTIONS.map(({ id, label, Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					className: "h-auto min-h-11 justify-start whitespace-normal py-2.5 text-left",
					disabled: busy,
					onClick: () => void send(id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }), label]
				}, id))
			}),
			showBreath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 rounded-2xl border border-border bg-card px-4 py-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breathing, {})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UrgeTimer, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "mt-3 w-full",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/help",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4" }), "I need a real person right now"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				className: "mt-1 w-full",
				onClick: resetChat,
				disabled: busy,
				children: "Start a new moment"
			})
		]
	});
}
//#endregion
export { Urge as component };
