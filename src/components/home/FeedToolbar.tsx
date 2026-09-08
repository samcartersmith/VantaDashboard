import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X, Check } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import type { SortKey } from "../../store/useAppStore";
import type { Domain, Framework, Severity, Status } from "../../data/types";
import {
  DOMAIN_LABEL,
  FRAMEWORK_LABEL,
  SEVERITY_LABEL,
  STATUS_LABEL,
} from "../../lib/format";

function useOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

function MultiSelect<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: Set<T>;
  onToggle: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutside(() => setOpen(false));
  const count = selected.size;
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] transition-colors ${
          count
            ? "border-brand-200 bg-brand-50 text-brand-700"
            : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
        }`}
      >
        {label}
        {count > 0 && (
          <span className="rounded bg-brand px-1 text-[10px] font-semibold text-white">
            {count}
          </span>
        )}
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-52 rounded-lg border border-stone-200 bg-white p-1 shadow-lg">
          {options.map((o) => {
            const on = selected.has(o.value);
            return (
              <button
                key={o.value}
                onClick={() => onToggle(o.value)}
                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[12px] text-stone-700 hover:bg-stone-50"
              >
                {o.label}
                {on && <Check size={14} className="text-brand" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const SORT_LABELS: Record<SortKey, string> = {
  SMART: "Smart (audit urgency)",
  DUE: "Due date",
  SEVERITY: "Severity",
  CREATED: "Newest",
};

function SortMenu() {
  const sort = useAppStore((s) => s.sort);
  const setSort = useAppStore((s) => s.setSort);
  const [open, setOpen] = useState(false);
  const ref = useOutside(() => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-[12px] text-stone-600 hover:text-stone-900"
      >
        <SlidersHorizontal size={13} />
        Sort: <span className="font-medium text-stone-800">{SORT_LABELS[sort]}</span>
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-stone-200 bg-white p-1 shadow-lg">
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => {
                setSort(k);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[12px] text-stone-700 hover:bg-stone-50"
            >
              {SORT_LABELS[k]}
              {sort === k && <Check size={14} className="text-brand" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const DOMAIN_OPTS = (Object.keys(DOMAIN_LABEL) as Domain[]).map((v) => ({
  value: v,
  label: DOMAIN_LABEL[v],
}));
const SEV_OPTS = (Object.keys(SEVERITY_LABEL) as Severity[]).map((v) => ({
  value: v,
  label: SEVERITY_LABEL[v],
}));
const FW_OPTS = (Object.keys(FRAMEWORK_LABEL) as Framework[]).map((v) => ({
  value: v,
  label: FRAMEWORK_LABEL[v],
}));
const STATUS_OPTS = (["OPEN", "IN_PROGRESS", "SNOOZED", "RESOLVED"] as Status[]).map(
  (v) => ({ value: v, label: STATUS_LABEL[v] })
);

export function FeedToolbar({ showStatus }: { showStatus: boolean }) {
  const filters = useAppStore((s) => s.filters);
  const toggle = useAppStore((s) => s.toggleFilterValue);
  const toggleAudit = useAppStore((s) => s.toggleAuditBlocking);
  const setSearch = useAppStore((s) => s.setSearch);
  const clearFilters = useAppStore((s) => s.clearFilters);

  const anyFilter =
    filters.domains.size ||
    filters.severities.size ||
    filters.frameworks.size ||
    filters.statuses.size ||
    filters.auditBlockingOnly ||
    filters.search;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search
          size={13}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400"
        />
        <input
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actions…"
          className="w-48 rounded-md border border-stone-200 bg-white py-1.5 pl-7 pr-2 text-[12px] text-stone-700 placeholder:text-stone-400 focus:border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <MultiSelect
        label="Domain"
        options={DOMAIN_OPTS}
        selected={filters.domains}
        onToggle={(v) => toggle("domains", v)}
      />
      <MultiSelect
        label="Severity"
        options={SEV_OPTS}
        selected={filters.severities}
        onToggle={(v) => toggle("severities", v)}
      />
      <MultiSelect
        label="Framework"
        options={FW_OPTS}
        selected={filters.frameworks}
        onToggle={(v) => toggle("frameworks", v)}
      />
      {showStatus && (
        <MultiSelect
          label="Status"
          options={STATUS_OPTS}
          selected={filters.statuses}
          onToggle={(v) => toggle("statuses", v)}
        />
      )}
      <button
        onClick={toggleAudit}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] transition-colors ${
          filters.auditBlockingOnly
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
        }`}
      >
        Audit-blocking
      </button>
      {anyFilter ? (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1 text-[12px] text-stone-500 hover:text-stone-700"
        >
          <X size={12} /> Clear
        </button>
      ) : null}
      <div className="ml-auto">
        <SortMenu />
      </div>
    </div>
  );
}
