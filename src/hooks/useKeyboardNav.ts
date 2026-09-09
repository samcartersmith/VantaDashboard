import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import type { ActionableItem } from "../data/types";

// Registers global hotkeys for rapid feed triage. Only active while the
// feed is shown; ignores keys while a modal, menu, or text field is focused.
export function useKeyboardNav(visible: ActionableItem[], enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    function onKey(e: KeyboardEvent) {
      const s = useAppStore.getState();

      // Don't hijack typing or when an overlay owns the keyboard.
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable ||
          // A popup menu (e.g. Reassign) owns the keyboard while open.
          el.closest?.('[role="listbox"],[role="menu"]'))
      )
        return;
      if (s.modal || s.snoozeTargetId || s.reassignTargetId) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const ids = visible.map((i) => i.actionable_item_id);
      if (ids.length === 0) return;
      const idx = s.focusedId ? ids.indexOf(s.focusedId) : -1;

      const focus = (i: number) => {
        const id = ids[Math.max(0, Math.min(ids.length - 1, i))];
        s.setFocused(id);
        const node = document.querySelector(`[data-item-id="${id}"]`);
        node?.scrollIntoView({ block: "nearest" });
      };

      switch (e.key) {
        case "j":
        case "J":
        case "ArrowDown":
          e.preventDefault();
          focus(idx < 0 ? 0 : idx + 1);
          break;
        case "k":
        case "K":
        case "ArrowUp":
          e.preventDefault();
          focus(idx < 0 ? 0 : idx - 1);
          break;
        case "Enter":
        case "o":
        case "O":
          if (s.focusedId) {
            e.preventDefault();
            s.openTicket(s.focusedId);
          }
          break;
        case "e":
        case "E":
          if (s.focusedId) {
            e.preventDefault();
            s.resolveItem(s.focusedId);
          }
          break;
        case "s":
        case "S":
          if (s.focusedId) {
            e.preventDefault();
            s.setSnoozeTarget(s.focusedId);
          }
          break;
        case "a":
        case "A":
          if (s.focusedId) {
            e.preventDefault();
            s.setReassignTarget(s.focusedId);
          }
          break;
        case "x":
        case "X":
          if (s.focusedId) {
            e.preventDefault();
            s.toggleSelect(s.focusedId);
          }
          break;
        case "Escape":
          if (s.focusedId) s.setFocused(null);
          break;
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, enabled]);
}
