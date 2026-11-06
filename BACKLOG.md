# Backlog

**The authoritative backlog is GitHub Issues. Milestones are slices.**
This file is a hand-maintained **link index only** — it is not synchronized
automatically, and editing it does not change the backlog (see
`docs/decisions.md` D-001).

- Repo: <https://github.com/ubreton311-create/taskpro-frontend>
- One open issue carries `priority:next`. Selection rule: the lowest-numbered open
  issue in the earliest open milestone, excluding the final-stage milestone
  (D-002, D-003).
- Every issue below was produced by the 2026-11-06 codebase audit and contains
  reproduction evidence and acceptance criteria.

## Next up

**[#2](https://github.com/ubreton311-create/taskpro-frontend/issues/2) — Build is red: `npm run build` fails with 70 TypeScript errors** · `severity:blocker`
Already fixed on [PR #1](https://github.com/ubreton311-create/taskpro-frontend/pull/1); the next action is to review and land it, then confirm `main` is green.

---

## M1 · Deployable build

| # | Issue | Severity |
| --- | --- | --- |
| 2 | [Build is red: `npm run build` fails with 70 TypeScript errors](https://github.com/ubreton311-create/taskpro-frontend/issues/2) · `priority:next` | Blocker |
| 3 | [Schemas use `conditionalOn`, which the form field types never declare](https://github.com/ubreton311-create/taskpro-frontend/issues/3) | Blocker |
| 4 | [Remove the 41 unused imports/locals that fail `noUnusedLocals`](https://github.com/ubreton311-create/taskpro-frontend/issues/4) | Blocker |
| 5 | [Reconcile prop and API contracts broken at runtime](https://github.com/ubreton311-create/taskpro-frontend/issues/5) | High |
| 6 | [TypeScript project setup: `tsc -b` ignores `tsconfig.app.json`; `tsconfig.tsbuildinfo` committed](https://github.com/ubreton311-create/taskpro-frontend/issues/6) | High |

## M2 · Production config & deployment

| # | Issue | Severity |
| --- | --- | --- |
| 7 | [Production has no API base URL: 19 files fall back to `http://localhost:3000`](https://github.com/ubreton311-create/taskpro-frontend/issues/7) | Blocker |
| 8 | [No CI: nothing runs build, lint or tests on pull requests](https://github.com/ubreton311-create/taskpro-frontend/issues/8) | High |
| 9 | [Deployment target undocumented, SPA rewrite Netlify-only, Node unpinned](https://github.com/ubreton311-create/taskpro-frontend/issues/9) | High |
| 10 | [`.env` is committed and `.env.example` does not exist](https://github.com/ubreton311-create/taskpro-frontend/issues/10) | High |
| 11 | [Ship-blocking placeholder content](https://github.com/ubreton311-create/taskpro-frontend/issues/11) | High |

## M3 · Auth & security boundaries

| # | Issue | Severity |
| --- | --- | --- |
| 12 | [No route guards: admin/staff/reports/settings/provider render when unauthenticated](https://github.com/ubreton311-create/taskpro-frontend/issues/12) | Blocker |
| 13 | [Auth state fragmented across four localStorage keys; AuthContext never mounted](https://github.com/ubreton311-create/taskpro-frontend/issues/13) | High |
| 14 | [Money and address fields trusted from the client](https://github.com/ubreton311-create/taskpro-frontend/issues/14) | High |

## M4 · Code quality & maintainability

| # | Issue | Severity |
| --- | --- | --- |
| 15 | [Lint gate is red: 102 ESLint errors](https://github.com/ubreton311-create/taskpro-frontend/issues/15) | Medium |
| 16 | [Dead code: 35 of 72 modules unreachable (~1,642 lines) + 4 orphan stylesheets](https://github.com/ubreton311-create/taskpro-frontend/issues/16) | Medium |
| 17 | [Duplicated API plumbing: 15 `API_URL`, 4 `getAuthHeaders`, 3 data layers](https://github.com/ubreton311-create/taskpro-frontend/issues/17) | Medium |
| 18 | [Service schemas are single-line files](https://github.com/ubreton311-create/taskpro-frontend/issues/18) | Medium |
| 19 | [No tests and no error boundary](https://github.com/ubreton311-create/taskpro-frontend/issues/19) | High |
| 20 | [Repo hygiene: template README, inert Tailwind config, unused deps, stray Prisma script](https://github.com/ubreton311-create/taskpro-frontend/issues/20) | Medium |

## M5 · Performance & accessibility

| # | Issue | Severity |
| --- | --- | --- |
| 21 | [Single 858 kB JS bundle, no code splitting, uncompressed in production](https://github.com/ubreton311-create/taskpro-frontend/issues/21) | Medium |
| 22 | [Accessibility gaps: alt text, unlabeled inputs, document language](https://github.com/ubreton311-create/taskpro-frontend/issues/22) | Medium |

## Final · Platform validation (deferred)

| # | Issue | Severity |
| --- | --- | --- |
| 23 | [Validate the app on macOS and Windows](https://github.com/ubreton311-create/taskpro-frontend/issues/23) | Medium |

Deferred by decision (D-003). Never eligible for `priority:next`.

---

## Related open work

- **[PR #1](https://github.com/ubreton311-create/taskpro-frontend/pull/1)** —
  `fix(build)`: repairs the production build and adds a reproducible Railway
  deployment. It overlaps #2, #3, #4, #5 (partly), #6 (partly), #8 (partly),
  #9 and #10 (partly); each affected issue carries an overlap comment stating
  what is and is not fixed on that branch.
