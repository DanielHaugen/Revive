# Architecture — Revive

System design, directory structure, data flow, key technical decisions, and refactoring strategy.

---

## 1. High-Level Architecture

### Current

```
┌──────────────────────────────────────────────────────────┐
│                        Browser                           │
│  Next.js App (React)  ──  Tailwind CSS  ──  React Icons  │
└──────────────┬───────────────────────────────────────────┘
               │  HTTP / SSE
               ▼
┌──────────────────────────────────────────────────────────┐
│                   Next.js API Routes                     │
│  /api/auth/*    /api/instances/*   /api/playbooks/*      │
│  /api/snapshots/*   /api/volumes/*                       │
└────┬──────────────────┬──────────────────────────────────┘
     │                  │
     ▼                  ▼
┌──────────┐    ┌──────────────┐
│ Prisma   │    │  AWS SDK v3  │
│ (PostgreSQL)  │  (EC2, EBS)  │
└──────────┘    └──────────────┘
```

### Target

```
┌──────────────────────────────────────────────────────────────────────┐
│                             Browser                                  │
│  Next.js App (React)  ──  React Query  ──  Tailwind  ──  React Icons │
└──────────────┬───────────────────────────────────────────────────────┘
               │  HTTP / SSE
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  Next.js Middleware (auth gate)                       │
└──────────────┬───────────────────────────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────────────────┐
│                   Next.js API Routes                                  │
│  Auth  ·  Instances  ·  Volumes  ·  Snapshots  ·  Playbooks  · Sync  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────┐              │
│  │  Service Layer  (lib/services/)                     │              │
│  │  aws.ts · instances.ts · volumes.ts · snapshots.ts  │              │
│  │  playbooks.ts · auth.ts                             │              │
│  └─────────┬────────────────────────┬──────────────────┘              │
│            │                        │                                 │
│            ▼                        ▼                                 │
│      ┌──────────┐            ┌──────────────┐                        │
│      │ Prisma   │            │  AWS SDK v3  │                        │
│      │ (PostgreSQL)          │  (EC2, EBS)  │                        │
│      │          │            │  singleton   │                        │
│      └──────────┘            └──────────────┘                        │
└──────────────────────────────────────────────────────────────────────┘

Background Sync Worker (cron / setInterval on server start)
  └──▶ Polls AWS APIs on a schedule
  └──▶ Upserts instance/volume/snapshot state into Prisma cache tables
  └──▶ Frontend reads from cache → instant page loads, no direct AWS latency
```

- **Frontend** — Next.js App Router. React Query for data fetching, caching, and background refetch. Skeleton loaders and optimistic UI.
- **Backend** — Next.js Route Handlers behind auth middleware. Thin routes that delegate to a service layer.
- **Service Layer** — `lib/services/` encapsulates all AWS SDK and Prisma calls. Single source of truth for business logic.
- **Database** — PostgreSQL via Prisma. Stores users, playbooks, audit logs, and **cached AWS resource state** from background sync.
- **Cloud** — AWS SDK v3 singleton client (`lib/services/aws.ts`). Never instantiated in route handlers.
- **Background Sync** — Server-side recurring job that polls AWS and upserts into Prisma cache tables. Eliminates per-request AWS latency for read operations.
- **Realtime** — SSE for long-running operations (restoration, playbook execution).

---

## 2. Directory Layout

### Current

```
revive/
├── app/
│   ├── globals.css              # CSS variables (:root tokens) + Tailwind layers
│   ├── layout.tsx               # Root layout: Navbar + Sidebar + ToastContainer
│   ├── page.tsx                 # Dashboard (home)
│   ├── (routes)/                # Page routes (grouped, no URL segment)
│   │   ├── auth/                # Login, register, forgot-password
│   │   ├── instances/           # EC2 instance list + detail
│   │   ├── playbooks/           # Playbook list, detail, new, edit
│   │   ├── restoration/         # Instance restoration wizard
│   │   ├── snapshots/           # Snapshot list + detail
│   │   └── volumes/             # Volume list
│   └── api/                     # API route handlers
├── lib/
│   ├── prisma.ts                # Singleton Prisma client
│   ├── types.d.ts               # Shared TypeScript types
│   ├── forms/                   # Multi-step form components
│   ├── ui/                      # Reusable UI components
│   └── utils/
├── prisma/
├── docs/
└── .llm/
```

