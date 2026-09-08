import type { Domain, Framework, Severity, Status } from "../data/types";

export function dueLabel(due: string, now: Date = new Date()): string {
  const ms = new Date(due).getTime() - now.getTime();
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due 1d";
  return `Due ${days}d`;
}

export function isOverdue(due: string, now: Date = new Date()): boolean {
  return new Date(due).getTime() < now.getTime();
}

export function relativeTime(ts: string, now: Date = new Date()): string {
  const ms = now.getTime() - new Date(ts).getTime();
  const mins = Math.round(ms / (1000 * 60));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export function shortDate(ts: string): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export const DOMAIN_LABEL: Record<Domain, string> = {
  TESTS: "Tests",
  ACCESS_REVIEWS: "Access reviews",
  VENDOR_RISK: "Vendor risk",
  POLICIES: "Policies",
  PEOPLE: "People",
  QUESTIONNAIRES: "Questionnaires",
  RISK_REGISTER: "Risk register",
};

export const FRAMEWORK_LABEL: Record<Framework, string> = {
  SOC2: "SOC 2",
  PCI_DSS: "PCI DSS",
  GDPR: "GDPR",
  HIPAA: "HIPAA",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const STATUS_LABEL: Record<Status, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  SNOOZED: "Snoozed",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

export const SEVERITY_ORDER: Record<Severity, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};
