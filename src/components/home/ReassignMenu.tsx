import { useEffect, useRef } from "react";
import type { Assignee } from "../../data/types";
import { PEOPLE, TEAMS } from "../../data/people";

export function ReassignMenu({
  onSelect,
  onClose,
  align = "left",
}: {
  onSelect: (assignee: Assignee) => void;
  onClose: () => void;
  align?: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  function pick(a: Assignee) {
    onSelect(a);
    onClose();
  }

  return (
    <div
      ref={ref}
      className={`absolute z-30 mt-1 max-h-72 w-56 overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 shadow-lg thin-scroll ${
        align === "right" ? "right-0" : "left-0"
      }`}
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
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[9px] font-semibold text-brand-700">
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
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-stone-200 text-[9px] font-semibold text-stone-700">
            {p.initials}
          </span>
          <span className="truncate">
            {p.name} <span className="text-stone-400">· {p.role}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