### Target

```
revive/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                 # Dashboard
│   ├── (routes)/
│   │   ├── auth/
│   │   ├── instances/
│   │   ├── playbooks/
│   │   ├── restoration/
│   │   ├── snapshots/
│   │   └── volumes/
│   └── api/
│       ├── _middleware.ts       # ← NEW: auth + error handling middleware
│       ├── auth/
│       ├── instances/
│       ├── playbooks/
│       ├── snapshots/
│       └── volumes/
├── lib/
│   ├── prisma.ts                # Singleton (with globalThis hot-reload guard)
│   ├── types.d.ts
│   ├── constants/               # ← NEW: shared enums, status maps
│   │   └── status.ts            # StatusChipVariant maps for all resource types
│   ├── hooks/                   # ← NEW: shared React hooks
│   │   ├── useResource.ts       # Generic data fetching hook (wraps React Query)
│   │   ├── usePolling.ts        # Configurable polling hook
│   │   └── useConfirmation.ts   # Replaces window.confirm() with modal
│   ├── services/                # ← NEW: server-side business logic
│   │   ├── aws.ts               # Shared EC2Client singleton
│   │   ├── instances.ts         # Instance CRUD operations
│   │   ├── volumes.ts           # Volume CRUD operations
│   │   ├── snapshots.ts         # Snapshot CRUD operations
│   │   ├── playbooks.ts         # Playbook CRUD operations
│   │   ├── sync.ts              # Background AWS sync worker
│   │   └── auth.ts              # JWT creation, validation, password hashing
│   ├── forms/
│   ├── ui/
│   │   ├── buttons/Button.tsx
│   │   ├── card/Card.tsx
│   │   ├── chips/StatusChips.tsx
│   │   ├── feedback/            # ← NEW
│   │   │   ├── Skeleton.tsx     # Reusable skeleton loader
│   │   │   ├── EmptyState.tsx   # "No data" with illustration
│   │   │   ├── ErrorBanner.tsx  # Consistent error display
│   │   │   └── Spinner.tsx
│   │   ├── icons/
│   │   ├── info/InfoSection/
│   │   ├── inputs/
│   │   │   ├── SearchableDropdown.tsx
│   │   │   └── SearchBar.tsx    # ← NEW: global search with command palette
│   │   ├── modals/
│   │   ├── navigation/
│   │   ├── stepper/
│   │   └── tables/
│   │       ├── DataTable.tsx    # Fixed hooks-in-map bug
│   │       └── TableSkeleton.tsx
│   └── utils/
├── prisma/
│   ├── schema.prisma            # Expanded: cache tables, audit log, user roles
│   ├── seed.ts
│   └── migrations/
├── docs/
├── .llm/
└── middleware.ts                 # ← NEW: Next.js edge middleware for auth
```

### Key Changes

| Change | Rationale |
|--------|-----------|
| `lib/services/` layer | Remove AWS SDK and Prisma calls from route handlers. Single place to maintain business logic. |
| `lib/services/aws.ts` singleton | Replace 7+ duplicate `new EC2Client()` instantiations. Centralize region config. |
| `lib/hooks/` | Deduplicate the identical `useState` + `useEffect` + `fetch` pattern across all pages. |
| `lib/constants/status.ts` | Merge 3 identical status-mapping `utils.ts` files into one module. |
| `lib/ui/feedback/` | Shared loading skeletons, empty states, and error banners. |
| `middleware.ts` (root) | Next.js edge middleware for auth verification on every protected route. |
| Move client-side `api.ts` helpers from `(routes)/instances/` to `lib/` | Co-locating fetch wrappers with pages creates hidden coupling. |

