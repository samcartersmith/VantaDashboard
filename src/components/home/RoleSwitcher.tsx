import { User, Users2, LineChart, type LucideIcon } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import type { Role } from "../../data/types";

const ROLES: { id: Role; label: string; icon: LucideIcon }[] = [
  { id: "MY_ACTIONS", label: "My actions", icon: User },
  { id: "PROGRAM_QUEUE", label: "Program queue", icon: Users2 },
  { id: "LEADERSHIP", label: "Leadership", icon: LineChart },
];

export function RoleSwitcher() {
  const role = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);
  return (
    <div className="inline-flex gap-0.5 rounded-lg bg-stone-100 p-0.5">
      {ROLES.map((r) => {
        const Icon = r.icon;
        const active = role === r.id;
        return (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
              active
                ? "bg-white text-stone-900 shadow-sm ring-1 ring-black/5"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <Icon size={14} />
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
