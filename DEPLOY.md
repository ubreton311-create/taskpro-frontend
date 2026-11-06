# Despliegue en Railway: qué falló y cómo quedó resuelto

> Rama de trabajo: `arena/db33f188-taskpro-frontend` · Repo: `ubreton311-create/taskpro-frontend`

---

## 1. El mensaje de Railway no era la causa

La captura muestra:

```
Build › Build image · FAILED (00:53)
Failed to build an image. Please check the build logs for more details.
```

Ese texto es **solo el mensaje genérico**. Railway no “compila” nada por su cuenta: ejecuta el
**Build Command** del servicio. Si ese comando termina con código de salida distinto de `0`,
Railway no puede construir la imagen y marca el paso `Build image` como fallido. El error real
**siempre** está en `View logs → pestaña Build`.

En este proyecto el Build Command es el que define `package.json`:

```bash
npm run build   →   tsc -b && vite build
```

Y ahí estaba el problema.

## 2. La causa real (reproducida localmente)

Ejecutando el mismo comando que Railway, el paso de TypeScript terminaba con **~60 errores**:

```
src/main.tsx(93,10): error TS6133: 'BillingRoute' is declared but its value is never read.
src/schemas/cleaning.ts(1,565): error TS2353: 'conditionalOn' does not exist in type 'SelectField'.
src/views/CheckoutView.tsx(144,11): error TS2322: Property 'total' does not exist ...
src/views/ProviderDashboardView.tsx(97,9): error TS2322: Property 'onAccept' does not exist ...
src/components/admin/GlobalDashboard.tsx(23,20): error TS2339: Property 'getStats' does not exist ...
...
```

`tsc -b` devuelve código 1 → `vite build` nunca corre → **no existe `dist/`** → no hay imagen →
el servicio queda `Service offline`.

> Dato clave: el despliegue falla **igual** en tu máquina. Es un problema del código, no de Railway,
> de la tarjeta, ni del límite del agente de Railway.

### Errores corregidos

| Error | Archivos | Corrección |
| --- | --- | --- |
| `conditionalOn` no existía en los tipos de campo | 12 `src/schemas/*.ts` | Se agregó `conditionalOn?: { field; value }` a `BaseField` en `form-schema.ts` |
| Importaciones y variables declaradas sin usar (TS6133 / TS6196) | `Logo`, `Topbar`, `StaffView`, `SettingsView`, `Dashboard`, `RequestQuoteView`, `ProviderOnboardingView`, `AdminDashboard`, `CustomerServiceView`, `GlobalDashboard`, `BookingView`, `ClientDashboard` | Se eliminaron (el proyecto compila con `noUnusedLocals`) |
| `<CheckoutStep total={...}>` no existe en sus props y faltaba `serviceName` | `views/CheckoutView.tsx` | Se pasa `serviceName`; `CheckoutStep` ya calcula el total |
| `onAccept` no existía en `ProviderDashboard` | `components/ProviderDashboard.tsx` | Se agregó como prop opcional y botón **Aceptar** para órdenes `PENDING` (funcionalidad que la vista ya intentaba usar) |
| `pdfUrl: null` no compatible con `JobOrder.pdfUrl?: string` | `views/ProviderDashboardView.tsx` | Se normaliza a `string \| undefined` |
| `ReviewModal` se usaba con props viejas (`providerName`, `onSubmit(rating, comment)`) | `views/ProviderDashboardView.tsx` | Ahora usa `targetName`, `targetRole="CLIENT"`, `bookingId` y `onSubmit({ bookingId, rating, comment })` con `POST /reviews` |
| `adminApi.getStats()` no existía | `components/admin/GlobalDashboard.tsx` | Se usa `adminDashboardApi.getStats()` (`GET /admin/stats`), que sí existe |
| `quote.title` / `quote.amount` no estaban tipados | `types/client.types.ts`, `ClientQuotesView`, `ClientCheckoutView` | Campos opcionales + fallback a `service.name` / `totalAmount` |
| `BillingRoute` y `ServicesView` declarados sin uso | `main.tsx` | Se conectó `/billing` a `BillingRoute` (la pantalla ya existía) y se quitó el import muerto |
| `http://localhost:3000` hardcodeado | `NegotiationPanel`, `AuthContext`, `CheckoutStep` | Ahora todos usan `VITE_API_URL` |

