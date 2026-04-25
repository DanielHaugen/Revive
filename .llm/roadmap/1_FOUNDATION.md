# 1 | Foundation — Revive Roadmap

Engineering bedrock: runtime bug fixes, security hardening, code architecture cleanup, and shared infrastructure. All work here is prerequisite to every other category. **Status: Complete.**

> For conventions and status guide, see [ROADMAP.md](ROADMAP.md).

---

## Phase 1.1 — Critical Fixes & Foundation Hardening *(Complete)*

Fix runtime bugs, security gaps, and structural anti-patterns that block all subsequent work. No new features — only correctness, safety, and developer ergonomics.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 1.1.1 | Centralize theming via CSS variables and Tailwind tokens | ✅ Done | `globals.css` `:root` + `tailwind.config.ts` semantic colors | Arch §5 |
| 1.1.2 | Create `.form-input` component class for all inputs | ✅ Done | Defined in `@layer components` | Arch §5 |
| 1.1.3 | Migrate all input/textarea/select elements to `.form-input` | ✅ Done | PlaybookForm, auth pages, modals, Navbar search, SearchableDropdown | Arch §5 |
| 1.1.4 | Dark-mode-aware modals (ConfirmationModal, LinkSnapshotsModal) | ✅ Done | | Arch §5 |
| 1.1.5 | Stepper dark-mode colors | ✅ Done | | Arch §5 |
| 1.1.6 | Fix DataTable hooks-in-map violation | ✅ Done | Removed dead Promise/hooks code from `.map()`. Removed `useEffect` import. Fixed hardcoded empty-state text. | Arch §12 P0 |
| 1.1.7 | Create `lib/services/aws.ts` — shared EC2Client singleton | ✅ Done | Replaced 7 duplicate instantiations across all API routes. Consistent region config. | Arch §12 P0 |
| 1.1.8 | Use shared Prisma singleton everywhere | ✅ Done | Added `globalThis` hot-reload guard. Replaced 4 local `new PrismaClient()` in playbook routes. | Arch §12 P0 |
| 1.1.9 | Add auth middleware (`middleware.ts`) | ✅ Done | JWT verification via `jose`. Protects all routes except auth pages. Redirects to login with `?redirect=`. | PRD §3.1, Arch §6 |
| 1.1.10 | Change restore endpoint from GET to POST | ✅ Done | Changed to POST. Updated client from EventSource to fetch with streaming ReadableStream. | Arch §7, §12 P1 |
| 1.1.11 | Remove hardcoded JWT fallback secret | ✅ Done | Fails fast if `JWT_SECRET` env var is missing. Added to `example.env`. | PRD §3.1, Arch §6 |
| 1.1.12 | JWT httpOnly cookie migration | ✅ Done | Already correct — login route sets httpOnly cookie. Verified. | PRD §3.1 |
| 1.1.13 | CSRF protection | ✅ Done | `sameSite: 'strict'` on auth cookie + all mutations use POST. Baseline CSRF protection in place. | PRD §3.1 |
| 1.1.14 | Session expiry + refresh token rotation | 🔲 Todo | 15-min access token + 7-day refresh token. Deferred to Phase 2. | PRD §3.1, Arch §6 |
| 1.1.15 | Remove orphaned `Instance` Prisma model | ✅ Done | Removed from `schema.prisma`. Migration pending. | Arch §3 |
| 1.1.16 | Normalize import aliases to `@/lib/` consistently | ✅ Done | Updated 11 imports across 6 files. Removed `@/ui/*` alias from `tsconfig.json`. | Arch §12 P2 |
| 1.1.17 | Remove ~15 stale `console.log` statements | ✅ Done | Removed 15 console.log statements across 11 files. | Arch §12 P2 |
| 1.1.18 | Fix `stopInstance()` copy-paste error message | ✅ Done | Fixed in client helper and playbook run route stop handler. | Arch §12 P1 |
| 1.1.19 | Implement logout (`POST /api/auth/logout` + client handler) | ✅ Done | API route clears httpOnly cookie. Sidebar uses POST handler + redirect. Added to middleware PUBLIC_PATHS. | PRD §3.1, Arch §6 |
| 1.1.20 | Fix playbook edit — broken API endpoint | ✅ Done | Edit page now PUTs to `/api/playbooks/[id]`. Added PUT handler with step delete+recreate. Fixed success message and redirect. | Arch §7 |
| 1.1.21 | Fix dashboard snapshot fetch (hardcoded empty) | ✅ Done | Uncommented `await snapshotRes.json()`. Dashboard now shows real snapshot data. | PRD §3.7 |
| 1.1.22 | Remove no-op filter buttons or wire to state | ✅ Done | Removed non-functional filter buttons from instances, volumes, and snapshots pages. Cleaned up unused Button and FaFilter imports. | Arch §9 |
| 1.1.23 | Fix "Configure Credentials" link on instances error banner | ✅ Done | Renamed to "Retry Connection" — accurately describes the retry behavior. | PRD §3.13 |

---

## Phase 1.2 — Architecture Refactoring *(Complete)*

Introduce the service layer, data fetching library, and structural improvements that make the codebase maintainable and testable. These are prerequisites for all feature work.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 1.2.1 | Create service layer (`lib/services/`) | ✅ Done | `instances.ts`, `volumes.ts`, `snapshots.ts`, `playbooks.ts`, `auth.ts`. All AWS SDK and Prisma calls extracted from route handlers. | Arch §1, §2, §7 |
| 1.2.2 | Consolidate 3 status-mapping utils into `lib/constants/status.ts` | ✅ Done | Replaced `instances/utils.ts`, `snapshots/utils.ts`, `volumes/utils.ts` with single shared module. | Arch §12 P1 |
| 1.2.3 | Move client-side API helpers from `(routes)/` to `lib/api/` | ✅ Done | `startInstance()`, `stopInstance()` moved to `lib/api/instances.ts`. | Arch §12 P1 |
| 1.2.4 | Adopt React Query (`@tanstack/react-query`) | ✅ Done | Installed. `QueryClientProvider` in `app/providers.tsx`, wrapped in root layout. 30s stale time. | Arch §8 |
| 1.2.5 | Create shared hooks: `useInstances`, `useVolumes`, `useSnapshots`, `usePlaybooks` | ✅ Done | `lib/hooks/` with per-resource hooks. Auto-refetch intervals on instances (5s) and detail views (10s). | Arch §8 |
| 1.2.6 | Replace `window.confirm()` with `ConfirmationModal` | ✅ Done | Playbooks and volumes pages now use `ConfirmationModal` with `deleteTarget` state. | PRD §3.12 |
| 1.2.7 | Standardize API response format | ✅ Done | All routes use `NextResponse.json()`. Removed raw `new Response()` from playbook routes. | Arch §7 |
| 1.2.8 | Add input validation to all API routes | ✅ Done | Installed Zod. `lib/validation/schemas.ts` + `helpers.ts`. All 13 mutation routes validated. | Arch §7 |
| 1.2.9 | Refactor thin route handlers (≤ 20 lines each) | ✅ Done | Auth login/register and playbook run extracted to service layer. All handlers ≤ ~20 lines (restore SSE excluded). | Arch §7 |
| 1.2.10 | Fix InfoSection empty `index.ts` | ✅ Done | Added barrel export. | Arch §12 |
