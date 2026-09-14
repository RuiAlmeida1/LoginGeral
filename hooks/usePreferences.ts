"use client";
import { useSyncExternalStore } from "react";

const eventName = "dashboard-preferences";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(eventName, callback);
  };
}
const memory = new Map<string, string>();
function read(key: string, fallback: string) {
  try {
    return memory.get(key) ?? localStorage.getItem(key) ?? fallback;
  } catch {
    return memory.get(key) ?? fallback;
  }
}
export function usePreference(key: string, fallback: string) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  function setValue(next: string) {
    try {
      localStorage.setItem(key, next);
      memory.delete(key);
    } catch {
      memory.set(key, next);
    }
    window.dispatchEvent(new Event(eventName));
  }
  return [value, setValue] as const;
}
export function parseFavorites(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}
