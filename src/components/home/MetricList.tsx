import { ChevronRight, Inbox, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { METRIC_META, metricItems, type MetricKey } from "../../lib/metrics";
import { dueLabel, isOverdue } from "../../lib/format";
import { scoreOf } from "../../lib/select";
import {
  Avatar,
  DomainBadge,
  FrameworkBadge,
  SeverityBadge,
  SeverityDot,
  StatusBadge,
} from "../common/atoms";

const TONE_TEXT: Record<string, string> = {
  danger: "text-red-600",
  warning: "text-amber-600",
  success: "text-emerald-600",
  default: "text-stone-900",
};

export function MetricList({ metricKey }: { metricKey: MetricKey }) {
  const items = useAppStore((s) => s.items);
  const role = useAppStore((s) => s.role);
  const openTicket = useAppStore((s) => s.openTicket);
  const closeModal = useAppStore((s) => s.closeModal);

  const meta = METRIC_META[metricKey];
  const list = metricItems(metricKey, items, role).sort(
    (a, b) => scoreOf(b) - scoreOf(a)
  );

  return (
    <>
      <div className="flex items-start justify-between border-b border-stone-100 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-semibold text-stone-900">
              {meta.label}
            </h2>
            <span
              className={`text-[16px] font-semibold ${TONE_TEXT[meta.tone]}`}
            >
              {list.length}
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-stone-500">{meta.description}</p>
        </div>
        <button
          onClick={closeModal}
          aria-label="Close"
          className="text-stone-400 hover:text-stone-600"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <Inbox size={26} className="mb-2 text-stone-300" />
            <p className="text-sm font-medium text-stone-700">Nothing here</p>
            <p className="mt-1 text-[13px] text-stone-500">
              No items in this category right now.
            </p>
          </div>
        ) : (
          list.map((item) => {
            const overdue =
              isOverdue(item.due_date) && item.status !== "RESOLVED";
            return (
              <button
                key={item.actionable_item_id}
                onClick={() => openTicket(item.actionable_item_id, metricKey)}
                className="group flex w-full items-center gap-3 border-b border-stone-100 px-5 py-3 text-left last:border-b-0 hover:bg-stone-50"
              >
                <SeverityDot severity={item.severity} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-stone-900">
                    {item.title}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <SeverityBadge severity={item.severity} />
                    <DomainBadge domain={item.domain_source} />
                    <FrameworkBadge framework={item.framework} />
                    {item.status !== "OPEN" && (
                      <StatusBadge status={item.status} />
                    )}
                  </div>
                </div>
                <span
                  className={`shrink-0 text-[11px] font-medium ${
                    overdue ? "text-red-600" : "text-stone-500"
                  }`}
                >
                  {dueLabel(item.due_date)}
                </span>
                <Avatar assignee={item.assignee} />
                <ChevronRight
                  size={15}
                  className="shrink-0 text-stone-300 group-hover:text-stone-500"
                />
              </button>
            );
          })
        )}
      </div>
    </>
  );
}
