import { useEffect, useRef } from "react";

function isTyping(target) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

// bindings: an object keyed by e.key, for example { j: next, " ": flip }.
export function useKeys(bindings, enabled = true) {
  const handlers = useRef(bindings);
  handlers.current = bindings;

  useEffect(() => {
    if (!enabled) return undefined;

    function onKeyDown(e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (isTyping(e.target)) return;
      if (!Object.hasOwn(handlers.current, e.key)) return;
      e.preventDefault();
      handlers.current[e.key]();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
