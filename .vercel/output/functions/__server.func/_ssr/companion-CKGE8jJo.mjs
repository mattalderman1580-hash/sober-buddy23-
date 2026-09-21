import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as object, n as array, o as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/companion-CKGE8jJo.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
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
var ACTION_PROMPTS = {
	talk: "The person wants to talk. Invite them to share what is happening. Listen first. Ask one gentle question.",
	calm: "Help them slow down. Guide a simple breathing pause: feet on the floor, inhale slowly, longer exhale. Stay with them for the next minute.",
	distract: "Give two or three concrete, safe distractions for the next 10 minutes (water, a short walk, a trusted call, a simple chore). No shame.",
	reasons: "Remind them what they are protecting: their walk with God, freedom, family, future, and the person they are becoming. Use their stated reasons if present.",
	pray: "Pray with them out loud in the first person plural or as a prayer they can speak. Address God the Father and Jesus Christ. Keep it short and earnest.",
	scripture: "Share one short KJV verse that fits this moment, quote it clearly with the reference, then one sentence on the next right step.",
	free: "Respond to what they just said. Stay in this moment. Offer the next right step, not a lecture."
};
var FALLBACKS = {
	talk: "I'm here. Tell me what is going on. You don't have to have the right words.",
	calm: "Let's slow everything down. Put both feet on the floor. Breathe in slowly, then breathe out longer. Stay with me for the next minute.",
	distract: "Change your environment. Get water, walk somewhere safe, or call someone you trust. Your job for the next 10 minutes is simply not to give in.",
	reasons: "Remember what you are protecting: your relationship with God, your freedom, your family, your future, and the person you are becoming.",
	pray: "Father God, I need You right now. Jesus, my Lord and Savior, give me strength for this moment. Help me choose what is right, give me self-control, and lead me toward people who can help me. Amen.",
	scripture: "Philippians 4:13 (KJV): \"I can do all things through Christ which strengtheneth me.\" Take the next right step with Him.",
	free: "I'm still with you. Take one slow breath. You can get through the next few minutes. What would the next right step look like?"
};
var SYSTEM = `You are Sober Buddy, a Christian recovery companion. God the Father, and Jesus Christ our Lord and Savior, come first.

Voice: warm, steady, direct, adult. Short replies — usually 2 to 5 sentences. No slang performance, no therapy-speak pile-up, no shame.

You help in the moment of craving, temptation, anger, loneliness, or despair. The goal is the next 10 minutes, not the rest of their life.

Rules:
- Never instruct, describe, or eroticize drug use, gambling, porn, sexual acts, self-harm, or other harmful behavior.
- Never generate sexual content.
- If they express intent to die, self-harm, or are in immediate danger, tell them clearly to call 911 or 988 (US Suicide & Crisis Lifeline) now and to reach a trusted person. Do not discuss methods. Then stay present.
- Quote Scripture in KJV when you quote it, with the reference.
- Point toward prayer, one practical next step, and real people.
- You are support, not a doctor, therapist, or emergency service.`;
var askCompanion_createServerFn_handler = createServerRpc({
	id: "69c99a8de926f4613f3bc3f194db291df69df4b8b157231fe60f1a20b8a2fe37",
	name: "askCompanion",
	filename: "src/lib/companion.ts"
}, (opts) => askCompanion.__executeServer(opts));
var askCompanion = createServerFn({ method: "POST" }).validator((input) => InputSchema.parse(input)).handler(askCompanion_createServerFn_handler, async ({ data }) => {
	const fallback = FALLBACKS[data.action];
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		text: fallback
	};
	const userLine = data.action === "free" ? data.message?.trim() || "I need help in this moment." : ACTION_PROMPTS[data.action];
	const struggleLine = data.struggles.length ? `Selected struggles: ${data.struggles.join(", ")}.` : "Struggles not specified.";
	const reasonLine = data.reasons.trim() ? `Why they are choosing this life: ${data.reasons.trim()}` : "They have not written reasons yet.";
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				max_tokens: 350,
				temperature: .6,
				messages: [
					{
						role: "system",
						content: SYSTEM
					},
					{
						role: "system",
						content: `${struggleLine} ${reasonLine}`
					},
					...data.history.map((m) => ({
						role: m.role,
						content: m.content
					})),
					{
						role: "user",
						content: userLine
					}
				]
			})
		});
		if (!res.ok) return {
			ok: false,
			text: fallback
		};
		const text = (await res.json()).choices?.[0]?.message?.content?.trim();
		if (!text) return {
			ok: false,
			text: fallback
		};
		return {
			ok: true,
			text
		};
	} catch {
		return {
			ok: false,
			text: fallback
		};
	}
});
//#endregion
export { askCompanion_createServerFn_handler };
