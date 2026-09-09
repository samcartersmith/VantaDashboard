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
import type { MetricKey } from "../lib/metrics";

export type SortKey = "SMART" | "DUE" | "SEVERITY" | "CREATED";

// The centered modal shows either a ticket's detail or a metric's item list.
export type Modal =
  | { kind: "ticket"; id: string; backKey?: MetricKey }
  | { kind: "metric"; key: MetricKey };

export type Density = "COMFORTABLE" | "COMPACT";

const DENSITY_KEY = "vanta.density";
const DENSITY_TOUCHED_KEY = "vanta.densityTouched";

function roleDensity(role: Role): Density {
  return role === "PROGRAM_QUEUE" ? "COMPACT" : "COMFORTABLE";
}

function readLS(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeLS(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — ignore */
  }
}

const initialDensityTouched = readLS(DENSITY_TOUCHED_KEY) === "1";
const storedDensity = readLS(DENSITY_KEY);
const initialDensity: Density =
  initialDensityTouched &&
  (storedDensity === "COMPACT" || storedDensity === "COMFORTABLE")
    ? (storedDensity as Density)
    : roleDensity("MY_ACTIONS");

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
  modal: Modal | null; // centered detail / list modal
  currentNav: string;
  density: Density;
  densityTouched: boolean; // user manually overrode the role default
  focusedId: string | null; // keyboard-focused row
  snoozeTargetId: string | null; // keyboard-driven snooze dialog
  reassignTargetId: string | null; // keyboard-driven reassign menu

  setRole: (role: Role) => void;
  setSort: (sort: SortKey) => void;
  setNav: (nav: string) => void;
  setDensity: (density: Density) => void;
  setFocused: (id: string | null) => void;
  setSnoozeTarget: (id: string | null) => void;
  setReassignTarget: (id: string | null) => void;
  openTicket: (id: string, backKey?: MetricKey) => void;
  openMetric: (key: MetricKey) => void;
  closeModal: () => void;

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

// Close the modal when the ticket being acted on is the one it's showing.
function closeIfTicket(modal: Modal | null, id: string): Modal | null {
  if (modal?.kind === "ticket" && modal.id === id) return null;
  return modal;
}

export const useAppStore = create<AppState>((set) => ({
  items: SEED_ITEMS,
  role: "MY_ACTIONS",
  sort: "SMART",
  filters: emptyFilters(),
  selection: new Set(),
  modal: null,
  currentNav: "home",
  density: initialDensity,
  densityTouched: initialDensityTouched,
  focusedId: null,
  snoozeTargetId: null,
  reassignTargetId: null,

  setRole: (role) =>
    set((state) => ({
      role,
      selection: new Set(),
      modal: null,
      focusedId: null,
      density: state.densityTouched ? state.density : roleDensity(role),
    })),
  setSort: (sort) => set(() => ({ sort })),
  setNav: (currentNav) => set(() => ({ currentNav })),
  setDensity: (density) => {
    writeLS(DENSITY_KEY, density);
    writeLS(DENSITY_TOUCHED_KEY, "1");
    set(() => ({ density, densityTouched: true }));
  },
  setFocused: (focusedId) => set(() => ({ focusedId })),
  setSnoozeTarget: (snoozeTargetId) => set(() => ({ snoozeTargetId })),
  setReassignTarget: (reassignTargetId) => set(() => ({ reassignTargetId })),
  openTicket: (id, backKey) =>
    set(() => ({ modal: { kind: "ticket", id, backKey } })),
  openMetric: (key) => set(() => ({ modal: { kind: "metric", key } })),
  closeModal: () => set(() => ({ modal: null })),

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
      modal: closeIfTicket(state.modal, id),
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
      modal: closeIfTicket(state.modal, id),
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
