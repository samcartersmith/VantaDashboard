import { Construction } from "lucide-react";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-stone-400">
        <Construction size={22} />
      </div>
      <h2 className="text-lg font-medium text-stone-800">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-stone-500">
        This surface feeds the unified Action Engine. In this demo, its
        actionable items already flow into Home — open Home to triage them.
      </p>
    </div>
  );
}
