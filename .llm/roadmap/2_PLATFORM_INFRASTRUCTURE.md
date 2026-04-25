# 2 | Platform Infrastructure — Revive Roadmap

The supporting layers that every feature page depends on: the UI component library (skeletons, empty states, error banners, navigation) and the background AWS sync engine (cache tables, sync worker, auto-sync interval). **Status: In Progress.**

> For conventions and status guide, see [ROADMAP.md](ROADMAP.md).

---

## Phase 2.1 — UX & Feedback Layer

Build the visual feedback infrastructure that all feature pages depend on. Skeleton loaders, empty states, error banners, and navigation improvements.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 2.1.1 | Create `Skeleton` component (table rows, cards, detail panels) | ✅ Done | `TableSkeleton`, `DetailSkeleton`, base `Skeleton` in `lib/ui/feedback/Skeleton.tsx`. Wired into all pages. | PRD §3.12, Arch §9 |
| 2.1.2 | Create `EmptyState` component with illustration + CTA | ✅ Done | `lib/ui/feedback/EmptyState.tsx` — icon, title, description, action slot. | PRD §3.13, Arch §9 |
| 2.1.3 | Create `ErrorBanner` component | ✅ Done | `lib/ui/feedback/ErrorBanner.tsx` — title, message, optional retry. Replaces inline error markup on instances, volumes, snapshots pages. | PRD §3.12 |
| 2.1.4 | Create `Spinner` component | ✅ Done | `lib/ui/feedback/Spinner.tsx` — sm/md/lg sizes, accessible `role="status"`. Used on dashboard loading. | Arch §9 |
| 2.1.5 | Active sidebar route highlighting | ✅ Done | `usePathname()` + `isActive()` helper. Active link gets `bg-blue-600/20 text-blue-400`. | PRD §3.11, Arch §9 |
| 2.1.6 | Breadcrumb navigation component | ✅ Done | `lib/ui/navigation/Breadcrumbs.tsx` — auto-generated from route segments, added to root layout. Hidden on home page. | PRD §3.11, Arch §9 |
| 2.1.7 | Toast notifications with undo support | 🔲 Todo | Destructive actions show "Undo" for 5-second grace period. | PRD §3.12, Arch §9 |
| 2.1.8 | Inline status chip transition animations | 🔲 Todo | Spinner inside chip while "stopping…", then update to "stopped". | PRD §3.12, Arch §9 |
| 2.1.9 | Responsive DataTable → card layout on small viewports | 🔲 Todo | | Arch §9 |
| 2.1.10 | Error boundary and custom 404 page | ✅ Done | `app/error.tsx` (client error boundary with reset) + `app/not-found.tsx` (friendly 404). | PRD §4 |
| 2.1.11 | Migrate pages to React Query hooks | ✅ Done | All 8 pages migrated to shared hooks. Removed manual `setInterval`, `useState+useEffect+fetch`. Mutations use `invalidateQueries`. | Arch §8 |

---

## Phase 2.2 — Background Sync & Real-Time Data *(Complete)*

Implement background AWS synchronization. Transforms the platform from "fetch on every page load" to "instant reads from local cache."

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 2.2.1 | Add `CachedInstance`, `CachedVolume`, `CachedSnapshot` Prisma models | ✅ Done | Migration `20260412130031_add_aws_cache_tables`. Added `SyncStatus` singleton model. | Arch §3, §4 |
| 2.2.2 | Implement sync worker (`lib/services/sync.ts`) | ✅ Done | `syncAll()`, `syncInstances()`, `syncVolumes()`, `syncSnapshots()`, `getSyncStatus()`. Uses Prisma transactions with stale-row cleanup. | PRD §3.10, Arch §4 |
| 2.2.3 | Migrate read API routes to serve from cache tables | ✅ Done | `lib/services/cache.ts` — cache-first reads with direct-AWS fallback + background sync on first request. | PRD §3.10 |
| 2.2.4 | Trigger immediate cache refresh after mutations | ✅ Done | `syncInstances()` after start/stop, `syncVolumes()` after delete, `syncSnapshots()` after tag — all as background `.catch()` calls. | PRD §3.10 |
| 2.2.5 | "Last synced: Xs ago" indicator in Navbar | ✅ Done | `useSyncStatus()` hook with 10s refetchInterval. `formatLastSync()` helper in Navbar. | PRD §3.10, Arch §9 |
| 2.2.6 | Make Navbar refresh button trigger on-demand sync | ✅ Done | `useTriggerSync()` mutation. Spinning icon + disabled state during sync. | PRD §3.10 |
| 2.2.7 | Sync health monitoring and error surfacing | ✅ Done | `SyncBanner` component — red error banner when `lastError` is set, retry button. | PRD §3.10 |
| 2.2.8 | Graceful degradation — show stale data when AWS is unreachable | ✅ Done | Yellow "data may be outdated" banner when last sync >5min ago. Cached data still served. | PRD §3.10, §4 |
| 2.2.9 | Auto-sync with configurable interval | ✅ Done | `autoSyncEnabled` + `autoSyncIntervalSecs` fields on `SyncStatus`. `GET/PATCH /api/sync/config`. `useAutoSync` hook in Navbar drives client-side interval. `/settings/sync` page with toggle + preset buttons. Defaults: enabled, 30s. | PRD §3.10 |
