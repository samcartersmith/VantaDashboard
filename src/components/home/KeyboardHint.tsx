function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-stone-300 border-b-2 bg-white px-1 font-mono text-[10px] text-stone-600">
      {children}
    </kbd>
  );
}

export function KeyboardHint() {
  return (
    <div className="hidden items-center gap-2 text-[11px] text-stone-400 sm:flex">
      <span className="flex items-center gap-0.5">
        <Key>J</Key>
        <Key>K</Key>
        <span className="ml-0.5">move</span>
      </span>
      <span className="flex items-center gap-0.5">
        <Key>E</Key>
        <span className="ml-0.5">resolve</span>
      </span>
      <span className="flex items-center gap-0.5">
        <Key>S</Key>
        <span className="ml-0.5">snooze</span>
      </span>
      <span className="flex items-center gap-0.5">
        <Key>A</Key>
        <span className="ml-0.5">reassign</span>
      </span>
    </div>
  );
}
