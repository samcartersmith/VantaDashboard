import { useAppStore } from "../../store/useAppStore";
import { SparkleIcon } from "./SparkleIcon";

// Floating bottom-right toggle that opens the Vanta Agent drawer.
export function AgentFab() {
  const agentOpen = useAppStore((s) => s.agentOpen);
  const toggleAgent = useAppStore((s) => s.toggleAgent);

  if (agentOpen) return null;

  return (
    <button
      onClick={toggleAgent}
      aria-label="Open Vanta Agent"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand shadow-lg shadow-brand/40 transition-transform hover:scale-105"
    >
      <span className="font-serif text-[26px] leading-none text-white">V</span>
      <span className="absolute right-2 top-2">
        <SparkleIcon size={14} accent={false} light />
      </span>
    </button>
  );
}
