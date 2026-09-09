import { useMemo } from "react";
import {
  AlertOctagon,
  Clock3,
  Gauge,
  TrendingDown,
  CircleCheckBig,
  type LucideIcon,
} from "lucide-react";
import type { ActionableItem } from "../../data/types";
import { PEOPLE, TEAMS } from "../../data/people";
import { DOMAIN_LABEL } from "../../lib/format";
import { isActive, scoreOf } from "../../lib/select";
import type { Domain } from "../../data/types";

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 220;
  const h = 44;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d - min) / range) * (h - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BigStat({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-stone-500">{label}</span>
        <span className={tone}>
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-2 text-[26px] font-semibold leading-none text-stone-900">
        {value}
      </div>
      {sub && <div className="mt-1.5 text-[12px] text-stone-500">{sub}</div>}
    </div>
  );
}

export function LeadershipView({ items }: { items: ActionableItem[] }) {
  const stats = useMemo(() => {
    const active = items.filter(isActive);
    const auditBlocking = active.filter((i) => i.audit_blocking);
    const resolved = items.filter((i) => i.status === "RESOLVED");

    // Audit readiness: start at 100, penalize open audit-blocking + overdue.
    const now = Date.now();
    const overdue = active.filter(
      (i) => new Date(i.due_date).getTime() < now
    ).length;
    const readiness = Math.max(
      35,
      Math.round(100 - auditBlocking.length * 6 - overdue * 2.5)
    );

    // On-time completion rate from resolved items (fake-plausible baseline).
    const onTime = 0.82;

    // Workload per owner (people + teams), active items only.
    const workload: { name: string; initials: string; count: number }[] = [];
    for (const t of TEAMS) {
      const count = active.filter(
        (i) => i.assignee.type === "TEAM" && i.assignee.id === t.id
      ).length;
      if (count) workload.push({ name: t.name, initials: t.initials, count });
    }
    for (const p of PEOPLE) {
      const count = active.filter(
        (i) => i.assignee.type === "USER" && i.assignee.id === p.id
      ).length;
      if (count) workload.push({ name: p.name, initials: p.initials, count });
    }
    workload.sort((a, b) => b.count - a.count);

    // Bottlenecks by domain: total urgency of active audit-blocking items.
    const byDomain = new Map<Domain, { count: number; urgency: number }>();
    for (const i of auditBlocking) {
      const cur = byDomain.get(i.domain_source) ?? { count: 0, urgency: 0 };
      cur.count += 1;
      cur.urgency += scoreOf(i);
      byDomain.set(i.domain_source, cur);
    }
    const bottlenecks = [...byDomain.entries()]
      .map(([d, v]) => ({ domain: d, ...v }))
      .sort((a, b) => b.urgency - a.urgency)
      .slice(0, 4);

    return {
      readiness,
      auditBlockingCount: auditBlocking.length,
      resolvedCount: resolved.length,
      overdue,
      onTime,
      workload: workload.slice(0, 6),
      maxWorkload: Math.max(1, ...workload.map((w) => w.count)),
      bottlenecks,
    };
  }, [items]);

  return (
    <div className="space-y-4">
      {stats.auditBlockingCount === 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CircleCheckBig size={18} className="shrink-0 text-emerald-600" />
          <div>
            <div className="text-[13px] font-semibold text-emerald-800">
              Audit-ready
            </div>
            <div className="text-[12px] text-emerald-700">
              No audit-blocking items open across the program.
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-4 gap-3">
        <BigStat
          icon={Gauge}
          label="Audit readiness"
          value={`${stats.readiness}%`}
          sub="SOC 2 · in 14 days"
          tone="text-emerald-500"
        />
        <BigStat
          icon={AlertOctagon}
          label="Open audit-blocking"
          value={`${stats.auditBlockingCount}`}
          sub={`${stats.overdue} overdue on SLA`}
          tone="text-red-500"
        />
        <BigStat
          icon={Clock3}
          label="Mean time-to-remediate"
          value="2.4d"
          sub="↓ 31% vs. last quarter"
          tone="text-brand"
        />
        <BigStat
          icon={TrendingDown}
          label="On-time completion"
          value={`${Math.round(stats.onTime * 100)}%`}
          sub="Periodic reviews"
          tone="text-amber-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* TTR trend */}
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-stone-800">
              Remediation velocity
            </h3>
            <span className="text-[11px] text-stone-400">last 12 weeks</span>
          </div>
          <div className="mt-3">
            <Sparkline
              data={[52, 48, 55, 41, 44, 38, 40, 33, 36, 29, 27, 23]}
              color="#5b4ef0"
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[20px] font-semibold text-stone-900">23</span>
            <span className="text-[12px] text-stone-500">
              open items this week · trending down
            </span>
          </div>
        </div>

        {/* Bottlenecks */}
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-[13px] font-semibold text-stone-800">
            Audit-blocking bottlenecks
          </h3>
          <div className="space-y-2.5">
            {stats.bottlenecks.map((b) => (
              <div key={b.domain} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-[12px] text-stone-600">
                  {DOMAIN_LABEL[b.domain]}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-red-400"
                    style={{
                      width: `${Math.min(
                        100,
                        (b.urgency /
                          (stats.bottlenecks[0]?.urgency || 1)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-[12px] font-medium text-stone-700">
                  {b.count}
                </span>
              </div>
            ))}
            {stats.bottlenecks.length === 0 && (
              <p className="text-[13px] text-stone-500">
                No audit-blocking items — you're audit-ready.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Team workload */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <h3 className="mb-3 text-[13px] font-semibold text-stone-800">
          Team workload · active items by owner
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
          {stats.workload.map((w) => (
            <div key={w.name} className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[9px] font-semibold text-stone-700">
                {w.initials}
              </span>
              <span className="w-28 shrink-0 truncate text-[12px] text-stone-600">
                {w.name}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${(w.count / stats.maxWorkload) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-[12px] font-medium text-stone-700">
                {w.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
