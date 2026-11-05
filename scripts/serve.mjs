#!/usr/bin/env node
/**
 * Servidor estático mínimo para producción (sin dependencias).
 *
 * - Sirve el contenido de `dist/` (resultado de `npm run build`).
 * - Fallback SPA: cualquier ruta desconocida devuelve index.html,
 *   para que React Router funcione al recargar /quotes, /checkout/123, etc.
 * - Expone /healthz para el healthcheck de Railway.
 * - Escucha en 0.0.0.0 y en el puerto que inyecta la plataforma (PORT).
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const ROOT = resolve(process.cwd(), "dist");
const INDEX = resolve(ROOT, "index.html");
const PORT = Number(process.env.PORT ?? 4173);
const HOST = process.env.HOST ?? "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".pdf": "application/pdf",
};

if (!existsSync(INDEX)) {
  console.error(
    `[serve] No se encontró ${INDEX}. Ejecuta "npm run build" antes de iniciar el servidor.`,
  );
  process.exit(1);
}

function sendFile(res, filePath, statusCode = 200) {
  const ext = extname(filePath).toLowerCase();
  // Los assets con hash son inmutables; el HTML nunca se cachea.
  const cacheControl = filePath.startsWith(resolve(ROOT, "assets") + sep)
    ? "public, max-age=31536000, immutable"
    : "no-cache";

  res.writeHead(statusCode, {
    "Content-Type": MIME[ext] ?? "application/octet-stream",
    "Cache-Control": cacheControl,
    "X-Content-Type-Options": "nosniff",
  });

  if (res.req.method === "HEAD") {
    res.end();
    return;
  }

  createReadStream(filePath)
    .on("error", () => {
      res.destroy();
    })
    .pipe(res);
}

const server = createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end("Method Not Allowed");
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end("Bad Request");
    return;
  }

  if (pathname === "/healthz" || pathname === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }).end("ok");
    return;
  }

  // resolve() + comprobación de prefijo evita path traversal (../../etc/passwd).
  const candidate = resolve(ROOT, `.${pathname}`);
  const isInsideRoot = candidate === ROOT || candidate.startsWith(ROOT + sep);

  if (isInsideRoot && existsSync(candidate) && statSync(candidate).isFile()) {
    sendFile(res, candidate);
    return;
  }

  // Fallback SPA: la respuesta siempre es 200 para no romper el router del cliente.
  sendFile(res, INDEX);
});

server.listen(PORT, HOST, () => {
  console.log(`[serve] TaskPro frontend disponible en http://${HOST}:${PORT}`);
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
