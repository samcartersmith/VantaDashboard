# Vanta — Unified Action Engine (demo dashboard)

A demo compliance dashboard that brings the **Vanta Unified Action Engine & Inbox**
PRD to life with realistic fake data (SOC 2, PCI DSS, GDPR, HIPAA). The **Home**
page is the centerpiece: a hybrid _event feed + task manager_ where compliance
work auto-flows in from every domain (Tests, Access Reviews, Vendor Risk,
Policies, People, Questionnaires, Risk Register) and is triaged like a task list.

> All data is fabricated for demonstration. State lives in memory and resets on refresh.

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

```bash
npm run build   # type-check + production build
```

## What's in it

**Role switcher** reshapes Home across the PRD's three personas:

- **My actions** — a focused view of items assigned to the current user
  (Alex Rivera, Security Analyst), sorted by audit urgency.
- **Program queue** — every open item with bulk-select triage, a Status
  filter, and SLA countdowns for the compliance-manager workflow.
- **Leadership overview** — audit-readiness score, open audit-blocking count,
  mean time-to-remediate, on-time completion, a remediation-velocity trend,
  audit-blocking bottlenecks, and team workload.

**Triage (fully interactive, in-memory)**

- Click any row to open the detail panel: full context, a remediation button,
  and the item's activity / audit trail.
- Resolve, Start, Snooze (requires a mandatory audit note), Reassign
  (to any person or team), Dismiss — plus bulk versions in Program queue.
- Filter by domain / severity / framework / status / audit-blocking, search,
  and sort by Smart (audit urgency), due date, severity, or newest.
- The metrics strip and Leadership analytics recompute live as you triage.

**Audit-Urgency Score** (`src/lib/urgency.ts`) combines security severity,
audit proximity (SOC 2 in 14 days), and SLA time-to-expiry into a single
0–100 weight that drives the default "Smart" sort.

## Architecture

- **Vite + React + TypeScript + Tailwind**, with **Zustand** for state.
- `src/data/` — the `ActionableItem` schema (from the PRD payload), people/teams,
  and the seed dataset.
- `src/lib/` — urgency scoring, filtering/sorting selectors, formatting.
- `src/store/useAppStore.ts` — the single source of truth and all triage actions.
- `src/components/` — `layout/` (Vanta shell), `home/` (feed, rows, toolbar,
  detail panel, dialogs), `leadership/` (analytics), `common/` (badges, avatars).

Other sidebar surfaces (Tests, Documents, Policies, …) are placeholders; in this
demo their actionable items already flow into the Home Action Engine.
