# 9 | Integrations — Revive Roadmap

Plugin-style extension framework for third-party services, plus first-party integrations that fire on lifecycle events (restore complete, playbook run, sync complete, etc.). **Status: Todo.**

> For conventions and status guide, see [ROADMAP.md](ROADMAP.md).

---

## Phase 9.1 — Extensions & Third-Party Integrations

Plugin-style integrations that fire on lifecycle events (restore complete, sync complete, playbook run, etc.). Each integration is independently opt-in, configured in Settings, and backed by its own Prisma model so credentials and templates are persisted per-integration.

### Integration Framework

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 9.1.1 | `Integration` Prisma model + migration | 🔲 Todo | `id`, `type` (enum: `DISCORD`, …), `enabled Boolean`, `config Json` (type-specific settings), `createdAt`, `updatedAt`. One row per configured integration. | Arch §3 |
| 9.1.2 | Integration service base (`lib/services/integrations/`) | 🔲 Todo | `triggerIntegrations(event, context)` dispatcher. Loads enabled integrations from DB, calls per-type handler with event context object. Fire-and-forget with per-integration error isolation. | Arch §2 |
| 9.1.3 | Integration variable interpolation engine | 🔲 Todo | Handlebars-style `{{variable}}` substitution. Common variables: `{{instanceName}}`, `{{instanceId}}`, `{{privateIp}}`, `{{publicIp}}`, `{{restoredAt}}` (formatted time), `{{attacksAllowedAt}}` (restoredAt + configurable delay), `{{playbookName}}`, `{{region}}`. | PRD §3.5 |
| 9.1.4 | Integration settings hub page (`/settings/integrations`) | 🔲 Todo | List of available integration types with enabled/disabled toggle. Clicking one opens type-specific config form (webhook URL, message template, delay, etc.). | PRD §3.9 |
| 9.1.5 | Integration API routes (`GET/POST /api/integrations`, `GET/PATCH/DELETE /api/integrations/[id]`) | 🔲 Todo | CRUD for integration records. All config fields validated with Zod. Sensitive fields (tokens, URLs) stored in `config` JSON column. | Arch §7 |
| 9.1.6 | Audit log entries for integration dispatches | 🔲 Todo | Log each trigger attempt and success/failure. Surfaced on the Audit Logs page with `action: INTEGRATION_TRIGGERED`. | PRD §3.8 |

### Discord Integration

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 9.1.7 | Discord integration service (`lib/services/integrations/discord.ts`) | 🔲 Todo | Sends a Discord webhook `POST` with an embed or plain message. Config fields: `webhookUrl`, `messageTemplate` (multi-line string with `{{variable}}` tokens), `attackDelayMins` (default 10). | PRD §3.5 |
| 9.1.8 | Discord integration config UI | 🔲 Todo | Form fields: webhook URL input, message template textarea with variable reference sidebar (lists available `{{variables}}`), attack-delay input (minutes), test-send button. | PRD §3.9 |
| 9.1.9 | Hook Discord trigger into restore completion | 🔲 Todo | After SSE stream ends successfully in the restore service, call `triggerIntegrations('RESTORE_COMPLETE', { instance, snapshotId, restoredAt })`. Compute `attacksAllowedAt = restoredAt + attackDelayMins`. | PRD §3.5 |
| 9.1.10 | Default restore message template | 🔲 Todo | Pre-fill template with competition-oriented default: `---- RESTORE ----\n{{instanceName}}\n{{privateIp}}\nRestored: {{restoredAt}}\nAttacks allowed: {{attacksAllowedAt}}`. User can override freely. | PRD §3.5 |
| 9.1.11 | "Test Message" button on Discord config page | 🔲 Todo | `POST /api/integrations/[id]/test` — sends the template rendered with placeholder values so the user can verify delivery before a real restore. | PRD §3.9 |