---

## 3. Data Model (Prisma)

### Current Schema

```
User ─── (auth only, no role)
Playbook ──→ Step ──→ Target
Instance (orphaned — never queried)
```

### Target Schema

```
User
  id            Int       PK auto-increment
  email         String    unique
  password      String    bcrypt hash
  firstName     String?
  lastName      String?
  role          Role      enum (ADMIN, OPERATOR)     ← NEW
  createdAt     DateTime
  updatedAt     DateTime

Playbook
  id            Int       PK auto-increment
  name          String
  description   String
  starred       Boolean   default(false)
  createdBy     Int       FK → User                  ← NEW
  createdAt     DateTime                              ← NEW
  updatedAt     DateTime                              ← NEW
  steps         Step[]    cascade delete

Step
  id            Int       PK auto-increment
  type          String
  order         Int                                   ← NEW: explicit ordering
  playbookId    Int       FK → Playbook
  targets       Target[]  cascade delete

Target
  id               Int       PK auto-increment
  instanceId       String
  instanceName     String?
  availabilityZone String?
  snapshotId       String?
  snapshotName     String?
  stepId           Int       FK → Step

─── Cached AWS State ──────────────────────────────────

CachedInstance                                         ← NEW
  instanceId    String    PK (AWS instance ID)
  name          String?
  type          String
  state         String    (running, stopped, etc.)
  publicIp      String?
  privateIp     String?
  az            String
  launchTime    DateTime?
  tags          Json                                   ← store full tag map
  syncedAt      DateTime                               ← last sync timestamp

CachedVolume                                           ← NEW
  volumeId      String    PK
  instanceId    String?
  size          Int
  type          String
  state         String
  az            String
  tags          Json
  syncedAt      DateTime

CachedSnapshot                                         ← NEW
  snapshotId    String    PK
  volumeId      String?
  size          Int
  state         String
  storageTier   String?
  tags          Json
  syncedAt      DateTime

─── Audit & Execution ─────────────────────────────────

AuditLog                                               ← NEW
  id            Int       PK auto-increment
  userId        Int       FK → User
  action        String    (instance.start, playbook.run, etc.)
  resourceType  String    (instance, volume, snapshot, playbook)
  resourceId    String
  details       Json?     (request body, params)
  status        String    (success, failure)
  createdAt     DateTime

PlaybookRun                                            ← NEW
  id            Int       PK auto-increment
  playbookId    Int       FK → Playbook
  triggeredBy   Int       FK → User
  status        String    (running, completed, failed, cancelled)
  startedAt     DateTime
  completedAt   DateTime?
  stepResults   StepResult[]

StepResult                                             ← NEW
  id            Int       PK auto-increment
  runId         Int       FK → PlaybookRun
  stepId        Int       FK → Step
  status        String    (pending, running, success, failed, skipped)
  startedAt     DateTime?
  completedAt   DateTime?
  error         String?

Role (enum)                                            ← NEW
  ADMIN
  OPERATOR
```

---

## 4. Background Sync Architecture

The current approach of fetching live from AWS on every page load introduces latency, rate limiting risk, and inconsistent state across pages. The target architecture introduces a **server-side sync worker** that decouples AWS reads from user requests.

### How It Works

1. **Sync Worker** (`lib/services/sync.ts`) runs on a configurable interval (default: 30 seconds).
2. Calls `DescribeInstances`, `DescribeVolumes`, `DescribeSnapshots` via the shared `EC2Client`.
3. Upserts results into `CachedInstance`, `CachedVolume`, `CachedSnapshot` Prisma tables.
4. Each record stores a `syncedAt` timestamp for staleness detection.
5. **API routes read from cache tables** instead of calling AWS directly.
6. **Mutating operations** (start, stop, create, delete) still call AWS directly, then trigger an immediate cache refresh for the affected resource type.
7. The frontend shows a "Last synced: X seconds ago" indicator in the Navbar.
8. Users can click the existing refresh button to trigger an on-demand sync.

