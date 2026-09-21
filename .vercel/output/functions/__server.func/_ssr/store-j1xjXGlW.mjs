import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, r as Slot, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-j1xjXGlW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function daysSince(isoDate) {
	const start = /* @__PURE__ */ new Date(`${isoDate}T00:00:00`);
	if (Number.isNaN(start.getTime())) return 0;
	return Math.max(0, Math.floor((Date.now() - start.getTime()) / 864e5));
}
function todayKey(date = /* @__PURE__ */ new Date()) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function formatPhoneHref(raw) {
	const digits = raw.replace(/[^\d+]/g, "");
	return digits ? `tel:${digits}` : "";
}
function parseContacts(raw) {
	return raw.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
		const match = line.match(/^(.*?)([+]?\d[\d\s().-]{6,}\d)\s*$/);
		if (!match) return {
			name: line,
			phone: ""
		};
		return {
			name: match[1].replace(/[-:|,]+$/, "").trim() || "Support",
			phone: match[2].trim()
		};
	});
}
function uid() {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function CrossGlyph({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: cn("fill-current", className),
		"aria-hidden": "true",
		focusable: "false",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M10.25 2.5h3.5v6.25H20v3.5h-6.25V21.5h-3.5v-9.25H4v-3.5h6.25V2.5Z" })
	});
}
function Mark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground", className),
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossGlyph, { className: "size-5" })
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
			outline: "border border-border bg-card text-foreground hover:bg-muted",
			ghost: "text-foreground hover:bg-muted",
			crisis: "bg-crisis text-crisis-foreground hover:opacity-90 shadow-sm",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-11 min-h-11 px-4",
			sm: "h-9 min-h-9 rounded-sm px-3 text-sm",
			lg: "h-12 min-h-12 rounded-lg px-5 text-base",
			xl: "h-14 min-h-14 rounded-xl px-5 text-base",
			icon: "size-11 min-h-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var EMPTY_PLAN = {
	startDate: "",
	reasons: "",
	contacts: "",
	goals: ""
};
var OPENING = {
	id: "opening",
	role: "assistant",
	content: "I'm here with you. You don't have to solve the rest of your life right now. Let's get through the next few minutes together. What happened right before the urge hit?"
};
var useAppStore = create()(persist((set, get) => ({
	onboarded: false,
	struggles: [],
	plan: EMPTY_PLAN,
	checkins: [],
	goal: {
		text: "",
		date: ""
	},
	wins: [],
	chat: [OPENING],
	setStruggles: (ids) => set({ struggles: ids }),
	finishOnboarding: (ids) => set({
		struggles: ids,
		onboarded: true
	}),
	savePlan: (plan) => set({ plan }),
	saveCheckin: (entry) => set({ checkins: [{
		...entry,
		id: uid(),
		date: (/* @__PURE__ */ new Date()).toISOString()
	}, ...get().checkins].slice(0, 60) }),
	saveGoal: (text) => set({ goal: {
		text,
		date: todayKey()
	} }),
	recordWin: () => set({ wins: [{
		id: uid(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	}, ...get().wins].slice(0, 100) }),
	addChat: (msg) => set({ chat: [...get().chat, {
		...msg,
		id: uid()
	}].slice(-40) }),
	resetChat: () => set({ chat: [{
		...OPENING,
		id: uid()
	}] }),
	resetAll: () => set({
		onboarded: false,
		struggles: [],
		plan: EMPTY_PLAN,
		checkins: [],
		goal: {
			text: "",
			date: ""
		},
		wins: [],
		chat: [OPENING]
	})
}), { name: "sober-buddy" }));
//#endregion
export { daysSince as a, todayKey as c, cn as i, useAppStore as l, CrossGlyph as n, formatPhoneHref as o, Mark as r, parseContacts as s, Button as t };
