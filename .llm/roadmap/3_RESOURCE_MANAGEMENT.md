# 3 | Resource Management — Revive Roadmap

Full CRUD and visibility for EC2 instances, EBS volumes, snapshots, and the volume restoration workflow. **Status: In Progress.**

> For conventions and status guide, see [ROADMAP.md](ROADMAP.md).

---

## Phase 3.1 — Feature Completion: Core Resources

Fill out remaining CRUD operations now that the data layer and UX infrastructure are solid.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 3.1.1 | Instance reboot API route + UI button | ✅ Done | `RebootInstancesCommand`, `/api/instances/reboot`, `rebootInstance()` client fn, warning-variant button in ActionButton. | PRD §3.2 |
| 3.1.2 | Instance tag editing from UI | ✅ Done | Generic `tagResources`/`untagResources` service, tag API routes for instances/volumes/snapshots, reusable `TagEditor` component on detail pages. | PRD §3.2 |
| 3.1.3 | Instance filtering and search (name, ID, status, tag) | ✅ Done | Search input + status dropdown filter bar above DataTable. Filters by name, ID, IP, type, tags. | PRD §3.2 |
| 3.1.4 | Batch operations: checkbox selection + bulk start/stop/reboot | ✅ Done | DataTable `selectable` prop with select-all/indeterminate. Batch toolbar with Start/Stop/Reboot buttons appears when rows selected. | PRD §3.2, Arch §9 |
| 3.1.5 | Instance detail slide-over panel | ✅ Done | Reusable `SlideOver` component. Row click opens slide-over with instance info, networking, tags, volumes, actions, and "Full details" link. | PRD §3.2, Arch §9 |
| 3.1.6 | Security group and network info on instance detail | ✅ Done | Added VPC ID, Public DNS, security groups section to detail page. Fixed "Pivate" typo. | PRD §3.2 |
| 3.1.7 | Copy instance ID / IP to clipboard | ✅ Done | Already implemented via `Copy` component on list (ID, IP) and detail (all IDs/IPs/DNS). | PRD §3.2 |
| 3.1.8 | Create EBS volume (API + form) | ✅ Done | CreateVolumeCommand service, POST route, CreateVolumeModal with AZ/size/type. | PRD §3.3 |
| 3.1.9 | Attach/detach volume to/from instance | ✅ Done | AttachVolumeCommand/DetachVolumeCommand services, POST/PATCH routes on volumes/[id]. | PRD §3.3 |
| 3.1.10 | Volume and snapshot filtering and search | ✅ Done | Search + status filter on volumes and snapshots pages (same pattern as instances). | PRD §3.3, §3.4 |
| 3.1.11 | Create snapshot from volume | ✅ Done | CreateSnapshotCommand service, POST route with Zod validation. | PRD §3.4 |
| 3.1.12 | Delete snapshot with confirmation | ✅ Done | DeleteSnapshotCommand service, DELETE route, ConfirmationModal on snapshots page. | PRD §3.4 |
| 3.1.13 | Restoration history table | 🔲 Todo | Placeholder card exists. Pull from `AuditLog` or `PlaybookRun` table. | PRD §3.5 |
| 3.1.14 | Restoration confirmation dialog with impact summary | 🔲 Todo | | PRD §3.5 |
| 3.1.15 | Restoration progress as multi-step visual timeline | 🔲 Todo | Replace raw SSE text with step-by-step visual indicators. | PRD §3.5 |

---

## Phase 3.2 — Restore Workflow Hardening

Make the restore workflow fast and reliable enough for active-incident use. The existing flow requires multiple navigation steps; this phase collapses that to a minimal set of actions.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 3.2.1 | Snapshot tagging: designate a "golden" recovery image | 🔲 Todo | UI control on snapshot detail + snapshot list to toggle a `isGolden` tag on the AWS snapshot and store the designation in the Machine registry (file 10). Quick visual indicator on snapshot rows. | PRD §3.4 |
| 3.2.2 | Restore straight from instance list / detail | 🔲 Todo | "Restore" action on instance row and detail page. If a golden snapshot is designated, restores immediately. If not, opens a snapshot picker modal. Eliminates the snapshots page navigation step. | PRD §3.5 |
| 3.2.3 | Restore progress visible without leaving the current page | 🔲 Todo | In-place progress indicator (status chip + elapsed time) on the instance row/panel during an active restore. No need to navigate to the restoration page to monitor. | PRD §3.5 |
| 3.2.4 | Restore completion webhook — fire integrations from server | 🔲 Todo | Move integration dispatch from client-side SSE end-detection to a server-side hook at the end of the restore service. Ensures notifications fire even if the browser tab closes mid-restore. | PRD §3.5, Arch §2 |
| 3.2.5 | Snapshot auto-created on restore start (pre-restore backup) | 🔲 Todo | Optional setting: take a snapshot of the current (compromised) volume state before overwriting, for forensic analysis. | PRD §3.4 |
