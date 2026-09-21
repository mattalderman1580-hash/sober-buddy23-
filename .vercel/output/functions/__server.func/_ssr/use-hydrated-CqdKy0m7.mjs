import { i as __toESM } from "../_runtime.mjs";
import { s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as useAppStore } from "./store-j1xjXGlW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-hydrated-CqdKy0m7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useHasHydrated() {
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const finish = () => setHydrated(true);
		if (useAppStore.persist.hasHydrated()) finish();
		return useAppStore.persist.onFinishHydration(finish);
	}, []);
	return hydrated;
}
//#endregion
export { useHasHydrated as t };
