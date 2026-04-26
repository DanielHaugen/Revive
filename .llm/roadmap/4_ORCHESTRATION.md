# 4 | Orchestration — Revive Roadmap

Playbook authoring, execution engine, run history, failure policies, and scheduling. Covers everything needed to make playbooks production-grade and observable. **Status: In Progress.**

> For conventions and status guide, see [ROADMAP.md](ROADMAP.md).

---

## Phase 4.1 — Orchestration Enhancements

Make playbooks more powerful, observable, and production-grade.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 4.1.1 | Instance selection widget in playbook step form | 🔲 Todo | Searchable multi-select dropdown populated from cached instances. Replace raw text input in NodeConfigPanel. | PRD §3.6 |
| 4.1.2 | Step-level execution status with live progress | 🔲 Todo | SSE stream per step during playbook run. Visual progress indicators. | PRD §3.6 |
| 4.1.3 | Playbook run history and execution logs | 🔲 Todo | `PlaybookRun` + `StepResult` tables. Detail view per run. | PRD §3.6, Arch §3 |
| 4.1.4 | Failure handling per step (retry count, skip, abort policies) | 🔲 Todo | Configurable per step in the form. | PRD §3.6 |
| 4.1.5 | Playbook versioning / change history | 🔲 Todo | | PRD §3.6 |
| 4.1.6 | Playbook duplication (clone) | 🔲 Todo | "Duplicate" button on playbook list and detail. | PRD §3.6 |
| 4.1.7 | Dry-run mode | 🔲 Todo | Validate targets exist and are in correct state without executing. | PRD §3.6 |
| 4.1.8 | Explicit step ordering (`order` field on Step model) | ✅ Done | `order Int @default(0)` added to Step model. Migration `20260426205556_add_step_canvas_fields` applied. `listPlaybooks`/`getPlaybook` now orderBy order asc. | Arch §3 |

---

## Phase 4.2 — Post-Restore Playbook Hooks

In competition, restoring a machine is only the first step. Hardening configs, restarting services, and verifying the machine is clean often needs to happen immediately after. This phase connects restore completion to automated follow-up playbooks.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 4.2.1 | `postRestorePlaybookId` field on Machine model | 🔲 Todo | Optional FK on the Machine registry (file 10) pointing to a playbook to auto-run after a successful restore on that machine. | Arch §3 |
| 4.2.2 | Auto-trigger post-restore playbook on restore completion | 🔲 Todo | In the restore service, after SSE stream ends successfully, check if `machine.postRestorePlaybookId` is set and enqueue/run it. Fire-and-forget with separate audit log entry. | PRD §3.6, Arch §2 |
| 4.2.3 | Post-restore playbook status visible in restore UI | 🔲 Todo | After a restore completes, show a secondary progress indicator for the post-restore playbook if one is running. Include in the active restore queue panel. | PRD §3.5, Arch §9 |
| 4.2.4 | "Emergency Restore" built-in playbook template | 🔲 Todo | Seed a default playbook template: Stop instance → Restore from golden snapshot → Start instance → Verify reachability → Notify Discord. Users can clone and customize. | PRD §3.6 |
| 4.2.5 | Playbook step type: "wait for instance state" | 🔲 Todo | New step action type that polls until an instance reaches a target state (running/stopped). Needed as a synchronization point between restore and post-restore steps. | PRD §3.6 |

---

## Phase 4.3 — Visual Playbook Canvas (n8n-style)

Replace the current linear form-based playbook editor with a node-graph canvas. Each step becomes a draggable node; edges define execution flow. Unlocks non-linear workflows (branching, fan-out, conditionals) and dramatically improves authoring ergonomics for complex playbooks. This phase is a full replacement of the playbook create/edit UI and should be treated as a greenfield build on top of the existing Prisma step model.

> **Prerequisite:** 4.1.8 ✅ complete.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 4.3.1 | Evaluate and adopt a canvas/node-graph library | ✅ Done | `@xyflow/react` v12 installed in container and workspace. CSS imported via `app/globals.css`. | Arch §9 |
| 4.3.2 | Extend `Step` schema with canvas position fields | ✅ Done | `positionX Float?` and `positionY Float?` added. Migration `20260426205556_add_step_canvas_fields` applied. | Arch §3 |
| 4.3.3 | Extend `Step` schema with edge/connection model | ✅ Done | `nextStepId String?` and `branches Json?` added in same migration. `StepInput`, `stepSchema`, and `PlaybookData` types extended. | Arch §3 |
| 4.3.4 | Canvas renderer — read-only detail view | ✅ Done | `PlaybookCanvas` component on playbook detail page. Nodes show type badge, instance IDs, entry-point label. MiniMap + Controls. Falls back to sequential auto-layout when positions are null. | PRD §3.6 |
| 4.3.5 | Canvas editor — add and delete nodes | ✅ Done | Double-click canvas, "Add Step" toolbar button, or right-click context menu opens step-type picker. Delete key, NodeConfigPanel footer button, or right-click context menu removes a node. | PRD §3.6 |
| 4.3.6 | Canvas editor — connect and reorder nodes via edges | ✅ Done | Drag from source handle to target handle creates edge (`nextStepId`). Disconnecting sets `nextStepId: null`. `onNodeDragStop` persists positions. | PRD §3.6 |
| 4.3.7 | Node configuration panel (slide-over on node click) | ✅ Done | `NodeConfigPanel` slide-over: action type dropdown, target instance IDs input with per-chip removal, Delete Step button. | PRD §3.6 |
| 4.3.8 | Step type: conditional branch node | 🔲 Todo | New node type that evaluates a condition and routes to one of two output edges (true/false). | PRD §3.6 |
| 4.3.9 | Step type: parallel fan-out node | 🔲 Todo | New node type with multiple output edges that execute simultaneously. | PRD §3.6 |
| 4.3.10 | Live execution overlay on canvas during playbook run | 🔲 Todo | Nodes animate to reflect state during run: pending/running/succeeded/failed. Edges highlight as execution traverses them. | PRD §3.6 |
| 4.3.11 | Auto-layout button | 🔲 Todo | Dagre pass to arrange nodes top-to-bottom for playbooks created via old form. | Arch §9 |
| 4.3.12 | Canvas minimap and zoom controls | ✅ Done | `MiniMap` (node colors match action type accent) + `Controls` with dark theme CSS overrides in `globals.css`. | Arch §9 |
| 4.3.13 | Export / import playbook as JSON | 🔲 Todo | Download node graph as portable JSON. Import from JSON to create a new playbook. | PRD §3.6 |
| 4.3.14 | Migrate existing playbooks to canvas model | ✅ Done | `prisma/seed.ts` updated with explicit `order`, `positionX`, `positionY` on all seed steps. Edit page maps `StepWithTargets[]` to `PlaybookData.steps` (extracts `instanceId` strings). | Arch §3 |
