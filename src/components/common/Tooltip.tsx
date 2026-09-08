import { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface Pos {
  left: number;
  top: number;
  placement: "top" | "bottom";
}

// Portal-based tooltip: renders to <body> with fixed positioning so it
// floats above any overflow-clipped ancestor (modals, scroll areas).
export function Tooltip({
  label,
  children,
  side = "top",
}: {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<Pos | null>(null);

  function show() {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Flip to bottom if there isn't room above.
    const placement: "top" | "bottom" =
      side === "top" && r.top > 44 ? "top" : side === "top" ? "bottom" : "bottom";
    setPos({
      left: r.left + r.width / 2,
      top: placement === "top" ? r.top - 8 : r.bottom + 8,
      placement,
    });
  }
  function hide() {
    setPos(null);
  }

  return (
    <span
      ref={ref}
      className="inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {pos &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              transform:
                pos.placement === "top"
                  ? "translate(-50%, -100%)"
                  : "translate(-50%, 0)",
            }}
            className="pointer-events-none z-[100] whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-[11px] font-medium text-white shadow-md"
          >
            {label}
          </div>,
          document.body
        )}
    </span>
  );
}
