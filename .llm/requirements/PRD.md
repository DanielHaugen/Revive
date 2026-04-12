# Product Requirements Document — Revive

> **Revive** — Remote EC2 Virtual Instance and Volume Engine
> An AWS EC2 management dashboard for PCDC operations.

---

## 1. Overview

Revive is a web-based administration tool that provides a unified interface for managing AWS EC2 instances, EBS volumes, snapshots, and automated orchestration playbooks. It targets internal ops teams who need to start/stop instances, restore from snapshots, and run repeatable multi-step operations without touching the AWS Console.

The platform prioritizes **user experience** — fast page loads via background data synchronization, clear visual feedback for every action, and a modern dark-themed UI following patterns from AWS Console, Vercel, Datadog, and Portainer.

---

## 2. Users & Personas

| Persona | Description |
|---------|-------------|
| **Operator** | Day-to-day user who starts/stops instances, monitors status, runs playbooks, and restores from snapshots. Needs fast access to resource state and clear feedback on operations. |
| **Admin** | Manages user accounts, configures playbooks, reviews audit logs, and controls platform settings. Needs visibility into all user activity and system health. |
| **New Team Member** | A developer or ops engineer onboarding onto the platform. Needs guided setup, clear documentation, and intuitive UX that minimizes ramp-up time. |

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization

- [x] Email/password registration and login.
- [x] JWT-based session tokens stored in cookies.
- [x] Password strength validation with visual indicator.
- [x] Forgot-password flow (UI exists, backend email pending).
- [ ] httpOnly, Secure, SameSite=Strict cookies for JWT storage.
- [ ] Short-lived access tokens (15 min) with refresh token rotation (7 days).
- [ ] Role-based access control (Admin vs Operator).
- [ ] Auth middleware on all non-public API routes.
- [ ] CSRF protection.
- [ ] Invite-only registration mode (admin generates invite links).
- [ ] Session invalidation on logout (server-side refresh token revocation).

### 3.2 EC2 Instance Management

- [x] List all EC2 instances with status, type, tags, and public IP.
- [x] Start and stop instances via API.
- [x] View individual instance details.
- [x] Auto-refresh instance list on a polling interval.
- [ ] Reboot instances.
- [ ] Instance tagging and tag editing from the UI.
- [ ] Instance filtering and search (by name, ID, status, tag).
- [ ] Batch operations: select multiple instances for bulk start/stop/reboot.
- [ ] Instance detail slide-over panel (view details without leaving the list page).
- [ ] Security group and network info on instance detail view.
- [ ] Instance launch time and uptime display.
- [ ] Copy instance ID / IP to clipboard with one click.

### 3.3 EBS Volumes

- [x] List all EBS volumes with attachment info, size, and type.
- [x] Delete volumes via the UI.
- [ ] Create volumes (API + form with size, type, AZ selection).
- [ ] Attach/detach volumes to/from instances.
- [ ] Volume filtering and search.
- [ ] Volume detail slide-over panel.

### 3.4 Snapshots

- [x] List all snapshots with volume ID, size, tier, tags, and status.
- [x] View individual snapshot details.
- [x] Link a snapshot to an EC2 instance (tag-based).
- [ ] Create new snapshots from volumes.
- [ ] Delete snapshots with confirmation.
- [ ] Snapshot filtering and search.
- [ ] Snapshot detail slide-over panel.

### 3.5 Instance Restoration

- [x] Select an instance and a linked snapshot.
- [x] Perform restoration with real-time SSE progress streaming.
- [ ] Show recent restoration history with status, timestamps, and user who triggered it.
- [ ] Restoration confirmation dialog with impact summary before executing.
- [ ] Restoration progress as a multi-step visual timeline (not just text streaming).

### 3.6 Orchestration Playbooks

- [x] Create playbooks with name, description, and ordered steps.
- [x] Each step has an action type and target instances.
- [x] List, view, edit, and delete playbooks (Prisma-backed).
- [x] Star/unstar playbooks for quick access.
- [x] Run a playbook (POST request).
- [ ] Instance selection widget in step form (searchable dropdown from cached instances, not raw text input).
- [ ] Step-level execution status and live progress during playbook run.
- [ ] Playbook run history with execution logs, timestamps, and user attribution.
- [ ] Failure handling per step (retry, skip, abort policies).
- [ ] Playbook versioning / change history.
- [ ] Playbook duplication ("clone" an existing playbook).
- [ ] Dry-run mode (validate targets exist and are in correct state without executing).

### 3.7 Dashboard

