import type { ActionableItem, Role } from "../data/types";
import { isActive, roleScoped } from "./select";
import { isOverdue } from "./format";

export type MetricKey = "auditBlocking" | "overdue" | "open" | "resolved";

export interface MetricMeta {
  label: string;
  tone: "danger" | "warning" | "default" | "success";
  description: string;
}

export const METRIC_META: Record<MetricKey, MetricMeta> = {
  auditBlocking: {
    label: "Audit-blocking",
    tone: "danger",
    description:
      "Open items that will block the upcoming audit until they're remediated.",
  },
  overdue: {
    label: "Overdue SLA",
    tone: "warning",
    description: "Open items already past their remediation due date.",
  },
  open: {
    label: "Open",
    tone: "default",
    description: "All active items awaiting triage or remediation.",
  },
  resolved: {
    label: "Resolved (7d)",
    tone: "success",
    description: "Items remediated and verified recently.",
  },
};

export const METRIC_ORDER: MetricKey[] = [
  "auditBlocking",
  "overdue",
  "open",
  "resolved",
];

// Items behind each metric card, honoring the current role scope.
export function metricItems(
  key: MetricKey,
  items: ActionableItem[],
  role: Role
): ActionableItem[] {
  if (key === "resolved") {
    return items.filter((i) => i.status === "RESOLVED");
  }
  const active = roleScoped(items, role).filter(isActive);
  switch (key) {
    case "auditBlocking":
      return active.filter((i) => i.audit_blocking);
    case "overdue":
      return active.filter((i) => isOverdue(i.due_date));
    case "open":
      return active;
  }
}
