# Sistema de diseño TaskPro — base inicial

Estado: **provisional**. Parte de los componentes aún utilizan clases existentes, y se requiere un inventario visual y revisión de contraste antes de usar esto como especificación completa de toda la aplicación. Referencia de la auditoría: `docs/homepage-ux-audit.md`.

## Tokens disponibles

Definidos en `src/styles/globals.css`: `--tp-color-primary` #42116f, `--tp-color-secondary` #facc15, `--tp-color-text` #1a1a1a, `--tp-color-surface` #fff, `--tp-color-background` #f7f5fb, success #166534, warning #854d0e, error #b91c1c, info #1d4ed8. Espacio: 1=4px, 2=8px, 4=16px, 6=24px. Radio de control 12px y tarjeta 16px; sombra de tarjeta `0 1px 3px rgb(31 16 44 / .1)`.

La familia actual declarada en estilos globales es Inter con fallbacks del sistema; `index.html` también solicita Plus Jakarta Sans, cuya aplicación debe verificarse. Escala objetivo: caption 12px, body 14–16px, h3 16–18px, h2 24–30px y display 30–48px; pesos 400, 600, 700, 800–900. Estos valores reflejan el uso existente y deben verificarse en navegador. Niveles z: contenido normal 0; drawer modal en top layer nativa; no aplicar z-index arbitrarios sobre él.

## Componentes y uso

| Nombre | Uso y propiedades | Estados / restricciones |
| --- | --- | --- |
| Button/Primary | `.tp-button-primary`, fondo amarillo; acción principal del hero y búsqueda. | Default, hover, active, disabled y focus-visible implementados. No usar para una acción sin destino real. |
| Button/Text | Acción secundaria con texto descriptivo. | Hover y focus visible; disabled si aplica. No usar solo por color para transmitir estado. |
| Button/Icon | Acción compacta, tamaño táctil suficiente. | Nombre accesible obligatorio, foco visible, `aria-pressed` si es conmutador; nunca confiar solo en el icono. |
| Input/Search | Campo etiquetado; resultados asociados a búsqueda. | Default, focus, error/disabled cuando aplique. No depender exclusivamente del placeholder. |
| Card/Metric, Service, Person, Appointment | Agrupar contenido relacionado con heading y acción identificable. | Sin estados interactivos si la tarjeta no es interactiva; no presentar datos ficticios como verificados. |
| Heading/Display, Section, Card | Una jerarquía lógica por página y sección. | No elegir nivel solo por tamaño visual. |
| Banner/Hero, Promo | Mensaje y CTA contextual. | Contraste suficiente; evitar reclamos no verificados. |
| Badge/Status, Category | Texto visible además del color. | No usar solo color para comunicar estado. |
| List/Person, Appointment | Lista de elementos con información y acciones asociadas. | Orden lógico y controles accesibles. |
| Embed/Map | Mapa con `title`, carga diferida. | No debe ser la única forma de acceder a información. |
| Navigation/Topbar, Drawer | Título y navegación; drawer modal nativo en móvil. | Abrir/cerrar, Escape, foco y nombre accesible; mantener navegación de escritorio. |
| Profile/Summary | Nombre y rol, sin afordancia de menú si no existe. | No presentar un control como clicable sin acción. |
| Dialog/Booking | Recopilar detalles de reserva con `<dialog>` nativo. | Foco, cierre con Escape y retorno al control verificados por Playwright; revisar con lector de pantalla. |

## Composición y responsive

Espaciar por múltiplos de 4px; usar 16–24px entre componentes y una jerarquía clara por sección. Debajo de 768px usar drawer; a partir de 768px mantener sidebar. Evitar scroll horizontal y conservar la acción principal visible. No duplicar el objetivo principal en todos los bloques sin justificación.

## Checklist pre-entrega

- Acción y audiencia confirmadas; sin datos o promesas inventados.
- Contraste, labels, foco visible y recorrido por teclado verificados.
- Estados default, hover, focus-visible, active, disabled y error revisados cuando correspondan.
- Desktop y móvil comprobados; sin desbordamiento.
- Componentes y tokens reutilizados; lint, build y pruebas pasan.
- Métricas definidas con privacidad y consentimiento apropiados; no declarar impacto sin medición.

## Especificaciones operativas para inicio

| Componente | Propiedades | Estados y medidas verificables |
| --- | --- | --- |
| Button/Primary | Amarillo `--tp-color-secondary`, texto `--tp-color-text`, radio 12px, padding 12px 28px, peso 800; hero y envío de búsqueda. | `.tp-button-primary` define default, hover `#fde047`, active `#eab308`, disabled 50% y cursor; foco de 3px con separación 3px. |
| Button/Text | Texto morado oscuro sobre fondo claro, sin fondo; navegación secundaria a catálogo o perfil. | Foco visible; usar `<button>` si ejecuta una acción o `<a>` para navegar. No usar para un control sin acción. |
| Button/Icon | Icono con etiqueta accesible, objetivo de al menos 44px cuando sea posible; favorito usa `aria-pressed`. | Default, hover y foco; el nombre debe indicar acción y objeto. No usar color como único estado. |
| Input/Search | Campo de texto etiquetado, borde redondeado de 12–16px; hero y barra desktop. | Entrada normal y foco visible; resultados vacíos tienen texto explícito. El placeholder no sustituye al nombre accesible. |
| Card/Metric, Service, Person, Appointment | Superficie blanca, radio 16px, borde claro y sombra leve; espaciado interior de 16–24px. | Los elementos de demostración están identificados; no simular interactividad en todo el contenedor. |
| Heading/Display, Section, Card | Display 30px móvil/48px desktop, sección 24–30px, tarjeta 16px; pesos 700–900. | Preservar orden semántico y contraste; no asignar niveles por apariencia. |
| Banner/Hero, Promo | Gradiente morado, radio 28px/16px y texto claro; el hero incluye el CTA principal. | No cubrir contenido con decoración; validar contraste sobre todo el degradado. |
| Badge/Status | Texto explícito con fondo contrastante y radio completo; confirmado/pendiente o disponible/ocupado. | No depender solo del color. |
| List/Person, Appointment | Grupos verticales con separaciones de 12–20px, nombre, información secundaria y acción real si existe. | El contenido de ejemplo debe ser identificable; acciones siempre nombradas. |
| Embed/Map | Marco con título accesible, área mínima 300px y carga diferida. | El mapa es de ejemplo; no es condición para acceder al catálogo. |
| Navigation/Topbar, Drawer, Profile/Summary | Barra de 64px móvil/80px desktop; drawer de hasta 320px o 85vw, sidebar desktop de 256px. | Modal con backdrop, Escape, cierre y contención/restauración de foco. Perfil no simula un menú inexistente. |
| Dialog/Booking | `<dialog>` con título accesible, ancho hasta 520px, altura máxima 90dvh y campos asociados. | Foco inicial nativo, Escape, cierre explícito; debe validarse con lectores de pantalla. |

Las variantes de tamaño y estado no incluidas en esta tabla aún no son componentes reutilizables estandarizados; no duplicar controles nuevos con estilos divergentes sin revisar su diseño y registrar la excepción. Mantener la auditoría en `docs/homepage-ux-audit.md` para decisiones todavía no confirmadas.
