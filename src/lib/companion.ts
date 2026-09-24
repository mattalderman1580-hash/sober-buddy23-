import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CompanionAction } from "@/lib/types";

const ActionSchema = z.enum([
  "talk",
  "calm",
  "distract",
  "reasons",
  "pray",
  "scripture",
  "free",
]);

const InputSchema = z.object({
  struggles: z.array(z.string()).max(12),
  profile: z.string().max(500),
  action: ActionSchema,
  message: z.string().max(800).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(1400),
      }),
    )
    .max(8),
});

const ACTION_PROMPTS: Record<CompanionAction, string> = {
  talk: "The person wants to talk. Invite them to share what is happening. Listen first. Ask one gentle question. Use their profile snippet only if it helps.",
  calm: "Help them slow down. Guide a simple breathing pause: feet on the floor, inhale slowly, longer exhale. Stay with them for the next minute.",
  distract:
    "Give two or three concrete, safe distractions for the next 10 minutes (water, a short walk, a trusted call, a simple chore). No shame. Prefer ideas that fit their triggers or today's goal if mentioned.",
  reasons:
    "Remind them what they are protecting using THEIR protecting/reasons line if present. Be specific, not generic.",
  pray: "Pray with them out loud as a prayer they can speak. Address God the Father and Jesus Christ. Keep it short and earnest. Weave in what they said they are protecting if present.",
  scripture:
    "Share one short KJV verse that fits this moment, quote it clearly with the reference, then one sentence on the next right step.",
  free: "Respond to what they just said. Stay in this moment. Use their profile only when it helps. Offer the next right step, not a lecture.",
};

export const FALLBACKS: Record<CompanionAction, string> = {
  talk: "I'm here. Tell me what is going on. You don't have to have the right words.",
  calm: "Let's slow everything down. Put both feet on the floor. Breathe in slowly, then breathe out longer. Stay with me for the next minute.",
  distract:
    "Change your environment. Get water, walk somewhere safe, or call someone you trust. Your job for the next 10 minutes is simply not to give in.",
  reasons:
    "Remember what you are protecting: your relationship with God, your freedom, your family, your future, and the person you are becoming.",
  pray: "Father God, I need You right now. Jesus, my Lord and Savior, give me strength for this moment. Help me choose what is right, give me self-control, and lead me toward people who can help me. Amen.",
  scripture:
    'Philippians 4:13 (KJV): "I can do all things through Christ which strengtheneth me." Take the next right step with Him.',
  free: "I'm still with you. Take one slow breath. You can get through the next few minutes. What would the next right step look like?",
};

/** Plain-language summary of the askCompanion request body (for Settings / Privacy). */
export const COMPANION_SENT_SUMMARY = {
  whenConfigured:
    "If AI is configured, your request goes through our server to the model provider. If not, you still see local support replies and nothing is sent to a model.",
  included: [
    "The action you chose or the message you typed",
    "Struggle category labels from setup",
    "A short profile snippet (name, what you protect, up to 3 triggers, today's goal)",
    "Up to 8 recent Urge chat turns from this browser session",
  ],
  neverIncluded: [
    "Journal and private prayer notes",
    "Contact phone numbers and recovery-plan contact block",
    "Full story / faith text, full trigger list, standing goals, check-ins, and prior slips (unless you type them into After a slip)",
  ],
} as const;

const SYSTEM = `You are Sober Buddy, a Christian recovery companion. God the Father, and Jesus Christ our Lord and Savior, come first.

Voice: warm, steady, direct, adult. Short replies — usually 2 to 5 sentences. No slang performance, no therapy-speak pile-up, no shame.

You help in the moment of craving, temptation, anger, loneliness, despair, or after a slip. The goal is the next 10 minutes, then the next right step.

A profile of what they entered may be provided. Use it to personalize. Do not invent details they did not give. Never quote the profile back as a list.

If they describe a slip: no shame. Name the lesson, the next 24 hours, and a person to tell. A slip is data, not identity.

Rules:
- Never instruct, describe, or eroticize drug use, gambling, porn, sexual acts, self-harm, or other harmful behavior.
- Never generate sexual content.
- If they express intent to die, self-harm, or are in immediate danger, tell them clearly to call 911 or 988 (US Suicide & Crisis Lifeline) now and to reach a trusted person. Do not discuss methods. Then stay present.
- Quote Scripture in KJV when you quote it, with the reference.
- Point toward prayer, one practical next step, and real people.
- You are support, not a doctor, therapist, or emergency service.`;

export const askCompanion = createServerFn({ method: "POST" })
  .validator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true; text: string } | { ok: false; text: string }> => {
    const fallback = FALLBACKS[data.action];
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, text: fallback };

    const userLine =
      data.action === "free"
        ? data.message?.trim() || "I need help in this moment."
        : ACTION_PROMPTS[data.action];

    const struggleLine = data.struggles.length
      ? `Selected struggles: ${data.struggles.join(", ")}.`
      : "Struggles not specified.";

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 380,
          temperature: 0.55,
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "system",
              content: `${struggleLine} ${data.profile || "They have not filled in their story yet."}`,
            },
            ...data.history.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userLine },
          ],
        }),
      });

      if (!res.ok) return { ok: false, text: fallback };

      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = body.choices?.[0]?.message?.content?.trim();
      if (!text) return { ok: false, text: fallback };
      return { ok: true, text };
    } catch {
      return { ok: false, text: fallback };
    }
  });
