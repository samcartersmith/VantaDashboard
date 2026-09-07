import { create } from "zustand";
import type {
  ActionableItem,
  Assignee,
  Domain,
  Framework,
  Role,
  Severity,
  Status,
} from "../data/types";
import { SEED_ITEMS } from "../data/seed";
import { CURRENT_USER_ID, assigneeLabel } from "../data/people";

export type SortKey = "SMART" | "DUE" | "SEVERITY" | "CREATED";

export interface Filters {
  domains: Set<Domain>;
  severities: Set<Severity>;
  frameworks: Set<Framework>;
  statuses: Set<Status>;
  auditBlockingOnly: boolean;
  search: string;
}

function emptyFilters(): Filters {
  return {
    domains: new Set(),
    severities: new Set(),
    frameworks: new Set(),
    statuses: new Set(),
    auditBlockingOnly: false,
    search: "",
  };
}

function actorName() {
  return "Alex Rivera";
}

function stamp(item: ActionableItem, text: string): ActionableItem {
  return {
    ...item,
    activity: [
      ...item.activity,
      { ts: new Date().toISOString(), actor: actorName(), text },
    ],
  };
}

interface AppState {
  items: ActionableItem[];
  role: Role;
  sort: SortKey;
  filters: Filters;
  selection: Set<string>; // bulk-select ids
  activeItemId: string | null; // detail panel
  currentNav: string;

  setRole: (role: Role) => void;
  setSort: (sort: SortKey) => void;
  setNav: (nav: string) => void;
  openItem: (id: string | null) => void;

  toggleFilterValue: <K extends "domains" | "severities" | "frameworks" | "statuses">(
    key: K,
    value: Filters[K] extends Set<infer T> ? T : never
  ) => void;
  toggleAuditBlocking: () => void;
  setSearch: (q: string) => void;
  clearFilters: () => void;

  toggleSelect: (id: string) => void;
  selectMany: (ids: string[]) => void;
  clearSelection: () => void;

  resolveItem: (id: string) => void;
  startItem: (id: string) => void;
  dismissItem: (id: string) => void;
  snoozeItem: (id: string, note: string, days: number) => void;
  reassign: (id: string, assignee: Assignee) => void;

  bulkResolve: (ids: string[]) => void;
  bulkSnooze: (ids: string[], note: string, days: number) => void;
  bulkReassign: (ids: string[], assignee: Assignee) => void;
}

function updateOne(
  items: ActionableItem[],
  id: string,
  fn: (item: ActionableItem) => ActionableItem
): ActionableItem[] {
  return items.map((it) => (it.actionable_item_id === id ? fn(it) : it));
}

function updateMany(
  items: ActionableItem[],
  ids: Set<string>,
  fn: (item: ActionableItem) => ActionableItem
): ActionableItem[] {
  return items.map((it) => (ids.has(it.actionable_item_id) ? fn(it) : it));
}

function daysToIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const useAppStore = create<AppState>((set) => ({
  items: SEED_ITEMS,
  role: "MY_ACTIONS",
  sort: "SMART",
  filters: emptyFilters(),
  selection: new Set(),
  activeItemId: null,
  currentNav: "home",

  setRole: (role) =>
    set(() => ({ role, selection: new Set(), activeItemId: null })),
  setSort: (sort) => set(() => ({ sort })),
  setNav: (currentNav) => set(() => ({ currentNav })),
  openItem: (id) => set(() => ({ activeItemId: id })),

  toggleFilterValue: (key, value) =>
    set((state) => {
      const next = new Set(state.filters[key] as Set<unknown>);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { filters: { ...state.filters, [key]: next } };
    }),
  toggleAuditBlocking: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        auditBlockingOnly: !state.filters.auditBlockingOnly,
      },
    })),
  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search } })),
  clearFilters: () => set(() => ({ filters: emptyFilters() })),

  toggleSelect: (id) =>
    set((state) => {
      const next = new Set(state.selection);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selection: next };
    }),
  selectMany: (ids) => set(() => ({ selection: new Set(ids) })),
  clearSelection: () => set(() => ({ selection: new Set() })),

  resolveItem: (id) =>
    set((state) => ({
      items: updateOne(state.items, id, (it) =>
        stamp(
          { ...it, status: "RESOLVED", snooze: undefined },
          "Marked resolved. Remediation verified."
        )
      ),
    })),
  startItem: (id) =>
    set((state) => ({
      items: updateOne(state.items, id, (it) =>
        stamp({ ...it, status: "IN_PROGRESS" }, "Moved to in progress.")
      ),
    })),
  dismissItem: (id) =>
    set((state) => ({
      items: updateOne(state.items, id, (it) =>
        stamp({ ...it, status: "DISMISSED" }, "Dismissed.")
      ),
    })),
  snoozeItem: (id, note, days) =>
    set((state) => ({
      items: updateOne(state.items, id, (it) =>
        stamp(
          {
            ...it,
            status: "SNOOZED",
            snooze: { until: daysToIso(days), note },
          },
          `Snoozed for ${days}d — "${note}"`
        )
      ),
    })),
  reassign: (id, assignee) =>
    set((state) => ({
      items: updateOne(state.items, id, (it) =>
        stamp(
          { ...it, assignee },
          `Reassigned to ${assigneeLabel(assignee)}.`
        )
      ),
    })),

  bulkResolve: (ids) =>
    set((state) => ({
      items: updateMany(state.items, new Set(ids), (it) =>
        stamp(
          { ...it, status: "RESOLVED", snooze: undefined },
          "Bulk resolved."
        )
      ),
      selection: new Set(),
    })),
  bulkSnooze: (ids, note, days) =>
    set((state) => ({
      items: updateMany(state.items, new Set(ids), (it) =>
        stamp(
          { ...it, status: "SNOOZED", snooze: { until: daysToIso(days), note } },
          `Bulk snoozed for ${days}d — "${note}"`
        )
      ),
      selection: new Set(),
    })),
  bulkReassign: (ids, assignee) =>
    set((state) => ({
      items: updateMany(state.items, new Set(ids), (it) =>
        stamp({ ...it, assignee }, `Bulk reassigned to ${assigneeLabel(assignee)}.`)
      ),
      selection: new Set(),
    })),
}));

export { CURRENT_USER_ID };
