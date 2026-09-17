"use client";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

const eventName = "dashboard-preferences";
const FAVORITES_KEY = "dashboard:favorites";

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
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    memory.delete(key);
  } catch {
    memory.set(key, value);
  }
  window.dispatchEvent(new Event(eventName));
}
export function usePreference(key: string, fallback: string) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const setValue = useCallback((next: string) => write(key, next), [key]);
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
function parseFavoriteList(value: unknown): string[] | null {
  return Array.isArray(value)
    ? value.filter((id): id is string => typeof id === "string")
    : null;
}
async function saveFavorites(favorites: string[]) {
  try {
    await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorites }),
    });
  } catch {
    // Sem ligação: o localStorage mantém o valor neste navegador.
  }
}
export function useFavorites() {
  const [stored, setStored] = usePreference(FAVORITES_KEY, "[]");
  const dirty = useRef(false);
  useEffect(() => {
    let active = true;
    fetch("/api/preferences", { headers: { Accept: "application/json" } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: unknown) => {
        if (!active || !data || typeof data !== "object") return;
        const value = data as { stored?: unknown; favorites?: unknown };
        const serverFavorites = parseFavoriteList(value.favorites);
        if (value.stored === true && serverFavorites && !dirty.current) {
          setStored(JSON.stringify(serverFavorites));
          return;
        }
        // Primeira sincronização: guarda na conta os favoritos já existentes.
        const local = parseFavorites(read(FAVORITES_KEY, "[]"));
        if (value.stored === false && local.length) void saveFavorites(local);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [setStored]);
  const update = useCallback(
    (next: string[]) => {
      dirty.current = true;
      setStored(JSON.stringify(next));
      void saveFavorites(next);
    },
    [setStored],
  );
  return [parseFavorites(stored), update] as const;
}
