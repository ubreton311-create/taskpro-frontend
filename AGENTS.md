# AGENTS.md

Instructions for AI agents and human contributors working in this repository.

`taskpro-frontend` is the React + TypeScript + Vite web client for TaskPro Service.
It talks to the TaskPro API (see `VITE_API_URL` below) — it is **not** a full-stack app.

## Ground rules

- One logical change per pull request. If it needs "and" to describe, split it.
- Never weaken a quality gate to make a change pass (no `--no-verify`, no disabled
  rules, no skipped tests, no `tsc -b` removed from `build`).
- Never commit: `node_modules/`, `dist/`, `*.tsbuildinfo`, `.env`, or any file
  holding credentials. Use `.env.example` for documented variables.
- Do not add a dependency for something the platform or an existing dependency
  already does. Check `package.json` first.
- Report problems as GitHub Issues before fixing unrelated things you notice.

## Project layout

```
src/
  main.tsx              app shell, router, providers
  views/                top-level route screens
  components/           shared UI (admin/, client/, chat/, DynamicForm/)
  services/             API clients (one fetch wrapper per domain)
  context/              React contexts
  utils/                auth + pricing helpers
  schemas/              per-trade service form schemas
  styles/               global stylesheet
  types/                shared TypeScript types
```

## Commands

```bash
npm ci                 # install exactly what package-lock pins
npm run dev            # Vite dev server
npm run build          # tsc -b && vite build  <- must pass before any PR
npm run lint           # eslint .
npm run preview        # serve the production build locally
```

The build is `tsc -b && vite build`, so **a type error is a build failure and a
deployment failure**. `npm run build` and `npm run lint` must both exit 0.

## Environment variables

| Name                   | Required | Purpose                                        |
| ---------------------- | -------- | ---------------------------------------------- |
| `VITE_API_URL`         | yes      | Base URL of the TaskPro API (no trailing slash) |
| `VITE_GOOGLE_CLIENT_ID`| yes      | Google OAuth client id for the login button     |

`VITE_*` values are compiled into the public bundle. Never put secrets in them.
A missing `VITE_API_URL` must never silently default to a `localhost` address —
production builds must fail loudly instead.

## Definition of done

1. `npm run build` exits 0.
2. `npm run lint` exits 0.
3. The change was exercised in a browser (or a test proves it).
4. New env vars, scopes, and timeouts are named in the PR description.
5. No new `any`, no new dead files, no duplicated helper.

---

## PR Review

Before creating a PR, and when reviewing any PR, apply this checklist.
Report findings by severity: **Blocker** (do not merge), **High**
(merge only with explicit justification), **Medium** (flag for follow-up).

### Blockers
- [ ] One path. Traced end to end, including failure steps. (SEC-01)
- [ ] Boundaries. Auth, tenancy, input validation, untrusted input unchanged or changed on purpose. (SEC-02)
- [ ] CI. Every diff under .github/ read in full. No skipped tests, no lowered thresholds, no moved triggers. (SEC-03)
- [ ] Evidence. A test, CI run, or screenshot proves this ran. (SEC-04)
- [ ] APIs and imports. Every symbol exists in the version this repo runs. (SEC-05)

### High
- [ ] Shape. One sentence describes the change; matches the title.
- [ ] Blast radius. Nothing outside stated scope moved.
- [ ] Deletions. No live callers; removals are intentional.
- [ ] Config and permissions. New env vars, scopes, timeouts named in the description and are ones we want.

### Medium
- [ ] Duplication. New helper/client/type doesn't already exist under another name. (SEC-06)
- [ ] Test quality. Tests would fail if the code were broken. (SEC-07)
- [ ] Performance. No N+1 queries, unbounded loops, missing pagination on production paths.

## Review output

Post findings as a single PR review via POST /pulls/{n}/reviews with
event=COMMENT. Never approve, request changes, push, or merge.

### Format
- One inline comment per finding, anchored to the smallest relevant
  line range on the PR head commit.
- Each comment: severity tag, one-sentence problem statement, then
  the fix.
- When the fix is a drop-in replacement for the anchored lines, end
  the comment body with a suggestion block:

    ```suggestion
    <replacement code, exact indentation>
    ```

  The suggestion block must be the **last** content in the body —
  GitHub strips anything after the closing fence.
- When the fix spans multiple lines, use start_line + line in the
  API payload (side: "RIGHT").
- When the fix is architectural or cross-file, post the recommendation
  as prose or a plain code block instead of a suggestion block.
- The review body (top-level) holds a 2–4 sentence summary and any
  findings that can't be anchored to a diff line. Reference inline
  threads by file:line rather than repeating them.

### Fallback: comment-only review
If you cannot complete a full review (missing context, can't run tests,
diff too large, tool unavailable), still post a COMMENT-event review:
- State explicitly what you could and couldn't verify.
- List the checklist items you skipped and why.
- Post whatever findings you did identify, with the same format above.
- Mark the review body with `⚠️ Partial review` on the first line.

Never fall back to a PR issue comment (POST /issues/{n}/comments).
That endpoint is not read by review gates.

Why the fallback matters
The most common failure mode I see in the wild: an agent that "can't do a full review" either posts nothing, or posts a top-level PR comment that looks like feedback but is invisible to any CI gate or review-status check. By pinning the fallback to the same COMMENT-event endpoint, the output is always in the same place a human (or a downstream check) expects to find it.

One practical note on suggestion blocks
GitHub only renders the "Commit suggestion" button when:

The comment is an inline review comment (not the review body)
The suggestion block is the last element in the body
The existing_code (the lines being replaced) matches the diff exactly — whitespace included
If your agent generates a suggestion that doesn't match the current line content, GitHub silently drops the button and shows it as plain code. That's a non-issue (it degrades gracefully), but worth knowing so you don't think the feature is broken.

## Backlog conventions

- The authoritative backlog is GitHub Issues; slices are milestones. BACKLOG.md is only a link index — no automatic synchronization.
- Invariant: exactly one open issue carries `priority:next` — the next item to work.
- When the labeled issue is started or closed, move `priority:next` to the next open issue: the lowest-numbered open issue in the earliest open milestone, excluding the final-stage milestone (platform validation is deferred there by decision — see docs/decisions.md).
- An item that is deferred to the final stage (e.g. macOS/Windows validation) belongs in the final-stage milestone, not under `priority:next`.

## Working the backlog

1. Pick the single issue labeled `priority:next`.
2. Read the whole issue, then reproduce the problem before changing code.
3. Branch from `main`, reference the issue number in the PR title.
4. Apply the PR Review checklist above before opening the PR.
5. On merge, move `priority:next` per the rule above and update the
   BACKLOG.md link index.
