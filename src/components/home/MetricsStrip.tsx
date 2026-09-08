import type { ActionableItem } from "../../data/types";
import { isOverdue } from "../../lib/format";
import { isActive } from "../../lib/select";

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "danger" | "warning" | "success" | "default";
}) {
  const toneClass =
    tone === "danger"
      ? "text-red-600"
      : tone === "warning"
      ? "text-amber-600"
      : tone === "success"
      ? "text-emerald-600"
      : "text-stone-900";
  return (
    <div className="rounded-lg bg-white px-3.5 py-2.5 ring-1 ring-black/5">
      <div className="text-[11px] text-stone-500">{label}</div>
      <div className={`text-[22px] font-semibold leading-tight ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}

export function MetricsStrip({
  scoped,
  all,
}: {
  scoped: ActionableItem[];
  all: ActionableItem[];
}) {
  const active = scoped.filter(isActive);
  const auditBlocking = active.filter((i) => i.audit_blocking).length;
  const overdue = active.filter((i) => isOverdue(i.due_date)).length;
  const open = active.length;

  const resolved7d = all.filter((i) => i.status === "RESOLVED").length;

  return (
    <div className="grid grid-cols-4 gap-2.5">
      <Metric label="Audit-blocking" value={auditBlocking} tone="danger" />
      <Metric label="Overdue SLA" value={overdue} tone="warning" />
      <Metric label="Open" value={open} />
      <Metric label="Resolved (7d)" value={resolved7d} tone="success" />
    </div>
  );
}