**Resultado:** `npm run build` termina en verde (`✓ built in 1s`, genera `dist/`).

## 3. Compruébalo tú en 2 comandos

```bash
npm ci          # instala exactamente lo del package-lock (lo mismo que Railway)
npm run build   # debe terminar con "✓ built in ..." y crear dist/
```

Si algo vuelve a fallar, verás el archivo y la línea exactos: eso es lo que tienes que corregir
antes de volver a desplegar.

## 4. Lo que se agregó para que el deploy sea reproducible

| Archivo | Para qué sirve |
| --- | --- |
| `railway.json` | Fija el builder (`NIXPACKS`), el **Build Command** (`npm ci && npm run build`), el **Start Command** (`node scripts/serve.mjs`) y el **healthcheck** en `/healthz`. Railway lo lee solo: dejas de depender de lo que tengas escrito a mano en el panel. |
| `scripts/serve.mjs` | Servidor estático de producción **sin dependencias extra**: sirve `dist/`, hace *fallback* SPA solo en rutas de la app (recargar `/quotes` o `/checkout/123` ya no da 404), devuelve **404 real** si un asset de `/assets/` o un archivo con extensión estática no existe, responde **400** a URLs malformadas o con byte NUL en lugar de tumbar el proceso, expone `/healthz`, escucha en `0.0.0.0:$PORT` y cachea los assets con hash. |
| `package.json` | Nuevos scripts `start` (producción) y `typecheck`, más `engines.node`. |
| `.nvmrc` | Node 22, la misma versión con la que se validó el build. |
| `.env.example` | Documenta todas las variables: `VITE_API_URL` (obligatoria), `VITE_GOOGLE_CLIENT_ID` y los canales opcionales `VITE_SUPPORT_EMAIL` / `VITE_SUPPORT_PHONE` / `VITE_SUPPORT_WHATSAPP`. |
| `.github/workflows/ci.yml` | Ejecuta `typecheck` + `build` en cada push/PR: si algo rompe la compilación lo ves en GitHub, **antes** de gastar un despliegue. |
| `.gitignore` | `*.tsbuildinfo` (el `tsconfig.tsbuildinfo` estaba versionado y puede producir builds con caché vieja; se dejó de trackear). |

> ¿Por qué no `vite preview`? Es una herramienta de previsualización, no un servidor de producción:
> no está pensada para tráfico real ni para healthchecks. `scripts/serve.mjs` cubre lo mismo con 0 dependencias.

## 5. Configuración en Railway (paso a paso)

### 5.1 Variables del servicio del frontend

`Service → Variables`:

| Variable | Valor | Nota |
| --- | --- | --- |
| `VITE_API_URL` | `https://<tu-backend>.up.railway.app` (sin `/` final) | **Se inyecta en tiempo de build y es obligatoria.** Si falta, `npm run build` falla con `VITE_API_URL is not set` (no se despliega una app apuntando a `localhost`). Si la agregas después de desplegar, hay que volver a desplegar. |
| `VITE_GOOGLE_CLIENT_ID` | tu client id de Google | Opcional; sin él el botón de Google no funciona. |
| `NIXPACKS_NODE_VERSION` | `22` | Opcional, refuerza la versión de Node. |

### 5.2 Build & Deploy

`Service → Settings`:

