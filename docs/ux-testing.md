# Comprobaciones UX y accesibilidad (Windows + WSL)

Las pruebas no usan el backend de producción ni crean reservas: interceptan las llamadas y usan un servicio ficticio. Los resultados de axe son una revisión automatizada, no una certificación de accesibilidad ni sustituyen pruebas manuales, lectores de pantalla o validación de datos de producto.

## Preparación (una vez)

En una terminal WSL, dentro del repositorio y la rama del PR:

```bash
node --version                 # Node >=22.12 y <23
npm ci
npx playwright install --with-deps chromium
```

El último comando descarga Chromium y puede solicitar la contraseña de administrador para instalar dependencias de Linux. Requiere acceso a la red y espacio en disco. En caso de ya tener las dependencias de Linux, `npm run test:ux:install` instala solo el navegador.

## Ejecutar todo

```bash
./scripts/check-ux.sh
```

Ejecuta lint, build con una URL de ejemplo y la suite de Playwright. Retorna código distinto de cero si alguna comprobación falla. Para ejecutar solo el navegador: `npm run test:ux`. El servidor se inicia y detiene automáticamente en `127.0.0.1:4178`; libera ese puerto antes de ejecutar.

En `test-results/` se generan capturas de la página principal y evidencia de errores; esta carpeta está ignorada por Git. La suite comprueba vista 375/1440, ausencia de desbordamiento horizontal, búsqueda, CTA, drawer y gestión de foco, modal de reserva, y reglas axe WCAG A/AA en inicio, login, reserva, registro de proveedor y soporte. El catálogo y servicios de terceros están simulados/bloqueados; las imágenes externas pueden aparecer vacías. No prueba pago, datos reales ni la reserva end-to-end contra el backend.

## Revisión manual adicional

1. `VITE_API_URL=http://localhost:3000 npm run dev -- --host 0.0.0.0` y abrir la URL que indique Vite en el navegador de Windows. Usar un backend de pruebas si se quiere revisar catálogo real; no usar datos ni acciones de producción.
2. En DevTools (`F12`, `Ctrl+Shift+M`), revisar a 375 × 900 y 1440 × 900; usar `Ctrl+Shift+P` → `Capture full size screenshot` para capturas con los recursos reales disponibles.
3. Comprobar con teclado y lector de pantalla: foco visible, orden de navegación, nombres y estados; abrir/cerrar el drawer y modal con teclado, y verificar que vuelve el foco. Revisar zoom y movimiento reducido.
4. Ejecutar Lighthouse en móvil y escritorio con red comparable; registrar LCP, CLS y transferencia. El tamaño del bundle no demuestra por sí solo una mejora percibida.
5. Revisar con producto la procedencia de estadísticas, precios, perfiles y citas antes de presentarlos como datos reales; definir instrumentación y consentimiento antes de medir clics o reservas.

## WSL: ejecución lenta

Si el primer acceso agota el tiempo de espera y el proyecto está en `/mnt/c`, especialmente en una carpeta sincronizada con OneDrive, el acceso al sistema de archivos puede hacer más lenta la transformación inicial de Vite. La primera prueba espera hasta 120 segundos y sigue comprobando explícitamente el contenido y la accesibilidad. Si persiste, considera trabajar en una copia dentro del sistema de archivos Linux de WSL (por ejemplo `~/proyectos/taskpro-frontend`), instalar allí las dependencias con `npm ci` y volver a ejecutar. Antes de cambiar de copia, guarda tus cambios y transfiere tu configuración local de manera segura; no subas `.env.local` a Git.
