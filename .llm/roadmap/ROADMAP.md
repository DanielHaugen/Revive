# Roadmap — Revive

Phased delivery plan with ordered tasks. Phases are sequential; tasks within a phase are ordered by dependency and priority. Each task references the PRD section or architecture section that motivates it.

---

## Phase 1 — Critical Fixes & Foundation Hardening *(Complete)*

Fix runtime bugs, security gaps, and structural anti-patterns that block all subsequent work. No new features — only correctness, safety, and developer ergonomics.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 1.1 | Centralize theming via CSS variables and Tailwind tokens | ✅ Done | `globals.css` `:root` + `tailwind.config.ts` semantic colors | Arch §5 |
| 1.2 | Create `.form-input` component class for all inputs | ✅ Done | Defined in `@layer components` | Arch §5 |
| 1.3 | Migrate all input/textarea/select elements to `.form-input` | ✅ Done | PlaybookForm, auth pages, modals, Navbar search, SearchableDropdown | Arch §5 |
| 1.4 | Dark-mode-aware modals (ConfirmationModal, LinkSnapshotsModal) | ✅ Done | | Arch §5 |
| 1.5 | Stepper dark-mode colors | ✅ Done | | Arch §5 |
| 1.6 | Fix DataTable hooks-in-map violation | ✅ Done | Removed dead Promise/hooks code from `.map()`. Removed `useEffect` import. Fixed hardcoded empty-state text. | Arch §12 P0 |
| 1.7 | Create `lib/services/aws.ts` — shared EC2Client singleton | ✅ Done | Replaced 7 duplicate instantiations across all API routes. Consistent region config. | Arch §12 P0 |
| 1.8 | Use shared Prisma singleton everywhere | ✅ Done | Added `globalThis` hot-reload guard. Replaced 4 local `new PrismaClient()` in playbook routes. | Arch §12 P0 |
| 1.9 | Add auth middleware (`middleware.ts`) | ✅ Done | JWT verification via `jose`. Protects all routes except auth pages. Redirects to login with `?redirect=`. | PRD §3.1, Arch §6 |
| 1.10 | Change restore endpoint from GET to POST | ✅ Done | Changed to POST. Updated client from EventSource to fetch with streaming ReadableStream. | Arch §7, §12 P1 |
| 1.11 | Remove hardcoded JWT fallback secret | ✅ Done | Fails fast if `JWT_SECRET` env var is missing. Added to `example.env`. | PRD §3.1, Arch §6 |
| 1.12 | JWT httpOnly cookie migration | ✅ Done | Already correct — login route sets httpOnly cookie. Verified. | PRD §3.1 |
| 1.13 | CSRF protection | ✅ Done | `sameSite: 'strict'` on auth cookie + all mutations use POST. Baseline CSRF protection in place. | PRD §3.1 |
| 1.14 | Session expiry + refresh token rotation | 🔲 Todo | 15-min access token + 7-day refresh token. Deferred to Phase 2. | PRD §3.1, Arch §6 |
| 1.15 | Remove orphaned `Instance` Prisma model | ✅ Done | Removed from `schema.prisma`. Migration pending. | Arch §3 |
| 1.16 | Normalize import aliases to `@/lib/` consistently | ✅ Done | Updated 11 imports across 6 files. Removed `@/ui/*` alias from `tsconfig.json`. | Arch §12 P2 |
| 1.17 | Remove ~15 stale `console.log` statements | ✅ Done | Removed 15 console.log statements across 11 files. | Arch §12 P2 |
| 1.18 | Fix `stopInstance()` copy-paste error message | ✅ Done | Fixed in client helper and playbook run route stop handler. | Arch §12 P1 |
| 1.19 | Implement logout (`POST /api/auth/logout` + client handler) | ✅ Done | API route clears httpOnly cookie. Sidebar uses POST handler + redirect. Added to middleware PUBLIC_PATHS. | PRD §3.1, Arch §6 |
| 1.20 | Fix playbook edit — broken API endpoint | ✅ Done | Edit page now PUTs to `/api/playbooks/[id]`. Added PUT handler with step delete+recreate. Fixed success message and redirect. | Arch §7 |
| 1.21 | Fix dashboard snapshot fetch (hardcoded empty) | ✅ Done | Uncommented `await snapshotRes.json()`. Dashboard now shows real snapshot data. | PRD §3.7 |
| 1.22 | Remove no-op filter buttons or wire to state | ✅ Done | Removed non-functional filter buttons from instances, volumes, and snapshots pages. Cleaned up unused Button and FaFilter imports. | Arch §9 |
| 1.23 | Fix "Configure Credentials" link on instances error banner | ✅ Done | Renamed to "Retry Connection" — accurately describes the retry behavior. | PRD §3.13 |

