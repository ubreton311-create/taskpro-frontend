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
| Dialog/Booking | Recopilar detalles de reserva. | **Pendiente:** gestión modal de foco y cierre por teclado, dentro de #22. |

## Composición y responsive

Espaciar por múltiplos de 4px; usar 16–24px entre componentes y una jerarquía clara por sección. Debajo de 768px usar drawer; a partir de 768px mantener sidebar. Evitar scroll horizontal y conservar la acción principal visible. No duplicar el objetivo principal en todos los bloques sin justificación.

## Checklist pre-entrega

- Acción y audiencia confirmadas; sin datos o promesas inventados.
- Contraste, labels, foco visible y recorrido por teclado verificados.
- Estados default, hover, focus-visible, active, disabled y error revisados cuando correspondan.
- Desktop y móvil comprobados; sin desbordamiento.
- Componentes y tokens reutilizados; lint, build y pruebas pasan.
- Métricas definidas con privacidad y consentimiento apropiados; no declarar impacto sin medición.
