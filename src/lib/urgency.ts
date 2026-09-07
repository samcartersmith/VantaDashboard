import type { ActionableItem, Severity } from "../data/types";

const SEVERITY_WEIGHT: Record<Severity, number> = {
  CRITICAL: 40,
  HIGH: 28,
  MEDIUM: 14,
  LOW: 6,
};

function daysBetween(a: string | number | Date, b: string | number | Date) {
  const ms = new Date(a).getTime() - new Date(b).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

/**
 * Audit-Urgency Score (0-100): PRD combines audit proximity, security
 * severity, and SLA time-to-expiry into a single sortable weight.
 */
export function computeUrgency(
  item: ActionableItem,
  auditDate: string,
  now: Date = new Date()
): number {
  // Severity component (0-40).
  let score = SEVERITY_WEIGHT[item.severity];

  // Audit-blocking bonus, amplified by proximity to the audit (0-30).
  if (item.audit_blocking) {
    const daysToAudit = Math.max(0, daysBetween(auditDate, now));
    const proximity = Math.max(0, 1 - daysToAudit / 30); // ramps up within 30 days
    score += 12 + proximity * 18;
  }

  // SLA time-to-expiry component (0-30): overdue and near-due items rank higher.
  const daysToDue = daysBetween(item.due_date, now);
  if (daysToDue <= 0) {
    score += 30; // overdue
  } else if (daysToDue < 14) {
    score += (1 - daysToDue / 14) * 24;
  }

  return Math.round(Math.min(100, score));
}

export function urgencyBand(score: number): "high" | "medium" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}
