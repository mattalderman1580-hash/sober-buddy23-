import { E as Apple, _ as EyeOff, a as Smartphone, b as Cigarette, c as Pill, g as Flame, m as HeartHandshake, v as Coins, w as Brain, x as Church } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/struggles-DNDZfwIG.js
var ALL_STRUGGLES = [
	{
		id: "substances",
		label: "Drugs & Alcohol",
		blurb: "Recovery and staying clean",
		Icon: Pill
	},
	{
		id: "gambling",
		label: "Gambling",
		blurb: "Breaking the cycle",
		Icon: Coins
	},
	{
		id: "purity",
		label: "Porn / Compulsive Sexual Behavior",
		blurb: "Freedom and self-control",
		Icon: EyeOff
	},
	{
		id: "food",
		label: "Binge / Unhealthy Eating",
		blurb: "Healthier habits",
		Icon: Apple
	},
	{
		id: "mental",
		label: "Mental & Emotional Struggles",
		blurb: "Peace and support",
		Icon: Brain
	},
	{
		id: "faith",
		label: "Growing Closer to God",
		blurb: "Prayer, Scripture, and faith",
		Icon: Church
	},
	{
		id: "nicotine",
		label: "Nicotine",
		blurb: "Breaking nicotine habits",
		Icon: Cigarette
	},
	{
		id: "phone",
		label: "Phone / Social Media",
		blurb: "More control, less scrolling",
		Icon: Smartphone
	},
	{
		id: "anger",
		label: "Anger & Impulse Control",
		blurb: "Respond instead of react",
		Icon: Flame
	},
	{
		id: "other",
		label: "Another Habit",
		blurb: "A habit I want to break",
		Icon: HeartHandshake
	}
];
function labelsFor(ids) {
	return ids.map((id) => ALL_STRUGGLES.find((s) => s.id === id)?.label ?? id);
}
//#endregion
export { labelsFor as n, ALL_STRUGGLES as t };
