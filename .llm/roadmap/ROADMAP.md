# Roadmap — Revive

Phased delivery plan organized by functional category. Each category file owns one or more phases with ordered tasks. Phase numbers are globally unique across the entire roadmap.

---

## Categories

| # | Category | Description | Phases | Status |
|---|----------|-------------|--------|--------|
| 1 | [Foundation](1_FOUNDATION.md) | Bug fixes, security hardening, architecture refactoring, and shared infrastructure. All complete and never revisited. | 1–2 | ✅ Complete |
| 2 | [Platform Infrastructure](2_PLATFORM_INFRASTRUCTURE.md) | UI feedback component library (skeletons, empty states, banners) and background AWS sync engine. | 3–4 | 🔨 In Progress |
| 3 | [Resource Management](3_RESOURCE_MANAGEMENT.md) | Full CRUD and detail views for EC2 instances, EBS volumes, snapshots, and the volume restoration workflow. | 3.1–3.2 | 🔨 In Progress |
| 4 | [Orchestration](4_ORCHESTRATION.md) | Playbook authoring, step execution engine, run history, failure policies, post-restore hooks, and visual canvas editor. | 4.1–4.3 | 🔲 Todo |
| 5 | [Observability & Administration](5_OBSERVABILITY_AND_ADMIN.md) | Audit logging, user management, RBAC, dashboard insights, competition metrics, and situational awareness. | 5.1–5.2 | 🔨 In Progress |
| 6 | [Onboarding & Developer Experience](6_ONBOARDING_AND_DX.md) | First-run setup wizard, contextual empty states, health checks, and contributor tooling. | 8 | 🔲 Todo |
| 7 | [Navigation & Power Users](7_NAVIGATION.md) | Command palette, keyboard shortcuts, contextual action menus, and advanced navigation. | 9 | 🔲 Todo |
| 8 | [Production Readiness](8_PRODUCTION_READINESS.md) | Multi-stage Docker builds, security headers, testing, CI/CD, and deployment hardening. | 10 | 🔲 Todo |
| 9 | [Integrations](9_INTEGRATIONS.md) | Extension framework and third-party integrations (Discord webhooks, etc.). | 9.1 | 🔲 Todo |
| 10 | [Competition Operations](10_COMPETITION_OPERATIONS.md) | Machine registry, named assets, one-click restore, parallel restore, session management, cooldown tracking, incident logging, and pre-competition readiness. | 10.1–10.6 | 🔲 Todo |

---

## Conventions

- Update task status as work is completed: `🔲 Todo` → `🔨 In Progress` → `✅ Done`
- Add new tasks at the end of the relevant phase within its category file.
- If a phase is fully complete, note the completion date in the phase heading.
- Every task should have a `Ref` linking to the PRD section or Architecture section that motivates it.
- Phase numbers are globally unique and sequential across all category files.
- Phases 1–2 are blockers for all subsequent phases. Phases 3+ can overlap where dependencies allow.
