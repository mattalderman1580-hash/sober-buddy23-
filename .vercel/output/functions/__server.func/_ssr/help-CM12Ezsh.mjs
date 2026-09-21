import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as useAppStore, o as formatPhoneHref, s as parseContacts, t as Button } from "./store-j1xjXGlW.mjs";
import { v as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as Phone, u as MessageSquare } from "../_libs/lucide-react.mjs";
import { n as LoadingScreen, t as AppFrame } from "./app-frame-M2G_9hKC.mjs";
import { t as useHasHydrated } from "./use-hydrated-CqdKy0m7.mjs";
import { n as CardContent, t as Card } from "./card-Hyqb2Jn2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/help-CM12Ezsh.js
var import_jsx_runtime = require_jsx_runtime();
function Help() {
	const hydrated = useHasHydrated();
	const onboarded = useAppStore((s) => s.onboarded);
	const contactsRaw = useAppStore((s) => s.plan.contacts);
	const contacts = parseContacts(contactsRaw);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingScreen, {});
	if (!onboarded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppFrame, {
		title: "Get help now",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-destructive/30 bg-destructive/5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-5 text-sm leading-relaxed",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "Don't face a dangerous moment alone."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-muted-foreground",
						children: "Sober Buddy is support, not a replacement for professional care or emergency services."
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-2",
				children: [
					contacts.filter((c) => c.phone).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "h-auto min-h-12 whitespace-normal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: formatPhoneHref(c.phone),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4" }),
									"Call ",
									c.name
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "h-auto min-h-12 whitespace-normal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `sms:${c.phone.replace(/[^\d+]/g, "")}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-4" }),
									"Text ",
									c.name
								]
							})
						})]
					}, `${c.name}-${c.phone}`)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "crisis",
						size: "lg",
						className: "w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "tel:911",
							children: "Call 911 — emergency"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						className: "w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "tel:988",
							children: "Call or text 988 — crisis line"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "secondary",
						size: "lg",
						className: "w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "tel:18006624357",
							children: "SAMHSA helpline 1-800-662-HELP"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-5 text-sm leading-relaxed text-muted-foreground",
				children: [
					"If you are in immediate physical danger, call ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						className: "text-foreground",
						children: "911"
					}),
					". In the U.S., call or text ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						className: "text-foreground",
						children: "988"
					}),
					" for the Suicide & Crisis Lifeline. Save people you trust in My Recovery so they appear here."
				]
			})
		]
	});
}
//#endregion
export { Help as component };
