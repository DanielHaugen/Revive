# 4 | Orchestration — Revive Roadmap

Playbook authoring, execution engine, run history, failure policies, and scheduling. Covers everything needed to make playbooks production-grade and observable. **Status: Todo.**

> For conventions and status guide, see [ROADMAP.md](ROADMAP.md).

---

## Phase 4.1 — Orchestration Enhancements

Make playbooks more powerful, observable, and production-grade.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 4.1.1 | Instance selection widget in playbook step form | 🔲 Todo | Searchable multi-select dropdown populated from cached instances. Replace raw text input. | PRD §3.6 |
| 4.1.2 | Step-level execution status with live progress | 🔲 Todo | SSE stream per step during playbook run. Visual progress indicators. | PRD §3.6 |
| 4.1.3 | Playbook run history and execution logs | 🔲 Todo | `PlaybookRun` + `StepResult` tables. Detail view per run. | PRD §3.6, Arch §3 |
| 4.1.4 | Failure handling per step (retry count, skip, abort policies) | 🔲 Todo | Configurable per step in the form. | PRD §3.6 |
| 4.1.5 | Playbook versioning / change history | 🔲 Todo | | PRD §3.6 |
| 4.1.6 | Playbook duplication (clone) | 🔲 Todo | "Duplicate" button on playbook list and detail. | PRD §3.6 |
| 4.1.7 | Dry-run mode | 🔲 Todo | Validate targets exist and are in correct state without executing. | PRD §3.6 |
| 4.1.8 | Explicit step ordering (`order` field on Step model) | 🔲 Todo | Currently relies on array index. Drag-to-reorder in UI. | Arch §3 |

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

> **Prerequisite:** 4.1.8 (explicit step ordering) must be complete first, as the canvas depends on a persisted `order` + `position` model rather than array index.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 4.3.1 | Evaluate and adopt a canvas/node-graph library | 🔲 Todo | Evaluate [React Flow](https://reactflow.dev) (MIT, most active) vs [XYFlow](https://xyflow.com). React Flow is the direct ancestor of n8n's canvas. Install as `@xyflow/react`. | Arch §9 |
| 4.3.2 | Extend `Step` schema with canvas position fields | 🔲 Todo | Add `positionX Float` and `positionY Float` to the `Step` model. Migration required. Used exclusively by the canvas layout; has no effect on execution order. | Arch §3 |
| 4.3.3 | Extend `Step` schema with edge/connection model | 🔲 Todo | Add `nextStepId String?` (default linear chain) and `branches Json?` (for conditional fan-out: `{ condition: string, nextStepId: string }[]`). Migration required. | Arch §3 |
| 4.3.4 | Canvas renderer — read-only detail view | 🔲 Todo | Render existing playbooks as a node graph on the detail page. Nodes show step type, target instance(s), and status. Edges show execution order. No editing yet — parity with current detail page first. | PRD §3.6 |
| 4.3.5 | Canvas editor — add and delete nodes | 🔲 Todo | Click canvas to open step-type picker (start/stop/reboot/restore/wait/notify). Adds a new node at cursor position. Delete key or context menu removes a node. Persists via PATCH to existing step API. | PRD §3.6 |
| 4.3.6 | Canvas editor — connect and reorder nodes via edges | 🔲 Todo | Drag from a node's output handle to another node's input to create a connection (`nextStepId`). Drag existing edge to rewire. Disconnecting an edge sets `nextStepId: null`. | PRD §3.6 |
| 4.3.7 | Node configuration panel (slide-over on node click) | 🔲 Todo | Clicking a node opens a right-side config panel with all step fields: action type, target instance selector (from 4.1.1), failure policy (from 4.1.4), retry count, delay, notes. Replaces the current stepper form. | PRD §3.6 |
| 4.3.8 | Step type: conditional branch node | 🔲 Todo | New node type that evaluates a condition (e.g., "instance state == stopped") and routes to one of two output edges (true/false). Enables error-recovery branches and state-gated flows. | PRD §3.6 |
| 4.3.9 | Step type: parallel fan-out node | 🔲 Todo | New node type with multiple output edges that execute simultaneously. All must complete before downstream nodes run. Required for restoring multiple machines in a single playbook. | PRD §3.6 |
| 4.3.10 | Live execution overlay on canvas during playbook run | 🔲 Todo | While a playbook is running, nodes animate to reflect current state: pending (grey), running (pulsing blue), succeeded (green), failed (red). Edges highlight as execution traverses them. Replaces step-level SSE list view. | PRD §3.6 |
| 4.3.11 | Auto-layout button | 🔲 Todo | Runs a dagre (DAG layout) pass to neatly arrange nodes top-to-bottom when a playbook was created via the old form or imported. Uses `dagre` or React Flow's built-in layout utilities. | Arch §9 |
| 4.3.12 | Canvas minimap and zoom controls | 🔲 Todo | React Flow built-in MiniMap + Controls components. Needed for playbooks with many nodes that don't fit on screen. | Arch §9 |
| 4.3.13 | Export / import playbook as JSON | 🔲 Todo | Download the node graph as a portable JSON file. Import from JSON to create a new playbook. Enables sharing templates across Revive instances (e.g., between competition teams). | PRD §3.6 |
| 4.3.14 | Migrate existing playbooks to canvas model | 🔲 Todo | One-time migration: convert all existing linear `Step` array records to canvas nodes with auto-computed X/Y positions and `nextStepId` chain. Should be a database migration script, not manual. | Arch §3 |
