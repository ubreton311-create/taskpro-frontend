# Environment configuration

Where every variable comes from, how to set it in each environment, and how to
prove the running bundle actually got the value.

Related: `DEPLOY.md` §8 (deploy runbook, in Spanish), `docs/decisions.md` D-006
and D-007, `.env.example` (the template), `src/services/config.ts` (the only
reader), `vite.config.ts` (the build guard).

---

## 1. TL;DR

| Environment | Where you set values | Required to exist |
| --- | --- | --- |
| Local (`npm run dev`) | `.env.local` — optional | nothing (`VITE_API_URL` falls back to `http://localhost:3000`) |
| Local production build | shell variable or `.env.local` | `VITE_API_URL` |
| Production (Railway) | Service → **Variables** | `VITE_API_URL` |
| Preview (Netlify) | Site configuration → **Environment variables** | `VITE_API_URL` |
| CI (GitHub Actions) | `.github/workflows/ci.yml` (`env:`) | already set to a placeholder |

Every value is **baked into the JavaScript at build time**. Editing a variable in
a host panel does nothing until that host rebuilds — there is no runtime lookup,
no `.env` read on the server, and nothing to "restart".

---

## 2. The five variables

| Name | Required | Default when unset | Read by |
| --- | --- | --- | --- |
| `VITE_API_URL` | **Yes** for any production build | `http://localhost:3000` in `npm run dev`; **build fails** otherwise | `src/services/config.ts` → every `fetch` and the socket |
| `VITE_GOOGLE_CLIENT_ID` | No | Google sign-in button and provider are not rendered | `config.ts` → `main.tsx`, `LoginView.tsx` |
| `VITE_SUPPORT_EMAIL` | No | Email channel hidden in *Servicio al Cliente* | `config.ts` → `CustomerServiceView` |
| `VITE_SUPPORT_PHONE` | No | Phone channel hidden | same |
| `VITE_SUPPORT_WHATSAPP` | No | WhatsApp channel hidden | same |

Only variables prefixed with `VITE_` are exposed to client code. A variable named
`API_URL` (no prefix) is invisible to the bundle — that is a Vite rule, not a
project convention.

`VITE_API_URL` must be an **origin**: scheme + host, no trailing slash, no path.
The app appends its own routes (`/auth/login`, `/quotes`, `/chat`, …).

```dotenv
# ✅
VITE_API_URL=https://taskpro-backend-production.up.railway.app
# ❌ trailing slash, path suffix, missing scheme, localhost in production
VITE_API_URL=https://api.example.com/
VITE_API_URL=https://api.example.com/api
VITE_API_URL=api.example.com
VITE_API_URL=http://localhost:3000
```

---

## 3. How a value reaches the browser

```
.env.local / .env / host variable
        │  (Vite, at build time)
        ▼
import.meta.env.VITE_*  →  inlined string in dist/assets/*.js
        │
        ▼
src/services/config.ts   ← the ONLY module that reads import.meta.env
        │
        ▼
exported constants: API_URL, GOOGLE_CLIENT_ID, SUPPORT
```

Three consequences worth internalising:

1. **It is public.** Anything in the bundle can be read by anyone. No tokens, no
   passwords, no secrets in `VITE_*` — ever.
2. **It is frozen at build time.** A variable changed in Railway/Netlify applies
   to the *next* build, not to the running one.
3. **`process.env` does not exist in the browser.** `scripts/serve.mjs` only
   serves files; it injects nothing. Any code reaching for `process.env.VITE_*`
   gets `undefined`.

### File precedence (Vite, high → low)

