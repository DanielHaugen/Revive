# 8 | Production Readiness — Revive Roadmap

Deployment hardening, multi-stage Docker builds, security headers, test coverage, CI/CD pipelines, and Node.js upgrades. **Status: Todo.**

> For conventions and status guide, see [ROADMAP.md](ROADMAP.md).

---

## Phase 8.1 — Production Readiness & Quality

Final polish, testing, CI/CD, and deployment hardening.

| # | Task | Status | Notes | Ref |
|---|------|--------|-------|-----|
| 8.1.1 | Forgot-password backend (email integration) | 🔲 Todo | UI exists. Need SMTP/SES integration. | PRD §3.1 |
| 8.1.2 | Accessibility audit (keyboard nav, ARIA, WCAG 2.1 AA contrast) | 🔲 Todo | | PRD §4 |
| 8.1.3 | Multi-stage Dockerfile for production builds | 🔲 Todo | Current Dockerfile runs `npm run dev`. Need `npm run build` + `npm start`. | Arch §11 |
| 8.1.4 | `.dockerignore` file | ✅ Done | Created in Phase 1. Excludes `node_modules`, `.next`, `.env*`, logs. | Arch §11 |
| 8.1.5 | Docker Compose production config | 🔲 Todo | Separate prod override with env var profiles. | PRD §4, Arch §11 |
| 8.1.6 | Security headers in `next.config.mjs` | 🔲 Todo | CSP, X-Frame-Options, X-Content-Type-Options, etc. | PRD §4 |
| 8.1.7 | CI pipeline (lint, type-check, test on PR) | 🔲 Todo | GitHub Actions or similar. | PRD §4 |
| 8.1.8 | Unit tests for service layer | 🔲 Todo | No test framework exists yet. Add Vitest. | PRD §4 |
| 8.1.9 | End-to-end tests for critical flows | 🔲 Todo | Playwright for login → instance list → start/stop → playbook run. | PRD §4 |
| 8.1.10 | Update Node.js to latest LTS (20+) | 🔲 Todo | Currently on Node 18. | Arch §11 |
