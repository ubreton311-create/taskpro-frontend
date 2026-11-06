# Decisions

Short, append-only record of decisions that agents and contributors need in order
to work the backlog consistently. A decision stays in force until a later entry
supersedes it (superseding entry links back to the one it replaces).

---

## D-001 — GitHub Issues are the backlog, milestones are slices

**Date:** 2026-11-06 · **Status:** accepted

The authoritative backlog lives in GitHub Issues. Each milestone is a vertical
slice of work that can be shipped on its own. `BACKLOG.md` is a human-readable
link index only; it is never the source of truth and is not synchronized
automatically.

**Consequence:** adding or reprioritizing work means touching Issues/milestones
first. A PR that only edits `BACKLOG.md` does not change the backlog.

---

## D-002 — Exactly one `priority:next` issue

**Date:** 2026-11-06 · **Status:** accepted

There is always exactly one open issue labeled `priority:next`. It is the next
item to be worked, and the only item an agent may start unprompted.

**Selection rule:** the lowest-numbered open issue in the earliest open
milestone, excluding the final-stage milestone (see D-003).

**Consequence:** when the labeled issue is started or closed, the label moves in
the same piece of work that resolves it. Two `priority:next` labels, or zero, are
both defects.

---

## D-003 — Platform validation is deferred to the final stage

**Date:** 2026-11-06 · **Status:** accepted

macOS and Windows validation of the frontend is deferred by decision. Those items
live in the final-stage milestone (`Final · Platform validation (deferred)`) and
are excluded from the `priority:next` selection rule.

**Rationale:** development and deployment happen on Linux CI and Linux-hosted
static hosting. Cross-platform desktop verification buys little until the
deployable build and the security boundaries are sound.

**Consequence:** a deferred platform item is never `priority:next`, even if it is
the lowest-numbered open issue.

---

## D-004 — Review output is a COMMENT-event review

**Date:** 2026-11-06 · **Status:** accepted

Automated review posts exactly one review per PR through
`POST /pulls/{n}/reviews` with `event=COMMENT`. Agents never approve, request
changes, push to the reviewed branch, or merge. If a full review is impossible,
the same endpoint still receives a partial review marked `⚠️ Partial review`.

**Consequence:** findings always land where review gates read them. Top-level PR
issue comments are not an acceptable substitute.

---

## D-005 — The build gate is not negotiable

**Date:** 2026-11-06 · **Status:** accepted

`npm run build` (`tsc -b && vite build`) and `npm run lint` must both exit 0
before a PR can merge. Type checking is part of the build, not a separate
optional step.

**Consequence:** a change that fixes behaviour but leaves the build red is not
done. Lowering `strict`/`noUnusedLocals`, adding `// @ts-nocheck`, or dropping
`tsc -b` from `build` is a Blocker per the AGENTS.md checklist (SEC-03).
