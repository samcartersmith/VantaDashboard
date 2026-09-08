import { useState } from "react";
import { Clock, X } from "lucide-react";

const PRESETS = [
  { label: "3 days", days: 3 },
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "30 days", days: 30 },
];

export function SnoozeDialog({
  count = 1,
  onConfirm,
  onClose,
}: {
  count?: number;
  onConfirm: (note: string, days: number) => void;
  onClose: () => void;
}) {
  const [days, setDays] = useState(7);
  const [note, setNote] = useState("");
  const [error, setError] = useState(false);

  function confirm() {
    if (!note.trim()) {
      setError(true);
      return;
    }
    onConfirm(note.trim(), days);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-800">
            <Clock size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold">
              Snooze {count > 1 ? `${count} items` : "item"}
            </h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X size={16} />
          </button>
        </div>

        <label className="mb-1 block text-[12px] font-medium text-stone-600">
          Snooze duration
        </label>
        <div className="mb-4 flex gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`rounded-md border px-2.5 py-1.5 text-[12px] transition-colors ${
                days === p.days
                  ? "border-brand-200 bg-brand-50 text-brand-700"
                  : "border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-[12px] font-medium text-stone-600">
          Audit note <span className="text-red-500">*</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            if (error) setError(false);
          }}
          rows={3}
          placeholder="Required for the audit trail — why is this being deferred?"
          className="w-full resize-none rounded-md border border-stone-200 p-2 text-[13px] text-stone-700 placeholder:text-stone-400 focus:border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {error && (
          <p className="mt-1 text-[12px] text-red-600">
            An audit note is required to snooze.
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-[13px] text-stone-600 hover:bg-stone-100"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            className="rounded-md bg-brand px-3 py-1.5 text-[13px] font-medium text-white hover:bg-brand-600"
          >
            Snooze
          </button>
        </div>
      </div>
    </div>
  );
}
