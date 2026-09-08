import { ChevronRight } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import {
  METRIC_META,
  METRIC_ORDER,
  metricItems,
  type MetricKey,
} from "../../lib/metrics";

const TONE_TEXT: Record<string, string> = {
  danger: "text-red-600",
  warning: "text-amber-600",
  success: "text-emerald-600",
  default: "text-stone-900",
};

function MetricCard({ metricKey, value }: { metricKey: MetricKey; value: number }) {
  const openMetric = useAppStore((s) => s.openMetric);
  const meta = METRIC_META[metricKey];
  return (
    <button
      onClick={() => openMetric(metricKey)}
      className="group rounded-lg bg-white px-3.5 py-2.5 text-left ring-1 ring-black/5 transition-shadow hover:ring-brand-200 hover:ring-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-stone-500">{meta.label}</span>
        <ChevronRight
          size={13}
          className="text-stone-300 group-hover:text-brand"
        />
      </div>
      <div
        className={`text-[22px] font-semibold leading-tight ${
          TONE_TEXT[meta.tone]
        }`}
      >
        {value}
      </div>
    </button>
  );
}

export function MetricsStrip() {
  const items = useAppStore((s) => s.items);
  const role = useAppStore((s) => s.role);

  return (
    <div className="grid grid-cols-4 gap-2.5">
      {METRIC_ORDER.map((key) => (
        <MetricCard
          key={key}
          metricKey={key}
          value={metricItems(key, items, role).length}
        />
      ))}
    </div>
  );
}
