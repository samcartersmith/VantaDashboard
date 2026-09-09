import { useMemo } from "react";
import { CalendarClock } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { applyFilters, roleScoped, sortItems } from "../../lib/select";
import { useKeyboardNav } from "../../hooks/useKeyboardNav";
import { RoleSwitcher } from "./RoleSwitcher";
import { MetricsStrip } from "./MetricsStrip";
import { FeedToolbar } from "./FeedToolbar";
import { ActionFeed } from "./ActionFeed";
import { KeyboardHint } from "./KeyboardHint";
import { LeadershipView } from "../leadership/LeadershipView";

const ROLE_COPY: Record<string, { title: string; sub: string }> = {
  MY_ACTIONS: {
    title: "My actions",
    sub: "Your assigned work, organized your way.",
  },
  PROGRAM_QUEUE: {
    title: "Program queue",
    sub: "Every open item across your program — triage, assign, and route.",
  },
  LEADERSHIP: {
    title: "Leadership overview",
    sub: "Program health, resolution velocity, and where work is stacking up.",
  },
};

export function Home() {
  const items = useAppStore((s) => s.items);
  const role = useAppStore((s) => s.role);
  const filters = useAppStore((s) => s.filters);
  const sort = useAppStore((s) => s.sort);

  const scoped = useMemo(() => roleScoped(items, role), [items, role]);
  const visible = useMemo(
    () => sortItems(applyFilters(scoped, filters), sort),
    [scoped, filters, sort]
  );

  const copy = ROLE_COPY[role];
  const isLeadership = role === "LEADERSHIP";
  const selectable = role === "PROGRAM_QUEUE";

  const hasActiveFilters =
    filters.domains.size > 0 ||
    filters.severities.size > 0 ||
    filters.frameworks.size > 0 ||
    filters.statuses.size > 0 ||
    filters.auditBlockingOnly ||
    filters.search.trim().length > 0;

  useKeyboardNav(visible, !isLeadership);

  return (
    <div className="mx-auto max-w-5xl px-7 py-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-stone-900">
            {copy.title}
          </h1>
          <p className="mt-0.5 text-[13px] text-stone-500">{copy.sub}</p>
        </div>
        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[12px] text-stone-600">
          <CalendarClock size={14} className="text-brand" />
          SOC 2 audit in <span className="font-medium text-stone-800">14 days</span>
        </div>
      </div>

      <div className="mt-4">
        <RoleSwitcher />
      </div>

      <div className="mt-4">
        <MetricsStrip />
      </div>

      {isLeadership ? (
        <div className="mt-5">
          <LeadershipView items={items} />
        </div>
      ) : (
        <>
          <div className="mt-5">
            <FeedToolbar showStatus={role === "PROGRAM_QUEUE"} />
          </div>
          <div className="mt-3 pb-10">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[12px] text-stone-500">
                {visible.length} {visible.length === 1 ? "item" : "items"}
              </span>
              <KeyboardHint />
            </div>
            <ActionFeed
              items={visible}
              selectable={selectable}
              role={role}
              filtered={hasActiveFilters}
            />
          </div>
        </>
      )}
    </div>
  );
}