- **Root Directory**: `/` (raíz del repo). Si lo dejas apuntando a una subcarpeta que no existe, el build falla en el primer segundo.
- **Build Command**: `npm ci && npm run build` (o vacío, para que lo tome de `railway.json`).
- **Start Command**: `node scripts/serve.mjs` (o vacío).
- **Healthcheck Path**: `/healthz`.
- **Watch Paths**: opcional; útil si en el futuro el repo se vuelve monorepo.

Después: `Deployments → Deploy latest commit` y luego `Settings → Networking → Generate domain`.

### 5.3 Cómo leer el error la próxima vez (sin el agente de Railway)

1. `Deployments` → clic en el deployment rojo.
2. Botón **`View logs`** (arriba a la derecha de la tarjeta).
3. Pestaña **`Build`**: ahí está el comando que falló y el mensaje real.
   Pestaña **`Deploy`**: errores de arranque (puerto, variables, crash del proceso).

El aviso *“Agent usage limit reached”* solo afecta al asistente automático de Railway; **no**
bloquea la lectura de los logs ni el redeploy.

## 6. Sobre el servicio `taskpro-backend` de tu captura

Importante, para que no pierdas tiempo: **el servicio que falla en la imagen es `taskpro-backend`,
y su último commit es `fix: clean main.ts and correct render commands`**. Ese commit **no existe**
en `taskpro-frontend` (aquí el HEAD es `fix: replace localhost with API_URL in BookingView`), y la
cuenta de GitHub conectada solo tiene acceso a `taskpro-frontend`, `apex-client` y `CRUCE`. Es decir:
**ese servicio apunta a otro repositorio** y su build se arregla en ese repo, no aquí.

Lo que sí quedó resuelto es el frontend, que estaba roto exactamente por lo mismo (el build nunca
generaba `dist/`).

Para el backend, la ruta de diagnóstico es idéntica:

1. `taskpro-backend → Deployments → deployment FAILED → View logs → Build`.
   Las últimas 20 líneas dicen el motivo exacto.
2. Contrasta con esta tabla (causas ~90 % de los `Build image failed` en Node/NestJS):

| Síntoma en el log | Causa | Arreglo |
| --- | --- | --- |
| `npm ci can only install packages when your package.json and package-lock.json are in sync` | lock desactualizado | `npm install` local y commitear `package-lock.json` |
| `error TS2xxx` / `error TS6133` | TypeScript no compila | corregir, o `tsc --noEmit` en CI antes de pushear |
| `Cannot find module '@prisma/client'` / `PrismaClientInitializationError` | cliente Prisma no generado | en el build: `npx prisma generate && npm run build` |
| `Cannot find module 'dist/main'` / `ENOENT: dist/main.js` | el Start Command apunta a un archivo que el build no genera | Start: `node dist/main.js` y verificar `outDir`/`rootDir` en `nest-cli.json` / `tsconfig` |
| El build pasa pero el deploy se cae con `EADDRINUSE` o `ECONNREFUSED` | escucha en un puerto fijo (`3000`) o en `127.0.0.1` | `await app.listen(process.env.PORT ?? 3000, '0.0.0.0')` |
| Deploy “Running” pero healthcheck falla / 502 | CORS, ruta de health inexistente, o el proceso tarda | agregar `GET /health` y apuntar el healthcheck ahí |
| `Render command`/`Start command` inválido (por tu commit) | comando heredado de Render (`web: ...`) que Railway no interpreta igual | usar `railway.json` en vez de comandos a mano |

