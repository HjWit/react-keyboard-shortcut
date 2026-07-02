import { useEffect, useRef } from "react";

type ShortcutMap = Record<string, () => void>;

export function useKeyboardShortcut(
  ref: React.RefObject<HTMLElement | null>,
  shortcuts: ShortcutMap,
  enabled: boolean = true,
) {
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (el) el.focus();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const element = ref.current;
    if (!element) return;

    const isMac = navigator.platform.toLowerCase().includes("mac");

    const normalizeKey = (key: string) => {
      key = key.toLowerCase();
      switch (key) {
        case " ":
          return "space";
        case "arrowleft":
          return "left";
        case "arrowright":
          return "right";
        case "arrowup":
          return "up";
        case "arrowdown":
          return "down";
        default:
          return key;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = normalizeKey(e.key);

      const parts: string[] = [];

      if (isMac ? e.metaKey : e.ctrlKey) parts.push("mod");
      if (e.altKey) parts.push("alt");
      if (e.shiftKey) parts.push("shift");

      parts.sort();
      parts.push(key);

      const combo = parts.join("+");

      const action = shortcutsRef.current[combo];
      if (action) {
        e.preventDefault();
        e.stopPropagation();
        action();
      }
    };

    element.addEventListener("keydown", handleKeyDown);

    return () => {
      element.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);
}