| Priority | File | Committed? |
| --- | --- | --- |
| 1 | the shell / CI environment (`VITE_API_URL=… npm run build`) | — |
| 2 | `.env.local` | ignored |
| 3 | `.env.[mode].local` (e.g. `.env.production.local`) | ignored |
| 4 | `.env.[mode]` (e.g. `.env.production`) | not used in this repo |
| 5 | `.env` | ignored (was tracked until #10) |

The shell always wins, which is why `VITE_API_URL=… npm run build` overrides
whatever is in your local files — handy for testing a build against a different
backend.

### The build guard

`vite.config.ts` runs `requireApiUrl()` (plugin `apply: "build"`): before any
output is produced it calls `loadEnv(mode, envDir, "VITE_")` and throws when
`VITE_API_URL` is blank.

```
error during build:
Error: VITE_API_URL is not set. Define it in the build environment
(Railway/Netlify service variables) before building. See DEPLOY.md.
```

`src/services/config.ts` repeats the check at module load, so a bundle built by
some other means still fails loudly instead of quietly calling `localhost`.

> **Gotcha:** the guard reads `.env` files too. A stray `.env` in the working tree
> satisfies it locally — which is exactly how a tracked `.env` used to mask a
> missing host variable. Test the guard with the file moved aside:
> `mv .env /tmp/ && npm run build`.

---

## 4. Local development

```bash
npm ci
cp .env.example .env.local     # optional: dev already works without it
npm run dev                    # http://localhost:5173
```

* With no `.env.local`, `API_URL` is `http://localhost:3000` — start the backend
  there and everything works.
* Point at a deployed backend instead:

  ```dotenv
  # .env.local
  VITE_API_URL=https://taskpro-backend-production.up.railway.app
  VITE_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
  VITE_SUPPORT_EMAIL=soporte@example.com
  ```

* Testing a **production build** locally needs the variable too, because the dev
  fallback does not exist in a build:

  ```bash
  VITE_API_URL=https://your-backend npm run build
  PORT=4173 node scripts/serve.mjs      # serves dist/ the way Railway does
  curl -s localhost:4173/healthz        # -> ok
  ```

Never commit `.env` or `.env.local`: `.gitignore` covers `.env`, `.env.local` and
`.env.*.local`. `.env.example` is the committed template and must stay free of
real values.

---

## 5. Production — Railway

**Where:** Service → **Variables** (this is per-service; the frontend service, not
the backend one).

| Variable | Value |
| --- | --- |
| `VITE_API_URL` | `https://<backend-host>` |
| `VITE_GOOGLE_CLIENT_ID` | your web client id (optional) |
| `VITE_SUPPORT_*` | public support channels (optional) |
| `NIXPACKS_NODE_VERSION` | `22` (optional; `.nvmrc` already pins it) |

Then **Deployments → Deploy latest commit**. Editing a variable on its own does
not rebuild; the value only exists once the build runs again.

Checked by `railway.json`:

```json
"buildCommand": "npm ci && npm run build",
"startCommand": "node scripts/serve.mjs",
"healthcheckPath": "/healthz"
```

At runtime the process needs `PORT` (injected by Railway) and listens on
`0.0.0.0`; `HOST` is optional. Neither is a `VITE_*` variable — the server does
not read them into the bundle.

**Verify after deploy**

```bash
curl -s https://<your-host>/healthz                     # -> ok
curl -s https://<your-host>/ | grep -o 'assets/index-[^"]*\.js'
curl -s https://<your-host>/assets/index-XXXX.js | grep -c 'localhost:3000'   # must be 0
```

Or in the browser: DevTools → Network → the login request must go to
`https://<backend-host>/auth/login`.

---

## 6. Preview — Netlify

**Where:** Site configuration → **Environment variables**. Each variable has
scopes: *All*, *Production*, *Deploy previews*, *Branch deploys*. Previews are
built by Netlify's own builders, so a Railway variable is **not** visible here —
the same value must be entered twice, once per host.

Recommended scopes:

| Variable | Scope | Why |
| --- | --- | --- |
| `VITE_API_URL` | *Deploy previews* (or *All*) | previews must build; point them at the production API, or at a staging API if you have one |
| `VITE_GOOGLE_CLIENT_ID` | *All* | otherwise the Google button vanishes in previews |
| `VITE_SUPPORT_*` | *All* | optional |

Build settings live in `netlify.toml` (committed), so the panel only holds
values:

```toml
[build]
  command = "npm run build"
  publish = "dist"
[build.environment]
  NODE_VERSION = "22"
```

Useful Netlify specifics:

* **Google OAuth origins.** Google requires the preview host in *Authorized
  JavaScript origins* of the client id. `https://deploy-preview-28--<site>.netlify.app`
  differs per PR; add the site wildcard or accept that Google login only works on
  production and the base preview URL.
* **Cache.** Netlify caches dependencies between builds. If a variable you just
  added seems ignored, use **Deploys → Trigger deploy → Clear cache and deploy
  site**.
* **Per-PR override.** A single preview can be pointed elsewhere for testing by
  changing the variable's scope temporarily, or by setting a branch-specific
  value under *Branches*.
* **Forks** never receive environment variables, so a PR from a fork reports a
  failed build. That is expected; the guard is doing its job.

No `public/_redirects` file exists — the SPA fallback is the `[[redirects]]` rule
in `netlify.toml`.

---

## 7. CI — GitHub Actions

`.github/workflows/ci.yml` defines a file-level `env:` with a **placeholder**:

```yaml
env:
  VITE_API_URL: https://api.example.com
```

CI builds with a dummy host on purpose: the job proves that `npm run lint`,
`tsc -b` and `vite build` all pass, not that a specific backend is reachable. No
real values belong in the workflow file — anyone who can read the repository can
read them.

A green CI build therefore does **not** mean the deployed environment is
configured. That is checked per host, with the commands in §5 and §8.

---

## 8. Verifying that a deploy got the values

```bash
# 1. The guard: a build with no variable must fail
mv .env /tmp/env.bak
npm run build                                        # expect exit 1

# 2. A build with the variable must succeed
VITE_API_URL=https://api.example.com npm run build   # expect "✓ built in …"

# 3. What actually shipped — no localhost, the right host
grep -rl 'localhost:3000' dist/ || echo "clean"
grep -o 'https://[a-z0-9.-]*' dist/assets/*.js | sort -u | head

mv /tmp/env.bak .env
```

For a deployed host, run steps 3 against the live asset URL (§5) or check the
Network tab. A stale CDN asset is the usual reason a freshly set variable "does
not work": the old bundle is still being served.

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Build fails: `VITE_API_URL is not set` | variable missing in that environment | add it in Railway *Variables* / Netlify *Environment variables*, then redeploy |
| `npm run build` fails locally but `npm run dev` works | dev-only fallback, no local variable | `VITE_API_URL=… npm run build`, or add `.env.local` |
| Browser calls `http://localhost:3000` in production | bundle built without the variable (older commit) | redeploy the current commit with the variable set; verify with §8 |
| Google button missing on the deployed site | `VITE_GOOGLE_CLIENT_ID` unset (or only in local `.env`) | set it on both hosts; rebuild |
| Support cards vanished | `VITE_SUPPORT_*` unset | set the channels you actually answer |
| `Mixed Content` errors in console | `http://` API URL on an `https://` page | use `https://` |
| Requests hit `/auth/login` but the API is under `/api` | path suffix in `VITE_API_URL` | use the origin only; the client adds the path |
| Double slashes in URLs (`//quotes`) | trailing slash in the value | none — `config.ts` strips it, but keep it clean |
| Change in a host panel has no effect | values are inlined at build time | redeploy / clear cache, then hard-refresh |
| `process.env.VITE_API_URL is undefined` | only `import.meta.env` exists in the bundle | import `API_URL` from `services/config.ts` |
| CI green, production broken | CI uses a placeholder host | configure the host variable (§5, §6) |
| Preview build fails on a fork PR | forks get no environment variables | expected — merge to a branch to get a preview |

---

## 10. Security rules

* **`VITE_*` is public.** It ships to every visitor inside the JS bundle.
  Backend secrets, API keys with write scope, database URLs: never here.
* **Never commit values.** `.env` and `.env.local` are ignored; `.env.example`
  holds names and comments only.
* **A committed `.env` is a deployment bug**, not a tidiness issue: Vite loads it
  during every build, so both hosts silently inherit its contents. `.env` was
  tracked until #10 and re-enabled a Google client id that #11 was gating.
  `git ls-files | grep -x .env` must stay empty.
* **Values remain in git history.** The identifier committed previously was a
  public Google client id (not a secret), so no rotation is required — but if a
  real secret ever lands in a `VITE_*` value, treat it as leaked and rotate it.
* **Only `src/services/config.ts` reads `import.meta.env`.** Adding a second
  reader re-introduces the scattered fallbacks #7 removed; add the variable there
  instead.

---

## 11. Checklist

Before a deploy:

- [ ] `VITE_API_URL` set in the target host, as an origin (`https://host`)
- [ ] optional variables set on **both** hosts if they should appear everywhere
- [ ] `npm run lint` → 0
- [ ] `VITE_API_URL=… npm run build` → `✓ built in …`
- [ ] `git ls-files | grep -x .env` → empty

After a deploy:

- [ ] `/healthz` → `ok` (Railway)
- [ ] the served bundle contains the expected host and no `localhost:3000`
- [ ] Google button / support channels appear exactly as configured
- [ ] an authenticated request reaches the expected backend origin
