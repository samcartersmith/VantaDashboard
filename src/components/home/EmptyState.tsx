import { CircleCheck, ClipboardCheck, FilterX } from "lucide-react";
import type { Role } from "../../data/types";
import { useAppStore } from "../../store/useAppStore";

export function EmptyState({
  role,
  filtered,
}: {
  role: Role;
  filtered: boolean;
}) {
  const clearFilters = useAppStore((s) => s.clearFilters);

  if (filtered) {
    return (
      <Shell
        icon={<FilterX size={24} />}
        tone="neutral"
        title="No matches"
        body="No items match these filters."
        action={
          <button
            onClick={clearFilters}
            className="mt-3 text-[13px] font-medium text-brand hover:text-brand-600"
          >
            Clear filters
          </button>
        }
      />
    );
  }

  if (role === "PROGRAM_QUEUE") {
    return (
      <Shell
        icon={<ClipboardCheck size={24} />}
        tone="brand"
        title="Queue clear"
        body="Nothing open across the program. New items appear here automatically as checks fail."
      />
    );
  }

  // MY_ACTIONS (and any other feed role)
  return (
    <Shell
      icon={<CircleCheck size={24} />}
      tone="success"
      title="Your workspace is clear"
      body="No actions are assigned to you right now. Nicely done."
    />
  );
}

function Shell({
  icon,
  tone,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  tone: "success" | "brand" | "neutral";
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-50 text-emerald-600"
      : tone === "brand"
      ? "bg-brand-50 text-brand"
      : "bg-stone-100 text-stone-400";
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${toneClass}`}
      >
        {icon}
      </div>
      <p className="text-sm font-medium text-stone-800">{title}</p>
      <p className="mt-1 max-w-xs text-[13px] text-stone-500">{body}</p>
      {action}
    </div>
  );
}
