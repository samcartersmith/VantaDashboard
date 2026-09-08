import { User, Users, BarChart3, type LucideIcon } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import type { Role } from "../../data/types";

const ROLES: { id: Role; label: string; icon: LucideIcon }[] = [
  { id: "MY_ACTIONS", label: "My actions", icon: User },
  { id: "PROGRAM_QUEUE", label: "Program queue", icon: Users },
  { id: "LEADERSHIP", label: "Leadership", icon: BarChart3 },
];

export function RoleSwitcher() {
  const role = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);
  return (
    <div className="inline-flex gap-1 rounded-lg bg-stone-100 p-1">
      {ROLES.map((r) => {
        const Icon = r.icon;
        const active = role === r.id;
        return (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
              active
                ? "bg-brand text-white shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <Icon
              size={14}
              fill={active ? "currentColor" : "none"}
              strokeWidth={active ? 2.25 : 2}
            />
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