### Benefits

| Benefit | Detail |
|---------|--------|
| Instant page loads | Reads hit Prisma (local DB), not AWS API. Sub-100ms response times. |
| Consistent state | All pages read from the same cache. No stale data on one page while another is fresh. |
| Reduced AWS API calls | One set of Describe calls per interval vs. one per page load per user. |
| Offline resilience | If AWS API is temporarily unavailable, the last-known state is still displayed. |
| Audit-friendly | Cache tables provide a queryable history of resource state over time. |

---

## 5. Theming System

All colors are driven from CSS custom properties in `globals.css` `:root`:

| Variable | Meaning | Default |
|----------|---------|---------|
| `--background` | Page background | `#030712` (gray-950) |
| `--surface` | Cards, panels | `#111827` (gray-900) |
| `--surface-elevated` | Hover / elevated | `#1f2937` (gray-800) |
| `--input-bg` | Input field background | `#1f2937` (gray-800) |
| `--input-border` | Input border | `#374151` (gray-700) |
| `--input-border-focus` | Focused border | `#3b82f6` (blue-500) |
| `--text-primary` | Body text | `#f3f4f6` (gray-100) |
| `--text-secondary` | Labels, muted | `#9ca3af` (gray-400) |
| `--text-placeholder` | Placeholders | `#6b7280` (gray-500) |
| `--color-primary` | Primary accent | `#3b82f6` (blue-500) |
| `--color-danger` | Destructive actions | `#ef4444` (red-500) |
| `--color-success` | Success states | `#22c55e` (green-500) |

These are mapped to Tailwind utilities in `tailwind.config.ts` as semantic tokens (`surface`, `elevated`, `field`, `muted`, `primary`, `danger`, `success`, etc.).

The `@layer components` block defines `.form-input` and `.form-label` classes for consistent input styling.

---

## 6. Authentication Flow

### Current

1. **Register** — `POST /api/auth/register` → hash password with bcrypt → store `User` in Prisma.
2. **Login** — `POST /api/auth/login` → verify bcrypt → issue JWT → set cookie.
3. **Session** — JWT stored as a browser cookie (`document.cookie` — migration to httpOnly pending).
4. **Protected routes** — Not yet enforced via middleware.

### Target

1. **Register** — Same, but with email validation and optional invite-only mode.
2. **Login** — JWT issued as an httpOnly, Secure, SameSite=Strict cookie. Short-lived access token (15 min) + longer-lived refresh token (7 days).
3. **Middleware** — `middleware.ts` at project root intercepts all non-auth routes. Verifies JWT. Rejects with 401.
4. **Token Refresh** — `/api/auth/refresh` endpoint issues new access token using valid refresh token.
5. **Logout** — Clears both tokens. Invalidates refresh token in DB.
6. **RBAC** — `User.role` checked in service layer for admin-only operations (user management, settings).

---

## 7. API Design Patterns

### Current Issues

- No middleware, no auth checks on any route.
- `EC2Client` instantiated 7+ times with inconsistent region config (2 hardcoded, 1 missing fallback).
- `PrismaClient` instantiated locally in 4 route files instead of using the shared singleton.
- GET used for the destructive restore operation (should be POST).
- Inconsistent response shapes: mix of `NextResponse.json()` and `new Response(JSON.stringify(...))`.
- No input validation.

### Target Conventions