---

## Phase 2 — Architecture Refactoring *(Complete)*

Introduce the service layer, data fetching library, and structural improvements that make the codebase maintainable and testable. These are prerequisites for all feature work.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 2.1 | Create service layer (`lib/services/`) | ✅ Done | `instances.ts`, `volumes.ts`, `snapshots.ts`, `playbooks.ts`, `auth.ts`. All AWS SDK and Prisma calls extracted from route handlers. | Arch §1, §2, §7 |
| 2.2 | Consolidate 3 status-mapping utils into `lib/constants/status.ts` | ✅ Done | Replaced `instances/utils.ts`, `snapshots/utils.ts`, `volumes/utils.ts` with single shared module. | Arch §12 P1 |
| 2.3 | Move client-side API helpers from `(routes)/` to `lib/api/` | ✅ Done | `startInstance()`, `stopInstance()` moved to `lib/api/instances.ts`. | Arch §12 P1 |
| 2.4 | Adopt React Query (`@tanstack/react-query`) | ✅ Done | Installed. `QueryClientProvider` in `app/providers.tsx`, wrapped in root layout. 30s stale time. | Arch §8 |
| 2.5 | Create shared hooks: `useInstances`, `useVolumes`, `useSnapshots`, `usePlaybooks` | ✅ Done | `lib/hooks/` with per-resource hooks. Auto-refetch intervals on instances (5s) and detail views (10s). | Arch §8 |
| 2.6 | Replace `window.confirm()` with `ConfirmationModal` | ✅ Done | Playbooks and volumes pages now use `ConfirmationModal` with `deleteTarget` state. | PRD §3.12 |
| 2.7 | Standardize API response format | ✅ Done | All routes use `NextResponse.json()`. Removed raw `new Response()` from playbook routes. | Arch §7 |
| 2.8 | Add input validation to all API routes | ✅ Done | Installed Zod. `lib/validation/schemas.ts` + `helpers.ts`. All 13 mutation routes validated. | Arch §7 |
| 2.9 | Refactor thin route handlers (≤ 20 lines each) | ✅ Done | Auth login/register and playbook run extracted to service layer. All handlers ≤ ~20 lines (restore SSE excluded). | Arch §7 |
| 2.10 | Fix InfoSection empty `index.ts` | ✅ Done | Added barrel export. | Arch §12 |

---

## Phase 3 — UX & Feedback Layer

Build the visual feedback infrastructure that all feature pages depend on. Skeleton loaders, empty states, error banners, and navigation improvements.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 3.1 | Create `Skeleton` component (table rows, cards, detail panels) | ✅ Done | `TableSkeleton`, `DetailSkeleton`, base `Skeleton` in `lib/ui/feedback/Skeleton.tsx`. Wired into all pages. | PRD §3.12, Arch §9 |
| 3.2 | Create `EmptyState` component with illustration + CTA | ✅ Done | `lib/ui/feedback/EmptyState.tsx` — icon, title, description, action slot. | PRD §3.13, Arch §9 |
| 3.3 | Create `ErrorBanner` component | ✅ Done | `lib/ui/feedback/ErrorBanner.tsx` — title, message, optional retry. Replaces inline error markup on instances, volumes, snapshots pages. | PRD §3.12 |
| 3.4 | Create `Spinner` component | ✅ Done | `lib/ui/feedback/Spinner.tsx` — sm/md/lg sizes, accessible `role="status"`. Used on dashboard loading. | Arch §9 |
| 3.5 | Active sidebar route highlighting | ✅ Done | `usePathname()` + `isActive()` helper. Active link gets `bg-blue-600/20 text-blue-400`. | PRD §3.11, Arch §9 |
| 3.6 | Breadcrumb navigation component | ✅ Done | `lib/ui/navigation/Breadcrumbs.tsx` — auto-generated from route segments, added to root layout. Hidden on home page. | PRD §3.11, Arch §9 |
| 3.7 | Toast notifications with undo support | 🔲 Todo | Destructive actions show "Undo" for 5-second grace period. | PRD §3.12, Arch §9 |
| 3.8 | Inline status chip transition animations | 🔲 Todo | Spinner inside chip while "stopping…", then update to "stopped". | PRD §3.12, Arch §9 |
| 3.9 | Responsive DataTable → card layout on small viewports | 🔲 Todo | | Arch §9 |
| 3.10 | Error boundary and custom 404 page | ✅ Done | `app/error.tsx` (client error boundary with reset) + `app/not-found.tsx` (friendly 404). | PRD §4 |
| 3.11 | Migrate pages to React Query hooks | ✅ Done | All 8 pages migrated to shared hooks. Removed manual `setInterval`, `useState+useEffect+fetch`. Mutations use `invalidateQueries`. | Arch §8 |

