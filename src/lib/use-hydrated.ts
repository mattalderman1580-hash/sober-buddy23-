import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";

export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const finish = () => setHydrated(true);
    if (useAppStore.persist.hasHydrated()) {
      finish();
    }
    return useAppStore.persist.onFinishHydration(finish);
  }, []);

  return hydrated;
}
