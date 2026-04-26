# 5 | Observability & Administration — Revive Roadmap

Audit logging, user account management, role-based access control, the main dashboard, and settings pages. **Status: In Progress.**

> For conventions and status guide, see [ROADMAP.md](ROADMAP.md).

---

## Phase 5.1 — Observability & Administration

Audit logging, user management, dashboard health, and admin tooling.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 5.1.1 | `AuditLog` Prisma model + migration | ✅ Done | Added AuditLog model + User.role field. Migration `20260412171112_add_audit_log_and_user_role`. | PRD §3.8, Arch §3 |
| 5.1.2 | Service layer audit logging (auto-log every mutation) | ✅ Done | `lib/services/audit.ts` — `logAudit()` + `listAuditLogs()`. Session helper `lib/services/session.ts`. | PRD §3.8 |
| 5.1.3 | Audit log API routes (list, filter, paginate) | ✅ Done | `app/api/logs/route.ts` — GET with page/pageSize/action/resourceId/correlationId filters. `app/api/logs/[id]/route.ts` — GET single entry by ID. | PRD §3.8 |
| 5.1.4 | Audit log page with filterable DataTable | ✅ Done | `app/(routes)/logs/page.tsx` — DataTable with action/resource filters, pagination, default sort newest-first. | PRD §3.8 |
| 5.1.5 | Audit log CSV export | 🔲 Todo | | PRD §3.8 |
| 5.1.6 | User profile page (view & edit) | ✅ Done | `app/(routes)/settings/profile/page.tsx` + API `app/api/user/profile/route.ts` (GET/PATCH). | PRD §3.9 |
| 5.1.7 | Password change flow | ✅ Done | `app/(routes)/settings/password/page.tsx` + PUT `/api/user/profile`. Verifies current password. | PRD §3.9 |
| 5.1.8 | Role-based access control (Admin / Operator) | 🔲 Todo | `User.role` enum. Enforce in service layer + hide admin UI for operators. | PRD §3.1, Arch §6 |
| 5.1.9 | User management page (Admin only) | 🔲 Todo | List users, change roles, deactivate accounts. | PRD §3.9 |
| 5.1.10 | Dashboard: Redesign to provide most valuable metrics at first glance | ✅ Done | Full rewrite of `app/page.tsx` with StatCards, breakdowns, activity feed, quick actions. | PRD §3.7 |
| 5.1.11 | Dashboard: resource health indicators | ✅ Done | Running/stopped pills on instance card, in-use/available on volumes. | PRD §3.7 |
| 5.1.12 | Dashboard: recent activity feed | ✅ Done | Last 10 audit log entries via `useAuditLogs` hook. | PRD §3.7 |
| 5.1.13 | Dashboard: quick-action cards | ✅ Done | First 4 instances with start/stop/reboot buttons. | PRD §3.7 |
| 5.1.14 | Dashboard: system status banner | ✅ Done | Sync status, last sync time, resource counts — color-coded banner. | PRD §3.7 |
| 5.1.15 | Settings page (`/settings`) | ✅ Done | Hub page with nav cards to Profile, Password, AWS Config. Sub-pages created. | PRD §3.9 |
| 5.1.16 | AWS credentials configuration page | ✅ Done | `app/(routes)/settings/aws/page.tsx` — env-var info display with masked credentials. | PRD §3.9, §3.13 |
| 5.1.17 | `correlationId` for session-scoped audit events | ✅ Done | `AuditLog.correlationId String?` column + index. All three restore events (`restore_started`, `restore_completed`, `restore_failed`) share a UUID generated per session. `listAuditLogs` and API accept `correlationId` exact-match filter. `useAuditLog(id)` hook for single-entry fetch. | PRD §3.8 |

---

## Phase 5.2 — Competition Metrics & Situational Awareness

Elevates observability from "what did the system do" to "how is the competition going." Restore time metrics, per-machine uptime, and a live situational awareness view designed for display during an active round.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 5.2.1 | Restore time tracking (TTR) | 🔲 Todo | Record `restoreStartedAt` and `restoreCompletedAt` on each restore event. Compute TTR. Store on the AuditLog or a dedicated `RestoreEvent` table. | PRD §3.8 |
| 5.2.2 | Per-machine restore metrics on machine detail | 🔲 Todo | Stats panel: total restores (this session / all time), average TTR, fastest TTR, last restored at. | PRD §3.7 |
| 5.2.3 | Dashboard: competition metrics card | 🔲 Todo | Additional stat card on the main dashboard showing: restores this session, avg TTR, machines currently in cooldown, open incidents. | PRD §3.7 |
| 5.2.4 | Dashboard: restore activity chart scoped to active session | 🔲 Todo | Extend existing activity bar chart to optionally filter by the active Session so competition-day activity is isolated from historical noise. | PRD §3.7 |
| 5.2.5 | Situational awareness full-screen view (`/ops`) | 🔲 Todo | Grid of all registered machines. Each cell: display name, IP, status chip (running/stopped/restoring/cooldown), cooldown countdown, last restore timestamp. Refreshes in real-time. Optimized for a second monitor. | PRD §3.7 |
| 5.2.6 | Restore history page (`/restoration`) | � In Progress | `/restoration` has full history table (time, status, instance name + ID, snapshot ID) with clickable detail rows. `/restoration/[id]` detail page shows metadata, timeline, and per-session event log. Remaining: TTR column, triggered-by-playbook distinction, session-scoped filtering. | PRD §3.5 |
