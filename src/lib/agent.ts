import type { ActionableItem } from "../data/types";
import { isActive } from "./select";

export interface QuickWin {
  item: ActionableItem;
  minutes: number;
}

// A believable "quick wins" set for the time-boxed triage response: active,
// lower-severity or near-due items that read as fast to close.
const estMinutes = (it: ActionableItem) =>
  it.severity === "LOW" ? 5 : it.severity === "MEDIUM" ? 10 : 15;

export function quickWins(items: ActionableItem[]): QuickWin[] {
  const active = items.filter(isActive);
  // Prefer genuine quick wins: lowest estimated effort first, then soonest due.
  const picked = active
    .filter((i) => i.severity !== "CRITICAL")
    .sort(
      (a, b) =>
        estMinutes(a) - estMinutes(b) ||
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )
    .slice(0, 3);
  return picked.map((item) => ({ item, minutes: estMinutes(item) }));
}

export function quickWinsTotal(wins: QuickWin[]): number {
  return wins.reduce((sum, w) => sum + w.minutes, 0);
}

// Two active items in the same domain, presented as near-duplicates.
export function duplicatePair(items: ActionableItem[]): ActionableItem[] {
  const active = items.filter(isActive);
  const byDomain = new Map<string, ActionableItem[]>();
  for (const it of active) {
    const arr = byDomain.get(it.domain_source) ?? [];
    arr.push(it);
    byDomain.set(it.domain_source, arr);
  }
  for (const arr of byDomain.values()) {
    if (arr.length >= 2) return arr.slice(0, 2);
  }
  return active.slice(0, 2);
}

// Active items that carry an AI root-cause summary.
export function rootCauseItems(items: ActionableItem[]): ActionableItem[] {
  return items.filter((i) => isActive(i) && i.ai_root_cause).slice(0, 3);
}
