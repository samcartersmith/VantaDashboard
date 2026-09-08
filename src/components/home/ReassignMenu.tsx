import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
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

// Portal-based reassign menu, positioned against a trigger element so it
// never gets clipped by an overflow ancestor, and flips up when near the
// bottom of the viewport.
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

  if (!pos) return null;

  return createPortal(
    <div
      ref={ref}
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
      className="z-[100] overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 shadow-xl thin-scroll"
    >
      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
        Teams
      </div>
      {TEAMS.map((t) => (
        <button
          key={t.id}
          onClick={() => pick({ type: "TEAM", id: t.id })}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px] text-stone-700 hover:bg-stone-50"
        >
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[9px] font-semibold text-brand-700">
            {t.initials}
          </span>
          {t.name}
        </button>
      ))}
      <div className="px-2 py-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
        People
      </div>
      {PEOPLE.map((p) => (
        <button
          key={p.id}
          onClick={() => pick({ type: "USER", id: p.id })}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px] text-stone-700 hover:bg-stone-50"
        >
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[9px] font-semibold text-stone-700">
            {p.initials}
          </span>
          <span className="truncate">
            {p.name} <span className="text-stone-400">· {p.role}</span>
          </span>
        </button>
      ))}
    </div>,
    document.body
  );
}
