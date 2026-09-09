import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import type { Assignee } from "../../data/types";
import { PEOPLE, TEAMS } from "../../data/people";

const MENU_W = 224;
const MENU_MAX_H = 300;

interface Pos {
  left: number;
  top: number;
  openUp: boolean;
}

interface Option {
  assignee: Assignee;
  name: string;
  initials: string;
  role?: string;
  team: boolean;
}

// Flat, keyboard-navigable option list: teams first, then people.
const OPTIONS: Option[] = [
  ...TEAMS.map((t) => ({
    assignee: { type: "TEAM" as const, id: t.id },
    name: t.name,
    initials: t.initials,
    team: true,
  })),
  ...PEOPLE.map((p) => ({
    assignee: { type: "USER" as const, id: p.id },
    name: p.name,
    initials: p.initials,
    role: p.role,
    team: false,
  })),
];
const FIRST_PERSON_IDX = TEAMS.length;

// Portal-based reassign menu, positioned against a trigger element so it
// never gets clipped by an overflow ancestor, flips up near the viewport
// bottom, and is fully keyboard-navigable (↑/↓ move, Enter selects, Esc closes).
export function ReassignMenu({
  anchorRef,
  onSelect,
  onClose,
  align = "left",
}: {
  anchorRef: RefObject<HTMLElement>;
  onSelect: (assignee: Assignee) => void;
  onClose: () => void;
  align?: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const a = anchorRef.current;
    if (!a) return;
    const r = a.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < MENU_MAX_H && r.top > spaceBelow;
    setPos({
      left: align === "right" ? r.right : r.left,
      top: openUp ? r.top - 4 : r.bottom + 4,
      openUp,
    });
  }, [anchorRef, align]);

  // Move focus into the menu once it's positioned so it captures keystrokes.
  useEffect(() => {
    if (pos) ref.current?.focus({ preventScroll: true });
  }, [pos]);

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    ref.current
      ?.querySelector(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      if (ref.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [anchorRef, onClose]);

  function pick(a: Assignee) {
    onSelect(a);
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        e.stopPropagation();
        setActive((i) => (i + 1) % OPTIONS.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        e.stopPropagation();
        setActive((i) => (i - 1 + OPTIONS.length) % OPTIONS.length);
        break;
      case "Home":
        e.preventDefault();
        e.stopPropagation();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        e.stopPropagation();
        setActive(OPTIONS.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        e.stopPropagation();
        pick(OPTIONS[active].assignee);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        onClose();
        break;
    }
  }

  if (!pos) return null;

  return createPortal(
    <div
      ref={ref}
      tabIndex={-1}
      role="listbox"
      aria-label="Reassign to"
      onKeyDown={onKeyDown}
      style={{
        position: "fixed",
        left: pos.left,
        top: pos.top,
        width: MENU_W,
        maxHeight: MENU_MAX_H,
        transform: `${align === "right" ? "translateX(-100%)" : ""} ${
          pos.openUp ? "translateY(-100%)" : ""
        }`.trim(),
      }}
      className="z-[100] overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 shadow-xl outline-none thin-scroll"
    >
      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
        Teams
      </div>
      {OPTIONS.map((o, i) => (
        <div key={`${o.assignee.type}-${o.assignee.id}`}>
          {i === FIRST_PERSON_IDX && (
            <div className="px-2 py-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
              People
            </div>
          )}
          <button
            data-idx={i}
            role="option"
            aria-selected={active === i}
            onClick={() => pick(o.assignee)}
            onMouseEnter={() => setActive(i)}
            className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px] text-stone-700 ${
              active === i ? "bg-brand-50" : ""
            }`}
          >
            <span
              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${
                o.team
                  ? "bg-brand-100 text-brand-700"
                  : "bg-stone-200 text-stone-700"
              }`}
            >
              {o.initials}
            </span>
            <span className="truncate">
              {o.name}
              {o.role && <span className="text-stone-400"> · {o.role}</span>}
            </span>
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
