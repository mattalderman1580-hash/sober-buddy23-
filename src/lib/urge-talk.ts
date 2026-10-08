import { useSyncExternalStore } from "react";
import { speak, stopSpeak } from "@/lib/speak";

export const URGE_HELLO =
  "I'm here with you. Stay right here. You do not have to do this. What happened just before this?";

let open = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function openUrgeTalk() {
  open = true;
  speak(URGE_HELLO);
  emit();
}

export function closeUrgeTalk() {
  open = false;
  stopSpeak();
  emit();
}

export function useUrgeTalkOpen() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => open,
    () => false,
  );
}