| Convention | Rule |
|------------|------|
| Response format | Always `NextResponse.json({ data?, error?, message? }, { status })`. |
| Error responses | `{ error: string, message?: string }` with appropriate HTTP status code. |
| Auth | All non-`/api/auth/*` routes require valid JWT. Enforced by middleware. |
| Input validation | Validate request bodies at the route level before passing to service layer. |
| Service delegation | Route handlers are ≤ 20 lines. All logic lives in `lib/services/`. |
| AWS calls | Always through `lib/services/aws.ts` singleton. Never instantiate `EC2Client` in a route. |
| Prisma calls | Always through `lib/prisma.ts` singleton. Never `new PrismaClient()` in a route. |
| Mutations via POST | Restore, start, stop, run — all use POST, never GET. |
| Audit logging | Service layer writes an `AuditLog` entry for every mutating action. |

---

## 8. Frontend Data Fetching Strategy

### Current Issues

- Every page uses raw `useState` + `useEffect` + `fetch()`. No caching, no deduplication.
- Polling intervals are inconsistent (5s, 10s, never) across pages.
- Loading states are plain text strings. No skeletons or spinners.
- Error display is inconsistent: some pages show banners, some `console.error` silently.
- ~15 leftover `console.log` calls in production code.

### Target Strategy: React Query

Adopt **TanStack React Query** (`@tanstack/react-query`) as the data fetching layer.

| Feature | How |
|---------|-----|
| **Caching** | Query results cached by key. Navigation between pages is instant (no re-fetch if data is fresh). |
| **Background refetch** | `refetchInterval` replaces manual `setInterval` polling. Configurable per resource type. |
| **Stale-while-revalidate** | Show cached data immediately, refetch in background. Zero-latency page transitions. |
| **Deduplication** | Multiple components using the same query key share a single network request. |
| **Optimistic updates** | Start/stop buttons reflect state change immediately, roll back on error. |
| **Error retry** | Automatic retry with exponential backoff. Consistent error states via `useQuery.error`. |
| **DevTools** | React Query DevTools for debugging during development. |

**Custom hooks** in `lib/hooks/`:

```ts
// useResource.ts — generic wrapper
export function useInstances() {
  return useQuery({ queryKey: ['instances'], queryFn: fetchInstances, refetchInterval: 30_000 });
}

export function useVolumes() {
  return useQuery({ queryKey: ['volumes'], queryFn: fetchVolumes, refetchInterval: 60_000 });
}
```

Pages become thin:

```tsx
export default function InstancesPage() {
  const { data, isLoading, error } = useInstances();
  if (isLoading) return <TableSkeleton columns={6} rows={8} />;
  if (error) return <ErrorBanner message={error.message} />;
  return <DataTable data={data} columns={columns} />;
}
```

---

## 9. UX Patterns (Inspired by Top Platforms)

The following patterns are drawn from platforms like AWS Console, Vercel, Datadog, Grafana, and Portainer.

| Pattern | Description | Where |
|---------|-------------|-------|
| **Command Palette** | `Cmd+K` / `Ctrl+K` global search across instances, volumes, snapshots, and playbooks. Type-ahead with categorized results. | Navbar |
| **Breadcrumbs** | Context-aware breadcrumb trail (`Home > Instances > i-0abc123`). | Below Navbar |
| **Skeleton Loaders** | Pulsing placeholder rows that match table column layout. Replaces "Loading..." text. | All data pages |
| **Empty States** | Illustrated "no data" messages with a clear call-to-action ("Create your first playbook"). | All list pages |
| **Toast + Undo** | Destructive actions show a toast with "Undo" for a 5-second grace period before executing. | Delete, stop |
| **Inline Status Transitions** | Status chips animate between states (e.g., "stopping..." with spinner before "stopped"). | Instance rows |
| **Contextual Actions** | Row-level action menus (three-dot menu or right-click) instead of separate action columns. | DataTable |
| **Active Sidebar Highlighting** | Current route highlighted in sidebar with visual indicator. | Sidebar |
| **Last Synced Indicator** | "Synced 12s ago" in header with manual refresh. | Navbar |
| **Keyboard Shortcuts** | `R` to refresh, `N` to create new, `?` to show shortcut help. | Global |
| **Detail Panels / Slide-over** | Click a resource row to open a detail panel that slides in from the right. Stay on the list page. | Instances, Volumes, Snapshots |
| **Batch Operations** | Checkbox selection in tables + toolbar for bulk start/stop/delete. | Instance list |
| **Responsive Tables** | Switch to card layout on smaller viewports. | All data tables |

