import {
  Home,
  FlaskConical,
  FileText,
  ScrollText,
  ShieldCheck,
  BarChart3,
  Globe,
  Users,
  Laptop,
  ListChecks,
  KeyRound,
  Boxes,
  Bug,
  Store,
  Plug,
  HelpCircle,
  UserCircle,
  PanelLeftClose,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const SECTIONS: { heading?: string; items: NavItem[] }[] = [
  {
    items: [
      { id: "home", label: "Home", icon: Home },
      { id: "tests", label: "Tests", icon: FlaskConical },
    ],
  },
  {
    heading: "DOCUMENT",
    items: [
      { id: "documents", label: "Documents", icon: FileText },
      { id: "policies", label: "Policies", icon: ScrollText },
      { id: "risk", label: "Risk assessment", icon: ShieldCheck },
    ],
  },
  {
    heading: "REPORT",
    items: [
      { id: "compliance", label: "Compliance", icon: BarChart3 },
      { id: "trust", label: "Trust Report", icon: Globe },
    ],
  },
  {
    heading: "MANAGE",
    items: [
      { id: "people", label: "People", icon: Users },
      { id: "computers", label: "Computers", icon: Laptop },
      { id: "checklists", label: "Checklists", icon: ListChecks },
      { id: "access", label: "Access", icon: KeyRound },
      { id: "inventory", label: "Inventory", icon: Boxes },
      { id: "vulnerabilities", label: "Vulnerabilities", icon: Bug },
      { id: "vendors", label: "Vendors", icon: Store },
    ],
  },
];

const FOOTER: NavItem[] = [
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "help", label: "Help", icon: HelpCircle },
  { id: "account", label: "Account", icon: UserCircle },
];

function NavRow({ item }: { item: NavItem }) {
  const currentNav = useAppStore((s) => s.currentNav);
  const setNav = useAppStore((s) => s.setNav);
  const active = currentNav === item.id;
  const Icon = item.icon;
  return (
    <button
      onClick={() => setNav(item.id)}
      className={`relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
        active
          ? "bg-brand-50 font-medium text-brand-700"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
      )}
      <Icon size={16} className="shrink-0" />
      <span className="truncate">{item.label}</span>
    </button>
  );
}

export function Sidebar() {
  return (
    <aside className="flex w-[212px] shrink-0 flex-col border-r border-stone-200 bg-white px-2.5 py-3">
      <nav className="flex-1 space-y-0.5 overflow-y-auto thin-scroll">
        {SECTIONS.map((section, i) => (
          <div key={i} className="pb-1">
            {section.heading && (
              <div className="px-2.5 pb-1 pt-3 text-[10px] font-semibold tracking-wider text-stone-400">
                {section.heading}
              </div>
            )}
            {section.items.map((item) => (
              <NavRow key={item.id} item={item} />
            ))}
          </div>
        ))}
      </nav>
      <div className="mt-2 space-y-0.5 border-t border-stone-200 pt-2">
        {FOOTER.map((item) => (
          <NavRow key={item.id} item={item} />
        ))}
        <div className="flex justify-end px-2 pt-1">
          <PanelLeftClose size={15} className="text-stone-400" />
        </div>
      </div>
    </aside>
  );
}
