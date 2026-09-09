import { Rows3, Rows4 } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import type { Density } from "../../store/useAppStore";
import { Tooltip } from "../common/Tooltip";

const OPTIONS: { value: Density; label: string; icon: typeof Rows3 }[] = [
  { value: "COMFORTABLE", label: "Comfortable", icon: Rows3 },
  { value: "COMPACT", label: "Compact", icon: Rows4 },
];

export function DensityToggle() {
  const density = useAppStore((s) => s.density);
  const setDensity = useAppStore((s) => s.setDensity);

  return (
    <div className="inline-flex overflow-hidden rounded-md border border-stone-200">
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const active = density === o.value;
        return (
          <Tooltip key={o.value} label={`${o.label} density`}>
            <button
              onClick={() => setDensity(o.value)}
              aria-label={`${o.label} density`}
              aria-pressed={active}
              className={`inline-flex h-7 w-8 items-center justify-center transition-colors ${
                active
                  ? "bg-brand text-white"
                  : "bg-white text-stone-500 hover:bg-stone-50"
              }`}
            >
              <Icon size={15} />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
