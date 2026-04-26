# 6 | Onboarding & Developer Experience — Revive Roadmap

First-run setup for new end users, contextual empty states, health checks for missing credentials, and contributor tooling for developers joining the project. **Status: Todo.**

> For conventions and status guide, see [ROADMAP.md](ROADMAP.md).

---

## Phase 6.1 — Onboarding & Adoption

Make the platform easy to adopt for new teams, new users, and new developers.

### For End Users

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 6.1.1 | First-run setup wizard | 🔲 Todo | Multi-step flow: enter AWS credentials → select region → trigger initial sync → confirmation. Appears when no cached resources exist. | PRD §3.13 |
| 6.1.2 | Empty state illustrations with contextual CTAs | 🔲 Todo | Every list page shows a helpful message + action when data is empty. e.g., "No playbooks yet — Create your first playbook." | PRD §3.13 |
| 6.1.3 | Health check endpoint (`/api/health`) | 🔲 Todo | Validates AWS credentials, DB connectivity, sync status. Used by setup wizard and status banner. | PRD §3.13 |
| 6.1.4 | Clear error messaging for missing/invalid AWS credentials | 🔲 Todo | Specific error banner with link to settings page. Not a generic "fetch failed." | PRD §3.13 |
| 6.1.5 | Guided tour / feature tooltips for first-time users | 🔲 Todo | Lightweight walkthrough highlighting sidebar sections, playbook creation, and resource management. | PRD §3.13 |
| 6.1.6 | In-app documentation / knowledge base viewer | ✅ Done | `/docs` and `/docs/[...slug]` pages. Reads markdown files from `docs/` at build time. Rendered with `react-markdown` + `remark-gfm` + `rehype-highlight`. `@tailwindcss/typography` for prose styling. Sidebar nav auto-generated from file tree. | PRD §3.13 |
| 6.1.7 | Quick-start guide accessible from Dashboard | 🔲 Todo | Card on dashboard for new users: "Getting Started with Revive" with 3-4 guided steps. | PRD §3.13 |
| 6.1.8 | Sample seed playbooks | 🔲 Todo | Pre-built playbook templates demonstrating start/stop/restore workflows. Loaded via `prisma/seed.ts`. | PRD §3.13 |

### For Developers / Contributors

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 6.1.9 | `CONTRIBUTING.md` | 🔲 Todo | Repo conventions, branch strategy, PR process, dev environment setup. | PRD §3.13 |
| 6.1.10 | Annotated `.env.example` with inline comments | 🔲 Todo | Every variable explained. Which are required vs optional. | PRD §3.13, §4 |
| 6.1.11 | One-command dev setup validation | 🔲 Todo | `docker compose up` starts everything. Add healthcheck to compose services. | PRD §3.13, §4 |
| 6.1.12 | Architecture docs in `.llm/` kept current | 🔲 Todo | Update ARCHITECTURE.md and ROADMAP.md as each phase completes. | — |

---

## Phase 6.2 — Developer Tooling & Code Quality

Harden the codebase for contributors: consistent tooling, type safety, error handling, logging, documentation, and Docker ergonomics. Findings sourced from a codebase DX audit (37 issues across 12 categories).

### Tooling & Code Standards

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 6.2.1 | Add Husky + lint-staged pre-commit hooks | 🔲 Todo | Run `next lint --fix` + `prettier --write` on staged `.ts/.tsx` files before commit. Prevents bad code from landing. | Audit §12 |
| 6.2.2 | Add `.editorconfig` | 🔲 Todo | Enforce consistent indentation (2 spaces), charset (UTF-8), line endings (LF), trailing whitespace trimming across all editors. | Audit §12 |
| 6.2.3 | Add `.nvmrc` pinned to Node 18 | 🔲 Todo | Prevents version mismatch between developers and CI. Single-file change. | Audit §12 |
| 6.2.4 | Add missing `package.json` scripts | 🔲 Todo | Add: `type-check` (`tsc --noEmit`), `lint:fix` (`next lint --fix`), `format` (`prettier --write .`), `migrate` (`prisma migrate dev`), `migrate:prod` (`prisma migrate deploy`), `seed` (alias for `ts-node prisma/seed.ts`), `clean` (remove `.next/`). | Audit §2 |
| 6.2.5 | Enable stricter TypeScript compiler flags | 🔲 Todo | Add to `tsconfig.json`: `noUncheckedIndexedAccess`, `noImplicitReturns`, `exactOptionalPropertyTypes`. Fixes latent runtime bugs at compile time. | Audit §3 |

### Error Handling

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 6.2.6 | Centralized API error handler utility | 🔲 Todo | Create `lib/utils/errors.ts` with `ApiError` class and `apiHandler()` wrapper. All API routes wrap their handler. Eliminates repeated try/catch and inconsistent status codes. | Audit §5 |
| 6.2.7 | Standardize API error response shape | 🔲 Todo | All error responses use `{ error: string, detail?: unknown }`. Currently some use `{ message }`, some use `{ error }`. Audit and normalize. | Audit §5 |
| 6.2.8 | Return correct HTTP status codes | 🔲 Todo | Audit all POST routes to return 201 on create. Return 422 for validation failures, 404 for not-found, 409 for conflicts. | Audit §5 |