- [x] Summary cards for instance and snapshot counts.
- [ ] At-a-glance resource health indicators (running vs stopped vs error counts).
- [ ] Recent activity feed (last 10 actions across all resources).
- [ ] Quick-action cards (start/stop most-used instances, run starred playbooks).
- [ ] System status banner (AWS connectivity, sync health, last sync timestamp).
- [ ] Resource distribution chart (instance types, volume sizes).

### 3.8 Audit Logging

- [ ] Audit log data model tracking: user, action, resource type, resource ID, timestamp, status, details.
- [ ] API routes for querying audit logs with pagination.
- [ ] Audit log page with filterable, sortable DataTable.
- [ ] Log all user-initiated actions (start, stop, reboot, restore, create, delete, playbook run).
- [ ] Export audit log as CSV.
- [ ] Retention policy configuration.

### 3.9 Settings & User Profile

- [ ] User profile page (view and edit name, email).
- [ ] Password change flow with current password verification.
- [ ] AWS region configuration (global setting, visible in UI).
- [ ] Sync interval configuration (Admin only).
- [ ] User management page (Admin only — list users, change roles, deactivate accounts).
- [ ] Platform appearance settings (future: light mode toggle).

### 3.10 Background Data Synchronization

- [ ] Server-side sync worker that polls AWS on a configurable interval (default: 30s).
- [ ] Upserts instance, volume, and snapshot state into Prisma cache tables.
- [ ] API read routes serve from cache tables — sub-100ms response times.
- [ ] Mutating operations (start, stop, create, delete) call AWS directly, then trigger immediate cache refresh.
- [ ] "Last synced: Xs ago" indicator in the Navbar.
- [ ] Manual refresh button triggers on-demand sync.
- [ ] Sync health monitoring — detect and surface AWS API errors.
- [ ] Graceful degradation — show last-known state if AWS is temporarily unreachable.

### 3.11 Global Navigation & Search

- [ ] Command palette (`Cmd+K` / `Ctrl+K`) for searching instances, volumes, snapshots, and playbooks.
- [ ] Type-ahead search with categorized results and keyboard navigation.
- [ ] Breadcrumb navigation below the Navbar (e.g., `Home > Instances > i-0abc123`).
- [ ] Active route highlighting in sidebar.
- [ ] Keyboard shortcuts (`R` = refresh, `N` = create new, `?` = show shortcut help).
- [ ] Functional Navbar search bar (currently renders but has no logic).

### 3.12 Notifications & Feedback

- [ ] Toast notifications with undo support for destructive actions (5-second grace period).
- [ ] Replace all `window.confirm()` calls with the existing `ConfirmationModal` component.
- [ ] Inline status chip transitions with animation (e.g., spinner while "stopping…").
- [ ] Contextual success/error messages for all API operations.

### 3.13 Onboarding & Adoption

- [ ] First-run setup wizard: AWS credentials, region selection, initial sync.
- [ ] Empty state illustrations with clear call-to-action on every list page ("No instances found — configure your AWS credentials to get started").
- [ ] Guided tour / tooltips for first-time users (highlight key features).
- [ ] In-app documentation links for common workflows (restore an instance, create a playbook).
- [ ] Quick-start guide accessible from the Dashboard.
- [ ] Health check endpoint that validates AWS credentials and DB connectivity.
- [ ] Clear error messaging when AWS credentials are missing or invalid (with link to settings).
- [ ] Sample seed data for playbooks to demonstrate capabilities.
- [ ] Contributor onboarding: `CONTRIBUTING.md`, `.env.example` with inline comments, `docker compose up` one-command setup.

---

## 4. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Page loads ≤ 200ms (reads from cache). SSE streaming with no dropped events. Background sync ≤ 5s per cycle. |
| **Security** | Passwords hashed (bcrypt). JWT httpOnly cookies. CSRF protection. Auth middleware on all non-public routes. OWASP Top 10 mitigations. No hardcoded secrets. |
| **Accessibility** | Semantic HTML, keyboard-navigable forms and tables, ARIA labels on interactive elements, WCAG 2.1 AA color contrast. |
| **Reliability** | Graceful degradation when AWS API is unavailable. Error boundaries prevent full-page crashes. Clear error messaging for all failure modes. |
| **Browser Support** | Latest Chrome, Firefox, Edge. |
| **Deployment** | Docker Compose-based. Multi-stage Dockerfile for production builds. PostgreSQL for persistence. |
| **Developer Experience** | One-command setup (`docker compose up`). CI pipeline (lint, type-check, test). Comprehensive `.env.example`. LLM context in `.llm/`. |

---

## 5. Out of Scope (Current Phase)

- Multi-cloud support (Azure, GCP).
- Mobile-native clients.
- Terraform / IaC integration.
- Cost estimation or billing dashboards.
- Multi-region AWS support (single region per deployment).
- Real-time WebSocket subscriptions (SSE is sufficient).
