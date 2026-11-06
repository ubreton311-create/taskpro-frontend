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
const PORT = Number(process.env.PORT) || 4173;
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

// Extensiones que jamás deben caer al fallback SPA: si el archivo no existe, es un 404 real.
const STATIC_EXTENSIONS = new Set(Object.keys(MIME));

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

  // Base fija y sin datos del cliente: un Host manipulado no puede provocar ERR_INVALID_URL.
  // URL malformada y decodificación fallida se tratan igual: 400, nunca una excepción sin capturar.
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }).end("Bad Request");
    return;
  }

  // NUL y otros bytes de control rompen las APIs de fs (ERR_INVALID_ARG_VALUE).
  if (pathname.includes("\0")) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }).end("Bad Request");
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

  // Un asset que no existe es un 404, no el index.html: devolver HTML con 200 en
  // /assets/*.js solo provoca errores crípticos de MIME en el navegador.
  const ext = extname(pathname).toLowerCase();
  if (pathname.startsWith("/assets/") || STATIC_EXTENSIONS.has(ext)) {
    res
      .writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" })
      .end("Not Found");
    return;
  }

  // Fallback SPA: solo para rutas de la aplicación (/quotes, /checkout/123, ...).
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