---

## Phase 4 — Background Sync & Real-Time Data

Implement background AWS synchronization. This phase transforms the platform from "fetch on every page load" to "instant reads from local cache."

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 4.1 | Add `CachedInstance`, `CachedVolume`, `CachedSnapshot` Prisma models | 🔲 Todo | Store AWS resource state locally. `syncedAt` timestamp on each record. | Arch §3, §4 |
| 4.2 | Implement sync worker (`lib/services/sync.ts`) | 🔲 Todo | Server-side recurring job. Calls Describe APIs, upserts into cache tables. Configurable interval (default 30s). | PRD §3.10, Arch §4 |
| 4.3 | Migrate read API routes to serve from cache tables | 🔲 Todo | `GET /api/instances` reads from `CachedInstance` instead of calling AWS directly. | PRD §3.10 |
| 4.4 | Trigger immediate cache refresh after mutations | 🔲 Todo | Start/stop/create/delete calls AWS, then refreshes the relevant cache table. | PRD §3.10 |
| 4.5 | "Last synced: Xs ago" indicator in Navbar | 🔲 Todo | Shows cache freshness. Updates in real time. | PRD §3.10, Arch §9 |
| 4.6 | Make Navbar refresh button trigger on-demand sync | 🔲 Todo | Currently non-functional (`onClick` is a no-op). | PRD §3.10 |
| 4.7 | Sync health monitoring and error surfacing | 🔲 Todo | Detect AWS API errors during sync. Show banner in UI if sync is failing. | PRD §3.10 |
| 4.8 | Graceful degradation — show stale data when AWS is unreachable | 🔲 Todo | Display cached data with a "data may be outdated" warning. | PRD §3.10, §4 |

---

## Phase 5 — Feature Completion: Core Resources

Fill out remaining CRUD operations now that the data layer and UX infrastructure are solid.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 5.1 | Instance reboot API route + UI button | 🔲 Todo | | PRD §3.2 |
| 5.2 | Instance tag editing from UI | 🔲 Todo | Inline tag editor on detail view. | PRD §3.2 |
| 5.3 | Instance filtering and search (name, ID, status, tag) | 🔲 Todo | Filter bar above DataTable. Combine with React Query query params. | PRD §3.2 |
| 5.4 | Batch operations: checkbox selection + bulk start/stop/reboot | 🔲 Todo | Toolbar appears when rows are selected. | PRD §3.2, Arch §9 |
| 5.5 | Instance detail slide-over panel | 🔲 Todo | Click row to open right-panel without navigating away from list. | PRD §3.2, Arch §9 |
| 5.6 | Security group and network info on instance detail | 🔲 Todo | | PRD §3.2 |
| 5.7 | Copy instance ID / IP to clipboard | 🔲 Todo | Icon button using existing `Copy` component. | PRD §3.2 |
| 5.8 | Create EBS volume (API + form) | 🔲 Todo | Size, type, AZ selection. | PRD §3.3 |
| 5.9 | Attach/detach volume to/from instance | 🔲 Todo | | PRD §3.3 |
| 5.10 | Volume and snapshot filtering and search | 🔲 Todo | Reuse filter bar pattern from 5.3. | PRD §3.3, §3.4 |
| 5.11 | Create snapshot from volume | 🔲 Todo | | PRD §3.4 |
| 5.12 | Delete snapshot with confirmation | 🔲 Todo | | PRD §3.4 |
| 5.13 | Restoration history table | 🔲 Todo | Placeholder card exists. Pull from `AuditLog` or `PlaybookRun` table. | PRD §3.5 |
| 5.14 | Restoration confirmation dialog with impact summary | 🔲 Todo | | PRD §3.5 |
| 5.15 | Restoration progress as multi-step visual timeline | 🔲 Todo | Replace raw SSE text with step-by-step visual indicators. | PRD §3.5 |

---

## Phase 6 — Orchestration Enhancements

