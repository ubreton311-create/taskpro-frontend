# Backlog

**The authoritative backlog is GitHub Issues. Milestones are slices.**
This file is a hand-maintained **link index only** — it is not synchronized
automatically, and editing it does not change the backlog (see
`docs/decisions.md` D-001).

- Repo: <https://github.com/ubreton311-create/taskpro-frontend>
- One open issue carries `priority:next`. Selection rule: the lowest-numbered open
  issue in the earliest open milestone, excluding the final-stage milestone
  (D-002, D-003).
- Every issue below came from the 2026-11-06 codebase audit and carries
  reproduction evidence and acceptance criteria.

## Next up

**[#7](https://github.com/ubreton311-create/taskpro-frontend/issues/7) — Production has no API base URL: 19 files fall back to `http://localhost:3000`** · `severity:blocker`

---

## M2 · Production config & deployment — *earliest open slice*

| # | Issue | Severity |
| --- | --- | --- |
| 7 | [Production has no API base URL: 19 files fall back to `http://localhost:3000`](https://github.com/ubreton311-create/taskpro-frontend/issues/7) · `priority:next` | Blocker |
| 8 | [CI exists but omits lint and tests, and its check is not required on main](https://github.com/ubreton311-create/taskpro-frontend/issues/8) | High |
| 9 | [Deployment target: Railway documented, Netlify undeclared, Node pin wrong](https://github.com/ubreton311-create/taskpro-frontend/issues/9) | High |
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
| 6 | [Adopt TypeScript project references so `tsc -b` type-checks the real configs](https://github.com/ubreton311-create/taskpro-frontend/issues/6) · moved from M1 | High |
| 15 | [Lint gate is red: 60 ESLint errors](https://github.com/ubreton311-create/taskpro-frontend/issues/15) | Medium |
| 16 | [Dead code: 15 of 50 modules unreachable (1,766 lines) + 4 orphan stylesheets](https://github.com/ubreton311-create/taskpro-frontend/issues/16) | Medium |
| 17 | [Duplicated API plumbing: 19 `API_URL` fallbacks, 4 `getAuthHeaders`, 3 data layers](https://github.com/ubreton311-create/taskpro-frontend/issues/17) | Medium |
| 19 | [No tests and no error boundary](https://github.com/ubreton311-create/taskpro-frontend/issues/19) | High |
| 20 | [Repo hygiene: template README, inert Tailwind config, unused deps, stray Prisma script](https://github.com/ubreton311-create/taskpro-frontend/issues/20) | Medium |
| 26 | [Quote amount falls back to $0.00 when the payload shape is unexpected](https://github.com/ubreton311-create/taskpro-frontend/issues/26) | High |

## M5 · Performance & accessibility

| # | Issue | Severity |
| --- | --- | --- |
| 21 | [Single 871 kB JS bundle, no code splitting, uncompressed in production](https://github.com/ubreton311-create/taskpro-frontend/issues/21) | Medium |
| 22 | [Accessibility gaps: alt text, unlabeled inputs, document language](https://github.com/ubreton311-create/taskpro-frontend/issues/22) | Medium |

## Final · Platform validation (deferred)

| # | Issue | Severity |
| --- | --- | --- |
| 23 | [Validate the app on macOS and Windows](https://github.com/ubreton311-create/taskpro-frontend/issues/23) | Medium |

Deferred by decision (D-003). Never eligible for `priority:next`.

---

## Closed

**M1 · Deployable build — complete** ([PR #1](https://github.com/ubreton311-create/taskpro-frontend/pull/1))

| # | Issue | How it closed |
| --- | --- | --- |
| 2 | Build is red: 70 TypeScript errors | PR #1 — `npm run build` exits 0 on `main` |
| 3 | `conditionalOn` not declared (16 × TS2353) | #25 — the dead schema tree was deleted |
| 4 | 41 unused imports/locals fail `noUnusedLocals` | PR #1 — 0 `TS6133` remaining |
| 5 | Broken prop/API contracts (Quote, CheckoutStep, ProviderDashboard, ReviewModal, adminApi) | PR #1 — all five verified fixed; contract residue split out to #26 |
| 18 | Single-line schema files | #25 — the files no longer exist |

## Merged work

| PR | Result |
| --- | --- |
| [#1](https://github.com/ubreton311-create/taskpro-frontend/pull/1) | Repaired the build (`70 errors → 0`) and added Railway deploy config, CI, `.env.example`, `*.tsbuildinfo` ignore |
| [#24](https://github.com/ubreton311-create/taskpro-frontend/pull/24) | `AGENTS.md`, `docs/decisions.md`, this index |
| [#25](https://github.com/ubreton311-create/taskpro-frontend/pull/25) | Deleted the unused schema-driven form layer (22 files) |

## Known gaps in the quality gates

`npm run build` is green and enforced by CI. `npm run lint` is red (60 errors, #15)
and is **not** part of the workflow (#8) — until those two issues land, a PR can
merge with lint failing.