3. Un `railway.json` de referencia para el backend (si lo necesitas):

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "NIXPACKS", "buildCommand": "npm ci && npm run build" },
  "deploy": {
    "startCommand": "node dist/main.js",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

> Si me compartes las últimas líneas del **Build log** de `taskpro-backend` (o me das acceso a ese
> repo), lo corrijo igual que este.

## 7. Checklist de usabilidad (para no volver a quedarte ciego)

- [x] El build se puede reproducir localmente con `npm ci && npm run build`.
- [x] `railway.json` versionado: el deploy no depende de la configuración manual del panel.
- [x] `/healthz` + healthcheck: Railway reinicia el servicio si se cae, en lugar de dejarlo “offline”.
- [x] Fallback SPA: recargar cualquier ruta interna ya no da 404.
- [x] Assets con hash → caché inmutable; `index.html` nunca se cachea (evita “no se ven mis cambios”).
- [x] CI en GitHub con `typecheck` + `build`: el error aparece antes del despliegue.
- [x] Ninguna URL `localhost` en el código: todo pasa por `src/services/config.ts`.
- [x] Un build sin `VITE_API_URL` **falla** en vez de desplegar una app rota.
- [x] Netlify (previews) descrito en `netlify.toml`; Railway (producción) en `railway.json`.
- [x] `.env` ya no está versionado; `.env.example` documenta cada variable.
- [ ] Pendiente recomendado: dividir el bundle (hoy ~872 kB) con `React.lazy` por ruta.
- [ ] Pendiente recomendado: comprimir `public/favicon.svg` (1.9 MB).

## 8. Entorno y hosts: quién construye qué

> Guía completa de variables por entorno (local, producción, preview, CI),
> verificación y solución de problemas: **[`docs/environment.md`](docs/environment.md)**.

### 8.1 Variables obligatorias

| Variable | Obligatoria | Efecto si falta |
| --- | --- | --- |
| `VITE_API_URL` | **Sí** (build de producción) | El build se detiene con `VITE_API_URL is not set`. En `npm run dev` cae a `http://localhost:3000`. |
| `VITE_GOOGLE_CLIENT_ID` | No | Se oculta el botón de Google; el formulario con correo sigue funcionando. |
| `VITE_SUPPORT_EMAIL` | No | Se oculta el canal de correo en Servicio al Cliente. |
| `VITE_SUPPORT_PHONE` | No | Se oculta el canal telefónico. |
| `VITE_SUPPORT_WHATSAPP` | No | Se oculta el canal de WhatsApp. |

Ningún canal de soporte se muestra "de mentira": si la variable no está, el canal no
se renderiza. Antes había un teléfono `+52 664 000 0000` y un `wa.me` que no llegaban
a nadie.

Las variables `VITE_*` se **inyectan en el bundle** en tiempo de compilación: son
públicas por diseño. No pongas secretos aquí.

### 8.2 Dos hosts, dos configuraciones

| Host | Para qué | Configuración | Fallback SPA |
| --- | --- | --- | --- |
| **Railway** (producción) | Sirve la app a usuarios reales | `railway.json`: build `npm ci && npm run build`, start `node scripts/serve.mjs`, healthcheck `/healthz` | `scripts/serve.mjs` |
| **Netlify** (previews de PR) | Preview por pull request | `netlify.toml`: build `npm run build`, publish `dist`, `NODE_VERSION=22`, redirect `/* → /index.html` | `netlify.toml` |

Ambos hosts leen la misma variable `VITE_API_URL`, pero **cada uno la define en su
propio panel** (`Railway → Variables`, `Netlify → Site settings → Environment
variables`). Si configuras solo uno, el otro falla en el build — que es justamente
el comportamiento buscado.

`public/_redirects` se eliminó: era una regla exclusiva de Netlify duplicada con
`netlify.toml`.

### 8.3 Versión de Node

`package.json#engines` exige `>=22.12 <23`, `.nvmrc` fija `22` y `netlify.toml` fija
`NODE_VERSION=22`. Es el rango que soporta `vite@8`; el pin anterior (`>=20 <23`)
permitía Node 21, que Vite no soporta.

### 8.4 Cómo verificar antes de desplegar

```bash
npm ci
VITE_API_URL=https://tu-backend.up.railway.app npm run build   # debe imprimir "✓ built in ..."
npm run lint                                                   # debe terminar sin errores
node scripts/serve.mjs                                         # sirve dist/ en 0.0.0.0:$PORT
curl -s localhost:4173/healthz                                 # -> ok
```
