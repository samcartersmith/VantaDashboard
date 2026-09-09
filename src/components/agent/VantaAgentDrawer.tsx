import { useEffect, useRef, useState } from "react";
import {
  X,
  ChevronDown,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Clock,
  Check,
  GitMerge,
  Sparkles,
  ArrowUp,
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import type { ActionableItem } from "../../data/types";
import { SeverityDot } from "../common/atoms";
import { SparkleIcon } from "./SparkleIcon";
import {
  duplicatePair,
  quickWins,
  quickWinsTotal,
  rootCauseItems,
} from "../../lib/agent";

type AgentKind = "triage" | "dedup" | "rootcause" | "generic";
type Msg =
  | { role: "user"; text: string }
  | { role: "agent"; kind: AgentKind };

const PROMPTS: { label: string; kind: AgentKind }[] = [
  { label: "I have 30 minutes — what can I finish?", kind: "triage" },
  { label: "Find duplicate exceptions", kind: "dedup" },
  { label: "Summarize root causes", kind: "rootcause" },
];

const STEPS: Record<AgentKind, string[]> = {
  triage: [
    "Scanned your open queue",
    "Estimated effort from severity and remediation type",
    "Ranked by what fits a 30-minute block",
  ],
  dedup: [
    "Compared exception titles and source entities",
    "Grouped items with matching signals",
    "Flagged likely duplicates for review",
  ],
  rootcause: [
    "Pulled recent activity and linked evidence",
    "Correlated with source-system state",
    "Summarized the likely cause in one line",
  ],
  generic: ["Read your open queue", "Matched against your question", "Drafted a summary"],
};

export function VantaAgentDrawer() {
  const open = useAppStore((s) => s.agentOpen);
  const closeAgent = useAppStore((s) => s.closeAgent);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeAgent();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeAgent]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!open) return null;

  function ask(kind: AgentKind, label: string) {
    setMessages((m) => [...m, { role: "user", text: label }, { role: "agent", kind }]);
  }
  function submit() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "agent", kind: "generic" }]);
    setInput("");
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={closeAgent} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-[400px] flex-col border-l border-stone-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-3">
          <SparkleIcon size={18} />
          <span className="text-[15px] font-semibold text-stone-900">Vanta Agent</span>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
            Preview
          </span>
          <button
            onClick={closeAgent}
            aria-label="Close"
            className="ml-auto text-stone-400 hover:text-stone-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conversation */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-4 thin-scroll"
        >
          {messages.length === 0 && (
            <div className="pt-2 text-center">
              <div className="mx-auto mb-2 w-fit">
                <SparkleIcon size={26} />
              </div>
              <p className="text-[13px] text-stone-500">
                Ask about your queue, or try a suggestion below.
              </p>
            </div>
          )}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand px-3 py-2 text-[13px] text-white">
                  {m.text}
                </div>
              </div>
            ) : (
              <AgentMessage key={i} kind={m.kind} />
            )
          )}
        </div>

        {/* Suggested prompts */}
        <div className="flex flex-wrap gap-1.5 border-t border-stone-100 px-4 pt-3">
          {PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => ask(p.kind, p.label)}
              className="rounded-full border border-stone-200 px-2.5 py-1 text-[12px] text-stone-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input + disclaimer */}
        <div className="px-4 pb-3 pt-2">
          <div className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-1.5 focus-within:border-brand-200 focus-within:ring-2 focus-within:ring-brand-100">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Ask Vanta Agent…"
              className="flex-1 bg-transparent text-[13px] text-stone-700 placeholder:text-stone-400 focus:outline-none"
            />
            <button
              onClick={submit}
              aria-label="Send"
              className="flex h-6 w-6 items-center justify-center rounded-md bg-brand text-white disabled:opacity-40"
              disabled={!input.trim()}
            >
              <ArrowUp size={14} />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-stone-400">
            Vanta AI can make mistakes. Please verify responses.
          </p>
        </div>
      </aside>
    </>
  );
}

