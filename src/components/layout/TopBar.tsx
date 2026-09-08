import {
  Sparkles,
  HelpCircle,
  Megaphone,
  Bell,
  Settings,
  ChevronDown,
  Search,
} from "lucide-react";

function IconButton({
  label,
  children,
  dot,
}: {
  label: string;
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-700"
    >
      {children}
      {dot && (
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand" />
      )}
    </button>
  );
}

export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-4">
      {/* Brand + workspace switcher */}
      <div className="flex items-center gap-3">
        <span className="text-[20px] font-bold tracking-tight text-stone-900">
          Vanta
        </span>
        <button className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-2.5 py-1.5 text-[13px] font-medium text-stone-700 hover:bg-stone-50">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br from-brand to-pink-400 text-[9px] text-white">
            A
          </span>
          Acme Co
          <ChevronDown size={14} className="text-stone-400" />
        </button>
      </div>

      {/* Center command search */}
      <div className="mx-auto hidden w-full max-w-xl md:block">
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            placeholder="Ask Vanta or search…"
            className="w-full rounded-lg border border-stone-200 bg-stone-50 py-1.5 pl-9 pr-10 text-[13px] text-stone-700 placeholder:text-stone-400 focus:border-brand-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] text-stone-400">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-0.5">
        <IconButton label="Vanta AI">
          <Sparkles size={17} />
        </IconButton>
        <IconButton label="Help">
          <HelpCircle size={17} />
        </IconButton>
        <IconButton label="Announcements">
          <Megaphone size={17} />
        </IconButton>
        <IconButton label="Notifications" dot>
          <Bell size={17} />
        </IconButton>
        <IconButton label="Settings">
          <Settings size={17} />
        </IconButton>
        <span className="ml-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[11px] font-semibold text-brand-700">
          AR
        </span>
      </div>
    </header>
  );
}