---

## 10. Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js App Router | Unified frontend + API in one project. Server components for initial loads. |
| Prisma + PostgreSQL | Type-safe ORM, migration history, easy seeding. |
| AWS SDK v3 (not v2) | Tree-shakeable, smaller bundles, actively maintained. |
| Tailwind CSS with CSS variables | Utility classes for speed, variables for centralized theming. |
| React Query (planned) | Replaces manual fetch+state+effect. Caching, dedup, background refetch, optimistic updates. |
| Background sync to DB cache | Decouples read latency from AWS API speed. Enables instant page loads and offline resilience. |
| Service layer (`lib/services/`) | Keeps route handlers thin. Centralizes business logic for reuse and testability. |
| Docker Compose | Single-command dev and deploy environment including PostgreSQL. |
| SSE for long-running ops | Simpler than WebSockets for uni-directional server → client streaming. |
| Edge middleware for auth | Runs before route handlers. Consistent auth enforcement without per-route boilerplate. |

---

## 11. Deployment

- `Dockerfile` builds the Next.js app (target: multi-stage production build).
- `docker-compose.yml` runs the app + PostgreSQL.
- Environment variables configured via `.env` / `example.env`.
- Prisma migrations run at build or startup time.

---

## 12. Refactoring Priorities

Ordered by impact and dependency. Each item maps to roadmap tasks.

| Priority | Refactoring | Why | Roadmap |
|----------|-------------|-----|---------|
| **P0** | Fix DataTable hooks-in-map violation | Runtime bug. React rules-of-hooks broken. | 1.6 |
| **P0** | Create `lib/services/aws.ts` singleton | Replaces 7 duplicate EC2Client instantiations (2 hardcoded regions, 1 no fallback). | 1.7 |
| **P0** | Use shared Prisma singleton everywhere | 4 route files create `new PrismaClient()` locally, risking connection pool exhaustion. | 1.8 |
| **P0** | Add auth middleware | Zero API routes verify authentication. Any unauthenticated user can call every endpoint. | 1.9 |
| **P1** | Change restore endpoint from GET to POST | GET is used for a destructive multi-step mutation. Violates HTTP semantics. | 1.10 |
| **P1** | Remove hardcoded JWT fallback secret | `'your-secret-key'` used if env var is missing. | 1.11 |
| **P1** | Create service layer (`lib/services/`) | Decouple business logic from route handlers. Enable unit testing. | 2.1 |
| **P1** | Consolidate 3 status-mapping utils into `lib/constants/status.ts` | Identical pattern duplicated across instances, volumes, snapshots. | 2.2 |
| **P1** | Move client-side API helpers from `(routes)/` to `lib/` | Hidden coupling between page co-located files and shared concerns. Fix stop-instance copy-paste error message. | 2.3 |
| **P2** | Adopt React Query | Replaces duplicated fetch+useState+useEffect in every page. Adds caching and background refetch. | 2.4 |
| **P2** | Replace raw `window.confirm()` with `ConfirmationModal` | Component exists but is unused. 2 pages use `window.confirm()`. | 2.5 |
| **P2** | Clean up console.log statements | ~15 across production code. | 2.6 |
| **P2** | Normalize import aliases (`@/lib/` consistently) | Mix of `@/lib/ui/` and `@/ui/` across files. | 2.7 |
| **P3** | Add skeleton loaders and empty state components | Every page uses plain "Loading..." text. | 3.x |
| **P3** | Implement background AWS sync | Move read operations from live AWS calls to cached DB state. | 4.x |