function ThinkingSteps({ kind }: { kind: AgentKind }) {
  const [open, setOpen] = useState(false);
  const steps = STEPS[kind];
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-[12px] text-stone-500 hover:text-stone-700"
      >
        Thinking involved {steps.length} steps
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && (
        <ol className="mt-2 space-y-1 border-l border-stone-200 pl-3">
          {steps.map((s, i) => (
            <li key={i} className="text-[12px] text-stone-500">
              {s}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Feedback({ sources }: { sources: number }) {
  return (
    <div className="mt-3 flex items-center gap-3 text-stone-400">
      <span className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 px-2 py-0.5 text-[11px] text-stone-500">
        <BookOpen size={12} /> {sources} {sources === 1 ? "source" : "sources"}
      </span>
      <span className="ml-auto flex gap-3">
        <ThumbsUp size={14} className="cursor-pointer hover:text-stone-600" />
        <ThumbsDown size={14} className="cursor-pointer hover:text-stone-600" />
      </span>
    </div>
  );
}

function MiniRow({ item, right }: { item: ActionableItem; right?: string }) {
  const closeAgent = useAppStore((s) => s.closeAgent);
  const openTicket = useAppStore((s) => s.openTicket);
  return (
    <button
      onClick={() => {
        closeAgent();
        openTicket(item.actionable_item_id);
      }}
      className="flex w-full items-center gap-2 border-t border-stone-100 py-2 text-left first:border-t-0"
    >
      <SeverityDot severity={item.severity} />
      <span className="flex-1 truncate text-[13px] text-stone-800">{item.title}</span>
      {right && <span className="text-[11px] text-stone-500">{right}</span>}
    </button>
  );
}

function AgentMessage({ kind }: { kind: AgentKind }) {
  const items = useAppStore((s) => s.items);
  const [merged, setMerged] = useState(false);

  let body: React.ReactNode;
  let sources = 1;

  if (kind === "triage") {
    const wins = quickWins(items);
    sources = wins.length;
    body = (
      <>
        <div className="flex items-center gap-1.5 text-[14px] font-medium text-stone-900">
          <Clock size={15} className="text-brand" />
          {wins.length} items you can close in ~{quickWinsTotal(wins)} minutes
        </div>
        <div className="mt-2">
          {wins.map((w) => (
            <MiniRow key={w.item.actionable_item_id} item={w.item} right={`~${w.minutes} min`} />
          ))}
        </div>
        <p className="mt-2 text-[12px] text-stone-500">
          Start with the first one? I'll open it for you.
        </p>
      </>
    );
  } else if (kind === "dedup") {
    const pair = duplicatePair(items);
    sources = pair.length;
    body = (
      <>
        <div className="text-[14px] font-medium text-stone-900">
          Found {pair.length} near-duplicate exceptions
        </div>
        <p className="mt-1 text-[12px] text-stone-500">
          These look like the same underlying issue tracked twice:
        </p>
        <div className="mt-2 rounded-lg border border-stone-200 p-2">
          {pair.map((it) => (
            <MiniRow key={it.actionable_item_id} item={it} />
          ))}
        </div>
        <button
          onClick={() => setMerged(true)}
          disabled={merged}
          className={`mt-2 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium ${
            merged
              ? "bg-emerald-50 text-emerald-700"
              : "bg-brand text-white hover:bg-brand-600"
          }`}
        >
          {merged ? <Check size={13} /> : <GitMerge size={13} />}
          {merged ? "Merged into one exception" : "Merge duplicates"}
        </button>
      </>
    );
  } else if (kind === "rootcause") {
    const rc = rootCauseItems(items);
    sources = rc.length;
    body = (
      <>
        <div className="text-[14px] font-medium text-stone-900">Root-cause summaries</div>
        <div className="mt-2 space-y-2.5">
          {rc.map((it) => (
            <div key={it.actionable_item_id}>
              <div className="text-[13px] font-medium text-stone-800">{it.title}</div>
              <div className="text-[12px] text-stone-500">{it.ai_root_cause}</div>
            </div>
          ))}
        </div>
      </>
    );
  } else {
    const active = items.filter((i) => i.status === "OPEN").slice(0, 3);
    sources = active.length || 1;
    body = (
      <>
        <div className="text-[14px] font-medium text-stone-900">Here's what stands out</div>
        <p className="mt-1 text-[12px] text-stone-500">
          Based on your open queue, these are the highest-signal items right now:
        </p>
        <div className="mt-2">
          {active.map((it) => (
            <MiniRow key={it.actionable_item_id} item={it} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <Sparkles size={16} className="text-brand" />
      </div>
      <div className="mb-2">
        <ThinkingSteps kind={kind} />
      </div>
      {body}
      <Feedback sources={sources} />
    </div>
  );
}
