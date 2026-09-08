import { useEffect, type ReactNode } from "react";

// Centered modal container: backdrop + card. Closes on backdrop click or Esc.
export function ModalShell({
  onClose,
  children,
  width = 640,
}: {
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-[6vh]"
      onMouseDown={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        style={{ maxWidth: width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
