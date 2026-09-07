import type { ActionableItem, Role } from "../data/types";
import { CURRENT_USER_ID } from "../data/people";
import { AUDIT_DATE } from "../data/seed";
import { computeUrgency } from "./urgency";
import { SEVERITY_ORDER } from "./format";
import type { Filters, SortKey } from "../store/useAppStore";

const ACTIVE_STATUSES = new Set(["OPEN", "IN_PROGRESS", "SNOOZED"]);

export function scoreOf(item: ActionableItem): number {
  return computeUrgency(item, AUDIT_DATE);
}

// Role scoping: My actions = items assigned to the current user (active only).
export function roleScoped(items: ActionableItem[], role: Role): ActionableItem[] {
  if (role === "MY_ACTIONS") {
    return items.filter(
      (it) =>
        it.assignee.type === "USER" &&
        it.assignee.id === CURRENT_USER_ID &&
        ACTIVE_STATUSES.has(it.status)
    );
  }
  return items; // Program queue + Leadership see everything.
}

export function applyFilters(
  items: ActionableItem[],
  f: Filters
): ActionableItem[] {
  const q = f.search.trim().toLowerCase();
  return items.filter((it) => {
    if (f.domains.size && !f.domains.has(it.domain_source)) return false;
    if (f.severities.size && !f.severities.has(it.severity)) return false;
    if (f.frameworks.size && !f.frameworks.has(it.framework)) return false;
    if (f.statuses.size && !f.statuses.has(it.status)) return false;
    if (f.auditBlockingOnly && !it.audit_blocking) return false;
    if (q && !`${it.title} ${it.description}`.toLowerCase().includes(q))
      return false;
    return true;
  });
}

export function sortItems(
  items: ActionableItem[],
  sort: SortKey
): ActionableItem[] {
  const copy = [...items];
  switch (sort) {
    case "SMART":
      copy.sort((a, b) => scoreOf(b) - scoreOf(a));
      break;
    case "DUE":
      copy.sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );
      break;
    case "SEVERITY":
      copy.sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
      );
      break;
    case "CREATED":
      copy.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      break;
  }
  return copy;
}

export function isActive(item: ActionableItem): boolean {
  return ACTIVE_STATUSES.has(item.status);
}
