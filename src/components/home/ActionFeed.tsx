import { useRef, useState } from "react";
import { CheckCircle2, Clock, Inbox, UserPlus2, X } from "lucide-react";
import type { ActionableItem } from "../../data/types";
import { useAppStore } from "../../store/useAppStore";
import { ActionRow } from "./ActionRow";
import { SnoozeDialog } from "./SnoozeDialog";
import { ReassignMenu } from "./ReassignMenu";

function BulkBar({ ids }: { ids: string[] }) {
  const clearSelection = useAppStore((s) => s.clearSelection);
  const bulkResolve = useAppStore((s) => s.bulkResolve);
  const bulkSnooze = useAppStore((s) => s.bulkSnooze);
  const bulkReassign = useAppStore((s) => s.bulkReassign);
  const [showSnooze, setShowSnooze] = useState(false);
  const [showReassign, setShowReassign] = useState(false);
  const reassignAnchor = useRef<HTMLDivElement>(null);

  return (
    <div className="flex items-center gap-2 border-b border-brand-100 bg-brand-50 px-3 py-2">
      <span className="text-[12px] font-medium text-brand-700">
        {ids.length} selected
      </span>
      <div className="ml-2 flex items-center gap-1.5">
        <button
          onClick={() => bulkResolve(ids)}
          className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-[12px] text-stone-700 hover:bg-stone-50"
        >
          <CheckCircle2 size={13} className="text-emerald-600" /> Resolve
        </button>
        <button
          onClick={() => setShowSnooze(true)}
          className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-[12px] text-stone-700 hover:bg-stone-50"
        >
          <Clock size={13} className="text-amber-500" /> Snooze
        </button>
        <div className="relative" ref={reassignAnchor}>
          <button
            onClick={() => setShowReassign((s) => !s)}
            className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-[12px] text-stone-700 hover:bg-stone-50"
          >
            <UserPlus2 size={13} /> Reassign
          </button>
          {showReassign && (
            <ReassignMenu
              anchorRef={reassignAnchor}
              onSelect={(a) => bulkReassign(ids, a)}
              onClose={() => setShowReassign(false)}
            />
          )}
        </div>
      </div>
      <button
        onClick={clearSelection}
        className="ml-auto inline-flex items-center gap-1 text-[12px] text-stone-500 hover:text-stone-700"
      >
        <X size={13} /> Clear
      </button>

      {showSnooze && (
        <SnoozeDialog
          count={ids.length}
          onConfirm={(note, days) => {
            bulkSnooze(ids, note, days);
            setShowSnooze(false);
          }}
          onClose={() => setShowSnooze(false)}
        />
      )}
    </div>
  );
}

export function ActionFeed({
  items,
  selectable,
}: {
  items: ActionableItem[];
  selectable: boolean;
}) {
  const selection = useAppStore((s) => s.selection);
  const selectedIds = items
    .filter((i) => selection.has(i.actionable_item_id))
    .map((i) => i.actionable_item_id);

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      {selectable && selectedIds.length > 0 && <BulkBar ids={selectedIds} />}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <Inbox size={26} className="mb-2 text-stone-300" />
          <p className="text-sm font-medium text-stone-700">You're all clear</p>
          <p className="mt-1 text-[13px] text-stone-500">
            No actionable items match this view. New items appear here as checks
            fail.
          </p>
        </div>
      ) : (
        items.map((item) => (
          <ActionRow
            key={item.actionable_item_id}
            item={item}
            selectable={selectable}
          />
        ))
      )}
    </div>
  );
}