### Type Safety

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 6.2.9 | Remove unsafe casts in `lib/services/cache.ts` | 🔲 Todo | Five instances of `as unknown as Instance\|Volume\|Snapshot`. Replace with Zod runtime validation schemas so cache corruption is caught instead of silently trusted. | Audit §7 |
| 6.2.10 | Create `lib/types/` folder with domain-typed modules | 🔲 Todo | Split out: `auth.ts`, `cache.ts`, `sync.ts`, `api.ts`, `index.ts`. Move `StepWithTargets`/`PlaybookWithDetails` from `lib/types.d.ts` into appropriate files. | Audit §6 |
| 6.2.11 | Add API response type annotations | 🔲 Todo | Define typed response shapes for each API route (e.g., `AuditLogsResponse`, `SyncStatusResponse`). Used by client hooks to eliminate implicit `any`. | Audit §7 |
| 6.2.12 | Add `getErrorMessage()` helper for catch blocks | 🔲 Todo | `catch (error)` → `error.message` is unsafe when `error` is `unknown`. Centralize narrowing in `lib/utils/errors.ts`. | Audit §7 |

### Logging

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 6.2.13 | Logger abstraction (`lib/utils/logger.ts`) | 🔲 Todo | Thin wrapper around `console.*` that formats structured JSON in production (`{ level, msg, error, stack, ...context }`). Makes switching to Datadog/Sentry later a one-file change. | Audit §9 |
| 6.2.14 | Add request context to API error logs | 🔲 Todo | Log method, route, and user ID alongside errors. Currently bare `console.error('Error fetching EC2 instances:', error)` with no context. | Audit §9 |

### Prisma & Database

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 6.2.15 | Add `/// @doc()` comments to Prisma schema models | 🔲 Todo | All models and key fields documented inline in `prisma/schema.prisma`. Generates richer Prisma Studio UI and aids contributors. | Audit §4 |
| 6.2.16 | Complete `prisma/README.md` | 🔲 Todo | Currently cuts off mid-instruction. Add: migration workflow, seeding steps, rollback procedures, troubleshooting, Prisma Studio usage. | Audit §4 |
| 6.2.17 | Improve seed data for new contributors | 🔲 Todo | Remove PCDC-specific hardcoded AWS IDs from `prisma/seed.ts`. Create generic playbooks that work without real AWS resources. Add env-driven opt-in for real resource IDs (`SEED_INSTANCE_ID`, `SEED_SNAPSHOT_ID`). | Audit §11 |
| 6.2.18 | Add migration history summary doc | 🔲 Todo | Short `prisma/migrations/CHANGELOG.md` summarizing what each migration changed. Helps contributors understand schema evolution at a glance. | Audit §4 |

### Code Organization

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 6.2.19 | Add barrel exports (`index.ts`) to `lib/hooks/` and `lib/services/` | 🔲 Todo | Allows `import { useInstances, usePlaybooks } from '@/lib/hooks'` instead of per-file imports. One-time setup, zero runtime impact. | Audit §6 |
| 6.2.20 | Normalize service function naming conventions | 🔲 Todo | Audit `lib/services/` for verb consistency: `listX` for queries, `createX`/`updateX`/`deleteX` for mutations. Currently mixed (`getPlaybook` vs `listPlaybooks`). | Audit §6 |

### Documentation

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 6.2.21 | Overhaul `README.md` | 🔲 Todo | Replace outdated structure refs (`components/`, `pages/`). Add: Quick Start (local + Docker), Architecture diagram, full env var table, script reference, troubleshooting guide, API reference overview. | Audit §8 |
| 6.2.22 | Add `/api/health` endpoint | 🔲 Todo | (Also in 6.1.3) Returns DB connectivity, AWS credential validity, and sync status. Should be called by Docker healthcheck. | Audit §10 |

### Docker

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 6.2.23 | Multi-stage Dockerfile for production | 🔲 Todo | Stage 1: build. Stage 2: runtime-only copy. Reduces final image from ~900MB to ~300MB. Use `npm ci` not `npm install` for reproducible installs. | Audit §10 |
| 6.2.24 | Add `.dockerignore` | 🔲 Todo | Exclude `node_modules`, `.next`, `.git`, `.env`, `coverage`, `*.log` from build context. Currently missing entirely. | Audit §10 |
| 6.2.25 | Docker Compose service healthchecks | 🔲 Todo | (Overlaps 6.1.11) `postgres` healthcheck: `pg_isready`. `nextjs_app` healthcheck: HTTP GET `/api/health`. Use `depends_on: { condition: service_healthy }` to prevent boot-time race. | Audit §1 |
| 6.2.26 | Fix volume mount to exclude `node_modules` | 🔲 Todo | Current compose mounts `.:/app` which overwrites container `node_modules`. Add named exclusion volume `/app/node_modules` to compose to prevent host/container collision. | Audit §10 |
