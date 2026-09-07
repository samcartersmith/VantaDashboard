import type { Assignee, Severity, Status } from "../../data/types";
import {
  DOMAIN_LABEL,
  FRAMEWORK_LABEL,
  SEVERITY_LABEL,
  STATUS_LABEL,
} from "../../lib/format";
import { assigneeInitials, assigneeLabel } from "../../data/people";
import type { Domain, Framework } from "../../data/types";

const SEV_STYLES: Record<Severity, string> = {
  CRITICAL: "bg-red-50 text-red-700 ring-red-600/20",
  HIGH: "bg-orange-50 text-orange-700 ring-orange-600/20",
  MEDIUM: "bg-amber-50 text-amber-800 ring-amber-600/20",
  LOW: "bg-stone-100 text-stone-600 ring-stone-500/20",
};

const SEV_DOT: Record<Severity, string> = {
  CRITICAL: "bg-sev-critical",
  HIGH: "bg-sev-high",
  MEDIUM: "bg-sev-medium",
  LOW: "bg-sev-low",
};

export function SeverityDot({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${SEV_DOT[severity]}`}
      aria-hidden
    />
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${SEV_STYLES[severity]}`}
    >
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
      {children}
    </span>
  );
}

export function DomainBadge({ domain }: { domain: Domain }) {
  return <Chip>{DOMAIN_LABEL[domain]}</Chip>;
}

export function FrameworkBadge({ framework }: { framework: Framework }) {
  return <Chip>{FRAMEWORK_LABEL[framework]}</Chip>;
}

const STATUS_STYLES: Record<Status, string> = {
  OPEN: "bg-stone-100 text-stone-600",
  IN_PROGRESS: "bg-brand-50 text-brand-700",
  SNOOZED: "bg-amber-50 text-amber-800",
  RESOLVED: "bg-emerald-50 text-emerald-700",
  DISMISSED: "bg-stone-100 text-stone-400",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Avatar({
  assignee,
  size = 22,
}: {
  assignee: Assignee;
  size?: number;
}) {
  const initials = assigneeInitials(assignee);
  if (!initials) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full border border-dashed border-stone-300 text-[9px] text-stone-400"
        style={{ width: size, height: size }}
        title="Unassigned"
      >
        —
      </span>
    );
  }
  const isTeam = assignee.type === "TEAM";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full text-[9px] font-semibold ${
        isTeam ? "bg-brand-100 text-brand-700" : "bg-stone-200 text-stone-700"
      }`}
      style={{ width: size, height: size }}
      title={assigneeLabel(assignee)}
    >
      {initials}
    </span>
  );
}

export function AuditBlockingTag() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
      Audit-blocking
    </span>
  );
}
