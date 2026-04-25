# 10 | Competition Operations — Revive Roadmap

Features purpose-built for active cyber defense competition use: session management, named machine aliases, golden snapshot designation, cooldown tracking, situational awareness, and pre-competition readiness. **Status: Todo.**

> For conventions and status guide, see [ROADMAP.md](ROADMAP.md).

---

## Phase 10.1 — Machine Registry & Named Assets

The competition operates with human identifiers ("Blue 5"), not AWS instance IDs. This phase introduces a persistent machine registry that maps those names to AWS resources and enriches the entire UI with competition-aware naming.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 10.1.1 | `Machine` Prisma model + migration | 🔲 Todo | Fields: `id`, `displayName` (e.g., "Blue 5"), `instanceId` (FK to CachedInstance), `defaultSnapshotId` (the designated golden image), `team`, `notes`, `createdAt`, `updatedAt`. | Arch §3 |
| 10.1.2 | Machine registry API routes | 🔲 Todo | `GET/POST /api/machines`, `GET/PATCH/DELETE /api/machines/[id]`. Supports assigning `instanceId` and `defaultSnapshotId`. | Arch §7 |
| 10.1.3 | Machine registry management page (`/machines`) | 🔲 Todo | Table view of all defined machines with display name, linked instance, current instance status, and assigned golden snapshot. Add/edit/delete. | PRD §3.2 |
| 10.1.4 | Display machine aliases throughout the UI | 🔲 Todo | When a Machine row exists for an instance, show `displayName` as primary label with instance ID secondary. Applies to instance list, detail, dashboard, audit logs, and restore pages. | Arch §9 |
| 10.1.5 | Golden snapshot designation per machine | 🔲 Todo | UI control on Machine detail to select and pin a snapshot as the recovery image. Stored as `defaultSnapshotId` on Machine. | PRD §3.4 |

---

## Phase 10.2 — One-Click & Parallel Restore

In an active attack, navigating to the snapshots page to find and trigger a restore is too slow. This phase collapses that to a single action, and supports restoring multiple machines simultaneously.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 10.2.1 | Quick-restore button on instance list and detail | 🔲 Todo | "Restore" button visible per row. If `machine.defaultSnapshotId` is set, restores immediately. If not set, opens snapshot picker modal. | PRD §3.5 |
| 10.2.2 | Quick-restore API route (`POST /api/instances/[id]/restore`) | 🔲 Todo | Looks up `machine.defaultSnapshotId`, calls existing restore logic, fires integrations. Returns immediately (SSE for progress). | Arch §7 |
| 10.2.3 | Parallel restore execution | 🔲 Todo | Allow triggering restores on multiple selected instances simultaneously. Each restore runs independently. Progress tracked per-machine. | PRD §3.5 |
| 10.2.4 | Active restore queue panel | 🔲 Todo | Persistent panel (sidebar or bottom tray) showing all in-flight restores with per-machine progress bars and elapsed time. Dismisses automatically on completion. | Arch §9 |
| 10.2.5 | Restore priority / triage ordering | 🔲 Todo | Drag-to-reorder queue when multiple restores are pending. Higher priority machines get resources first. | PRD §3.5 |

---

## Phase 10.3 — Competition Session Management

Groups all activity (restores, incidents, notifications) into discrete competition rounds so post-competition analysis is clean and scoreable.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 10.3.1 | `Session` Prisma model + migration | 🔲 Todo | Fields: `id`, `name` (e.g., "CCDC 2026 — Round 1"), `startedAt`, `endedAt`, `notes`. All restores and incidents reference the active session. | Arch §3 |
| 10.3.2 | Session API routes | 🔲 Todo | `GET/POST /api/sessions`, `GET/PATCH /api/sessions/[id]` (end session, add notes). | Arch §7 |
| 10.3.3 | Session management page (`/sessions`) | 🔲 Todo | List of past sessions with summary stats (total restores, avg TTR, total downtime per machine). Start new session button. | PRD §3.8 |
| 10.3.4 | Active session indicator in Navbar | 🔲 Todo | Shows current session name + elapsed time when a session is active. Orange badge if no session is active. | Arch §9 |
| 10.3.5 | Session-scoped audit log and restore history views | 🔲 Todo | Filter controls on log and restore history pages default to the active session. | PRD §3.8 |
| 10.3.6 | End-of-session report | 🔲 Todo | Summary page: machines restored, incidents logged, TTR per machine, total downtime, integration dispatches. Exportable as PDF or CSV. | PRD §3.8 |

