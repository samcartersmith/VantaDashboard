import { useState } from "react";
import { Check, Clock, Play, UserPlus2 } from "lucide-react";
import type { ActionableItem } from "../../data/types";
import { useAppStore } from "../../store/useAppStore";
import { dueLabel, isOverdue } from "../../lib/format";
import { assigneeLabel } from "../../data/people";
import { scoreOf } from "../../lib/select";
import { urgencyBand } from "../../lib/urgency";
import {
  Avatar,
  AuditBlockingTag,
  DomainBadge,
  FrameworkBadge,
  SeverityBadge,
  SeverityDot,
  StatusBadge,
} from "../common/atoms";
import { SnoozeDialog } from "./SnoozeDialog";
import { ReassignMenu } from "./ReassignMenu";

function IconBtn({
  title,
  onClick,
  children,
  tone = "default",
}: {
  title: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  tone?: "default" | "success";
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-500 transition-colors hover:bg-stone-50 ${
        tone === "success" ? "hover:border-emerald-200 hover:text-emerald-600" : ""
      }`}
    >
      {children}
    </button>
  );
}

export function ActionRow({
  item,
  selectable,
}: {
  item: ActionableItem;
  selectable: boolean;
}) {
  const openItem = useAppStore((s) => s.openItem);
  const activeItemId = useAppStore((s) => s.activeItemId);
  const selection = useAppStore((s) => s.selection);
  const toggleSelect = useAppStore((s) => s.toggleSelect);
  const resolveItem = useAppStore((s) => s.resolveItem);
  const startItem = useAppStore((s) => s.startItem);
  const snoozeItem = useAppStore((s) => s.snoozeItem);
  const reassign = useAppStore((s) => s.reassign);

  const [showSnooze, setShowSnooze] = useState(false);
  const [showReassign, setShowReassign] = useState(false);

  const selected = selection.has(item.actionable_item_id);
  const isOpen = activeItemId === item.actionable_item_id;
  const overdue = isOverdue(item.due_date) && item.status !== "RESOLVED";
  const score = scoreOf(item);
  const band = urgencyBand(score);
  const resolved = item.status === "RESOLVED" || item.status === "DISMISSED";

  const bandDot =
    band === "high"
      ? "text-red-600"
      : band === "medium"
      ? "text-amber-600"
      : "text-stone-400";

  return (
    <div
      onClick={() => openItem(item.actionable_item_id)}
      className={`group relative flex cursor-pointer items-center gap-3 border-b border-stone-100 px-3 py-2.5 last:border-b-0 ${
        isOpen ? "bg-brand-50" : "hover:bg-stone-50"
      } ${resolved ? "opacity-60" : ""}`}
    >
      {selectable && (
        <input
          type="checkbox"
          checked={selected}
          onClick={(e) => e.stopPropagation()}
          onChange={() => toggleSelect(item.actionable_item_id)}
          className="h-3.5 w-3.5 shrink-0 accent-brand"
        />
      )}

      <SeverityDot severity={item.severity} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium text-stone-900">
            {item.title}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <SeverityBadge severity={item.severity} />
          <DomainBadge domain={item.domain_source} />
          <FrameworkBadge framework={item.framework} />
          {item.status !== "OPEN" && <StatusBadge status={item.status} />}
          {item.audit_blocking && !resolved && <AuditBlockingTag />}
        </div>
      </div>

      {/* Hover actions (hidden when resolved) */}
      {!resolved && (
        <div className="absolute right-28 hidden items-center gap-1 group-hover:flex">
          {item.status !== "IN_PROGRESS" && (
            <IconBtn
              title="Start"
              onClick={(e) => {
                e.stopPropagation();
                startItem(item.actionable_item_id);
              }}
            >
              <Play size={13} />
            </IconBtn>
          )}
          <div className="relative">
            <IconBtn
              title="Reassign"
              onClick={(e) => {
                e.stopPropagation();
                setShowReassign((s) => !s);
              }}
            >
              <UserPlus2 size={13} />
            </IconBtn>
            {showReassign && (
              <ReassignMenu
                align="right"
                onSelect={(a) => reassign(item.actionable_item_id, a)}
                onClose={() => setShowReassign(false)}
              />
            )}
          </div>
          <IconBtn
            title="Snooze"
            onClick={(e) => {
              e.stopPropagation();
              setShowSnooze(true);
            }}
          >
            <Clock size={13} />
          </IconBtn>
          <IconBtn
            title="Resolve"
            tone="success"
            onClick={(e) => {
              e.stopPropagation();
              resolveItem(item.actionable_item_id);
            }}
          >
            <Check size={14} />
          </IconBtn>
        </div>
      )}

      {/* Right meta */}
      <div className="flex w-24 shrink-0 flex-col items-end">
        <span
          className={`text-[11px] font-medium ${
            overdue ? "text-red-600" : "text-stone-500"
          }`}
        >
          {dueLabel(item.due_date)}
        </span>
        <span
          className="mt-1 flex items-center gap-1 text-[10px] text-stone-400"
          title={assigneeLabel(item.assignee)}
        >
          <span className={bandDot}>●</span>
          {score}
        </span>
      </div>

      <Avatar assignee={item.assignee} />

      {showSnooze && (
        <div onClick={(e) => e.stopPropagation()}>
          <SnoozeDialog
            onConfirm={(note, days) => {
              snoozeItem(item.actionable_item_id, note, days);
              setShowSnooze(false);
            }}
            onClose={() => setShowSnooze(false)}
          />
        </div>
      )}
    </div>
  );
}
