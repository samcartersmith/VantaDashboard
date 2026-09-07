import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clock,
  Play,
  Slack,
  Trash2,
  UserPlus2,
  X,
  Zap,
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { assigneeLabel } from "../../data/people";
import { dueLabel, isOverdue, relativeTime, shortDate } from "../../lib/format";
import { scoreOf } from "../../lib/select";
import { urgencyBand } from "../../lib/urgency";
import {
  AuditBlockingTag,
  Avatar,
  DomainBadge,
  FrameworkBadge,
  SeverityBadge,
  StatusBadge,
} from "../common/atoms";
import { SnoozeDialog } from "./SnoozeDialog";
import { ReassignMenu } from "./ReassignMenu";

const REM_ICON = {
  IN_LINE_ACTION: Zap,
  EXTERNAL_LINK: ArrowUpRight,
  SLACK_APPROVAL: Slack,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-stone-400">
        {label}
      </div>
      <div className="mt-0.5 text-[13px] text-stone-700">{children}</div>
    </div>
  );
}

export function DetailPanel() {
  const activeItemId = useAppStore((s) => s.activeItemId);
  const item = useAppStore((s) =>
    s.items.find((i) => i.actionable_item_id === s.activeItemId)
  );
  const openItem = useAppStore((s) => s.openItem);
  const resolveItem = useAppStore((s) => s.resolveItem);
  const startItem = useAppStore((s) => s.startItem);
  const dismissItem = useAppStore((s) => s.dismissItem);
  const snoozeItem = useAppStore((s) => s.snoozeItem);
  const reassign = useAppStore((s) => s.reassign);

  const [showSnooze, setShowSnooze] = useState(false);
  const [showReassign, setShowReassign] = useState(false);

  if (!activeItemId || !item) return null;

  const id = item.actionable_item_id;
  const score = scoreOf(item);
  const band = urgencyBand(score);
  const overdue = isOverdue(item.due_date) && item.status !== "RESOLVED";
  const resolved = item.status === "RESOLVED" || item.status === "DISMISSED";
  const RemIcon = REM_ICON[item.remediation_payload.type];
  const bandColor =
    band === "high"
      ? "text-red-600"
      : band === "medium"
      ? "text-amber-600"
      : "text-stone-500";

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/10"
        onClick={() => openItem(null)}
      />
      <aside className="fixed right-0 top-0 z-40 flex h-full w-[420px] flex-col border-l border-stone-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-100 px-5 py-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <SeverityBadge severity={item.severity} />
            <DomainBadge domain={item.domain_source} />
            <FrameworkBadge framework={item.framework} />
            <StatusBadge status={item.status} />
          </div>
          <button
            onClick={() => openItem(null)}
            className="text-stone-400 hover:text-stone-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 thin-scroll">
          <h2 className="text-[15px] font-semibold leading-snug text-stone-900">
            {item.title}
          </h2>
          {item.audit_blocking && !resolved && (
            <div className="mt-1.5">
              <AuditBlockingTag />
            </div>
          )}
          <p className="mt-3 text-[13px] leading-relaxed text-stone-600">
            {item.description}
          </p>

          {/* Remediation CTA */}
          {!resolved && (
            <button
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2.5 text-[13px] font-medium text-white hover:bg-brand-600"
              onClick={() => resolveItem(id)}
              title="Demo: runs remediation and marks the item resolved"
            >
              <RemIcon size={15} />
              {item.remediation_payload.label}
            </button>
          )}

          {/* Meta grid */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            <Field label="Due">
              <span className={overdue ? "font-medium text-red-600" : ""}>
                {dueLabel(item.due_date)} · {shortDate(item.due_date)}
              </span>
            </Field>
            <Field label="Audit urgency">
              <span className={`font-semibold ${bandColor}`}>{score}</span>
              <span className="text-stone-400"> / 100</span>
            </Field>
            <Field label="Assignee">
              <span className="inline-flex items-center gap-1.5">
                <Avatar assignee={item.assignee} size={18} />
                {assigneeLabel(item.assignee)}
              </span>
            </Field>
            <Field label="Source">
              <span className="font-mono text-[12px] text-stone-500">
                {item.source_entity_id}
              </span>
            </Field>
          </div>

          {item.snooze && (
            <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
              <span className="font-medium">Snoozed until {shortDate(item.snooze.until)}</span>
              <div className="mt-0.5 text-amber-700">“{item.snooze.note}”</div>
            </div>
          )}

          {/* Audit trail */}
          <div className="mt-6">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
              Activity · audit trail
            </div>
            <ol className="relative space-y-3 border-l border-stone-200 pl-4">
              {[...item.activity].reverse().map((a, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-stone-300" />
                  <div className="text-[12px] text-stone-700">{a.text}</div>
                  <div className="mt-0.5 text-[11px] text-stone-400">
                    {a.actor} · {relativeTime(a.ts)}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer actions */}
        {!resolved && (
          <div className="flex items-center gap-1.5 border-t border-stone-100 px-5 py-3">
            {item.status !== "IN_PROGRESS" && (
              <button
                onClick={() => startItem(id)}
                className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 px-2.5 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50"
              >
                <Play size={13} /> Start
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setShowReassign((s) => !s)}
                className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 px-2.5 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50"
              >
                <UserPlus2 size={13} /> Reassign
              </button>
              {showReassign && (
                <div className="absolute bottom-full mb-1">
                  <ReassignMenu
                    onSelect={(a) => reassign(id, a)}
                    onClose={() => setShowReassign(false)}
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => setShowSnooze(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 px-2.5 py-1.5 text-[12px] text-stone-700 hover:bg-stone-50"
            >
              <Clock size={13} /> Snooze
            </button>
            <button
              onClick={() => dismissItem(id)}
              title="Dismiss"
              className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-stone-200 px-2 py-1.5 text-[12px] text-stone-500 hover:bg-stone-50"
            >
              <Trash2 size={13} />
            </button>
            <button
              onClick={() => resolveItem(id)}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-700"
            >
              <Check size={14} /> Resolve
            </button>
          </div>
        )}

        {showSnooze && (
          <SnoozeDialog
            onConfirm={(note, days) => {
              snoozeItem(id, note, days);
              setShowSnooze(false);
            }}
            onClose={() => setShowSnooze(false)}
          />
        )}
      </aside>
    </>
  );
}