---

## Phase 10.4 — Attack Cooldown Tracking

Makes the post-restore attack pause window visible inside the application, not just in Discord. Defenders and observers can see at a glance which machines are protected and for how long.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 10.4.1 | `CooldownWindow` Prisma model + migration | 🔲 Todo | Fields: `id`, `machineId`, `restoredAt`, `attacksAllowedAt`, `sessionId`. Created automatically when a restore completes. | Arch §3 |
| 10.4.2 | Cooldown status on machine registry and instance list | 🔲 Todo | Status chip: "In Cooldown (2:47 remaining)" with countdown. Turns green/neutral when window expires. | Arch §9 |
| 10.4.3 | Competition situational awareness dashboard | 🔲 Todo | Full-screen grid view of all registered machines. Each cell shows: display name, IP, current status, cooldown countdown, last restore time. Designed for display on a second monitor during competition. | PRD §3.7 |
| 10.4.4 | Cooldown history per machine | 🔲 Todo | Timeline of past cooldown windows on machine detail page. Visual indicator of how frequently the machine is targeted. | PRD §3.8 |
| 10.4.5 | Configurable default cooldown duration | 🔲 Todo | Global setting in `/settings` (default 10 min). Overridable per Machine. Feeds `attacksAllowedAt` computation in restore and Discord integration. | PRD §3.9 |

---

## Phase 10.5 — Incident Logging

Separates "system actions" (what the tool did) from "competition incidents" (what the red team did). Enables TTR and downtime calculations per machine.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 10.5.1 | `Incident` Prisma model + migration | 🔲 Todo | Fields: `id`, `machineId`, `sessionId`, `detectedAt`, `resolvedAt` (set on restore complete), `severity` (low/medium/high/critical), `notes`. | Arch §3 |
| 10.5.2 | Incident API routes | 🔲 Todo | `GET/POST /api/incidents`, `GET/PATCH /api/incidents/[id]`. Open incident on machine compromise; close automatically when restore completes, or manually. | Arch §7 |
| 10.5.3 | Quick "Log Incident" button per machine | 🔲 Todo | One-click from instance list or situational awareness dashboard to open an incident with pre-filled machine and timestamp. | PRD §3.5 |
| 10.5.4 | Incident list page (`/incidents`) | 🔲 Todo | Filterable table by machine, severity, session, status (open/resolved). Columns: machine, detected at, TTR, severity, notes. | PRD §3.8 |
| 10.5.5 | Restore auto-closes open incident for that machine | 🔲 Todo | When `POST /api/instances/[id]/restore` completes, query for open incidents on that machine and set `resolvedAt`. Compute TTR. | PRD §3.5 |
| 10.5.6 | TTR and downtime metrics on machine detail | 🔲 Todo | Per-machine stats: total incidents this session, average TTR, % uptime. | PRD §3.7 |

---

## Phase 10.6 — Pre-Competition Readiness

A structured checklist to run before competition starts, ensuring the tool and all machine snapshots are ready.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 10.6.1 | Readiness check API (`POST /api/readiness`) | 🔲 Todo | Runs: AWS connectivity, DB health, sync freshness, all machines have `defaultSnapshotId` set, all golden snapshots exist in AWS, all instances are running. Returns per-check pass/fail. | PRD §3.13 |
| 10.6.2 | Readiness dashboard page (`/readiness`) | 🔲 Todo | Visual checklist: green/red per check. "All Systems Go" banner when everything passes. Button to run again. Links to fix any failing checks. | PRD §3.13 |
| 10.6.3 | Force-sync and snapshot freshness warning | 🔲 Todo | If any golden snapshot is older than a configurable threshold (e.g., 24h), flag it on the readiness page. | PRD §3.10 |
| 10.6.4 | Pre-competition snapshot creation | 🔲 Todo | "Snapshot All Machines Now" button on readiness page. Creates a fresh snapshot of every registered machine's root volume and optionally sets them as the new golden image. | PRD §3.4 |