Make playbooks more powerful, observable, and production-grade.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 6.1 | Instance selection widget in playbook step form | 🔲 Todo | Searchable multi-select dropdown populated from cached instances. Replace raw text input. | PRD §3.6 |
| 6.2 | Step-level execution status with live progress | 🔲 Todo | SSE stream per step during playbook run. Visual progress indicators. | PRD §3.6 |
| 6.3 | Playbook run history and execution logs | 🔲 Todo | `PlaybookRun` + `StepResult` tables. Detail view per run. | PRD §3.6, Arch §3 |
| 6.4 | Failure handling per step (retry count, skip, abort policies) | 🔲 Todo | Configurable per step in the form. | PRD §3.6 |
| 6.5 | Playbook versioning / change history | 🔲 Todo | | PRD §3.6 |
| 6.6 | Playbook duplication (clone) | 🔲 Todo | "Duplicate" button on playbook list and detail. | PRD §3.6 |
| 6.7 | Dry-run mode | 🔲 Todo | Validate targets exist and are in correct state without executing. | PRD §3.6 |
| 6.8 | Explicit step ordering (`order` field on Step model) | 🔲 Todo | Currently relies on array index. Drag-to-reorder in UI. | Arch §3 |

---

## Phase 7 — Observability & Administration

Audit logging, user management, dashboard health, and admin tooling.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 7.1 | `AuditLog` Prisma model + migration | 🔲 Todo | | PRD §3.8, Arch §3 |
| 7.2 | Service layer audit logging (auto-log every mutation) | 🔲 Todo | Write `AuditLog` entry in every service method that mutates state. | PRD §3.8 |
| 7.3 | Audit log API routes (list, filter, paginate) | 🔲 Todo | | PRD §3.8 |
| 7.4 | Audit log page with filterable DataTable | 🔲 Todo | Sidebar link already exists. | PRD §3.8 |
| 7.5 | Audit log CSV export | 🔲 Todo | | PRD §3.8 |
| 7.6 | User profile page (view & edit) | 🔲 Todo | Sidebar link already exists. | PRD §3.9 |
| 7.7 | Password change flow | 🔲 Todo | Verify current password before allowing change. | PRD §3.9 |
| 7.8 | Role-based access control (Admin / Operator) | 🔲 Todo | `User.role` enum. Enforce in service layer + hide admin UI for operators. | PRD §3.1, Arch §6 |
| 7.9 | User management page (Admin only) | 🔲 Todo | List users, change roles, deactivate accounts. | PRD §3.9 |
| 7.10 | Dashboard: resource health indicators | 🔲 Todo | Running/stopped/error counts per resource type. | PRD §3.7 |
| 7.11 | Dashboard: recent activity feed | 🔲 Todo | Pull from `AuditLog`. Last 10 actions. | PRD §3.7 |
| 7.12 | Dashboard: quick-action cards | 🔲 Todo | Start/stop most-used instances, run starred playbooks — one-click. | PRD §3.7 |
| 7.13 | Dashboard: system status banner | 🔲 Todo | AWS connectivity, sync health, last sync time. | PRD §3.7 |
| 7.14 | Settings page (`/settings`) | 🔲 Todo | Sidebar links to `/settings` but no page exists (404). Root settings page with navigation to sub-sections (profile, credentials, preferences). | PRD §3.9 |
| 7.15 | AWS credentials configuration page | 🔲 Todo | UI for managing AWS access keys and default region. Currently only configurable via env vars. | PRD §3.9, §3.13 |

---

## Phase 8 — Onboarding & Adoption

Make the platform easy to adopt for new teams, new users, and new developers.

### For End Users

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 8.1 | First-run setup wizard | 🔲 Todo | Multi-step flow: enter AWS credentials → select region → trigger initial sync → confirmation. Appears when no cached resources exist. | PRD §3.13 |
| 8.2 | Empty state illustrations with contextual CTAs | 🔲 Todo | Every list page shows a helpful message + action when data is empty. e.g., "No playbooks yet — Create your first playbook." | PRD §3.13 |
| 8.3 | Health check endpoint (`/api/health`) | 🔲 Todo | Validates AWS credentials, DB connectivity, sync status. Used by setup wizard and status banner. | PRD §3.13 |
| 8.4 | Clear error messaging for missing/invalid AWS credentials | 🔲 Todo | Specific error banner with link to settings page. Not a generic "fetch failed." | PRD §3.13 |
| 8.5 | Guided tour / feature tooltips for first-time users | 🔲 Todo | Lightweight walkthrough highlighting sidebar sections, playbook creation, and resource management. | PRD §3.13 |
| 8.6 | In-app documentation links for common workflows | 🔲 Todo | "How to restore an instance" help links on restoration page, etc. | PRD §3.13 |
| 8.7 | Quick-start guide accessible from Dashboard | 🔲 Todo | Card on dashboard for new users: "Getting Started with Revive" with 3-4 guided steps. | PRD §3.13 |
| 8.8 | Sample seed playbooks | 🔲 Todo | Pre-built playbook templates demonstrating start/stop/restore workflows. Loaded via `prisma/seed.ts`. | PRD §3.13 |

