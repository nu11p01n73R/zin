import { useEffect, useState } from "react";

// status: "loading" | "empty" | "error" | "ready"
export function useCards(url = "sentences.json") {
  const [state, setState] = useState({ status: "loading", data: null });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch(url, { cache: "no-store", signal: controller.signal });
        if (res.status === 404) return { status: "empty", data: null };
        if (!res.ok) return { status: "error", data: null };

        const text = await res.text();
        if (!text.trim()) return { status: "empty", data: null };

        const data = JSON.parse(text);
        if (!Array.isArray(data?.cards) || data.cards.length === 0) {
          return { status: "empty", data: null };
        }
        return { status: "ready", data };
      } catch (err) {
        if (err.name === "AbortError") return null;
        return { status: "error", data: null };
      }
    }

    load().then((next) => {
      if (next && !controller.signal.aborted) setState(next);
    });

    return () => controller.abort();
  }, [url]);

  return state;
}