### For Developers / Contributors

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 8.9 | `CONTRIBUTING.md` | 🔲 Todo | Repo conventions, branch strategy, PR process, dev environment setup. | PRD §3.13 |
| 8.10 | Annotated `.env.example` with inline comments | 🔲 Todo | Every variable explained. Which are required vs optional. | PRD §3.13, §4 |
| 8.11 | One-command dev setup validation | 🔲 Todo | `docker compose up` starts everything. Add healthcheck to compose services. | PRD §3.13, §4 |
| 8.12 | Architecture docs in `.llm/` kept current | 🔲 Todo | Update ARCHITECTURE.md and ROADMAP.md as each phase completes. | — |

---

## Phase 9 — Global Navigation & Power User Features

Command palette, keyboard shortcuts, and advanced navigation for power users.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 9.1 | Command palette (`Cmd+K` / `Ctrl+K`) | 🔲 Todo | Search instances, volumes, snapshots, playbooks. Type-ahead, categorized results, keyboard nav. | PRD §3.11, Arch §9 |
| 9.2 | Functional Navbar search bar | 🔲 Todo | Currently renders but has no state or `onChange`. Wire to command palette or standalone search. | PRD §3.11 |
| 9.3 | Keyboard shortcuts | 🔲 Todo | `R` = refresh, `N` = create new, `?` = show shortcut help overlay. | PRD §3.11, Arch §9 |
| 9.4 | Detail slide-over panels for all resource types | 🔲 Todo | Click row → right-panel slides in with full detail. Stay on list page. | Arch §9 |
| 9.5 | Row-level contextual action menus | 🔲 Todo | Three-dot menu or right-click on table rows. Replaces separate action columns. | Arch §9 |

---

## Phase 10 — Production Readiness & Quality

Final polish, testing, CI/CD, and deployment hardening.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 10.1 | Forgot-password backend (email integration) | 🔲 Todo | UI exists. Need SMTP/SES integration. | PRD §3.1 |
| 10.2 | Accessibility audit (keyboard nav, ARIA, WCAG 2.1 AA contrast) | 🔲 Todo | | PRD §4 |
| 10.3 | Multi-stage Dockerfile for production builds | 🔲 Todo | Current Dockerfile runs `npm run dev`. Need `npm run build` + `npm start`. | Arch §11 |
| 10.4 | `.dockerignore` file | ✅ Done | Created in Phase 1. Excludes `node_modules`, `.next`, `.env*`, logs. | Arch §11 |
| 10.5 | Docker Compose production config | 🔲 Todo | Separate prod override with env var profiles. | PRD §4, Arch §11 |
| 10.6 | Security headers in `next.config.mjs` | 🔲 Todo | CSP, X-Frame-Options, X-Content-Type-Options, etc. | PRD §4 |
| 10.7 | CI pipeline (lint, type-check, test on PR) | 🔲 Todo | GitHub Actions or similar. | PRD §4 |
| 10.8 | Unit tests for service layer | 🔲 Todo | No test framework exists yet. Add Vitest. | PRD §4 |
| 10.9 | End-to-end tests for critical flows | 🔲 Todo | Playwright for login → instance list → start/stop → playbook run. | PRD §4 |
| 10.10 | Update Node.js to latest LTS (20+) | 🔲 Todo | Currently on Node 18. | Arch §11 |

---

## Conventions

- Update task status as work is completed: `🔲 Todo` → `🔨 In Progress` → `✅ Done`
- Add new tasks at the end of the relevant phase.
- If a phase is fully complete, note the completion date in the phase heading.
- Every task should have a `Ref` linking to the PRD section or Architecture section that motivates it.
- Phases 1-2 are blockers for all subsequent phases. Phases 3+ can overlap where dependencies allow.
