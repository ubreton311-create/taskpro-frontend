# Auditoría de inicio del cliente — trabajo en curso

Objetivo confirmado: iniciar una solicitud de servicio. Alcance confirmado: variante de cliente de `/`. Barra móvil aprobada: menú y título visibles, idioma y perfil en el drawer.

## Fase 1 — hallazgos por inspección de código (no sustituye auditoría visual)

| ID | Área | Hallazgo | Impacto en conversión | Gravedad | Esfuerzo |
| --- | --- | --- | --- | --- | --- |
| UX-01 | Navegación | Antes, el sidebar ocupaba el ancho sobre el contenido en móvil. | [SUPUESTO] Oculta la propuesta y retrasa el inicio de solicitud. | Alta | Medio |
| UX-02 | CTA | El hero no tenía acceso directo a solicitud; el botón de cada tarjeta solo registraba en consola. | La acción esperada no llevaba al flujo de reserva. | Alta | Bajo |
| UX-03 | Búsqueda | El filtro era inmediato, pero enviar el formulario solo escribía en consola. | [SUPUESTO] El usuario puede no percibir el resultado. | Media | Bajo |
| UX-04 | Confianza | Hay métricas, técnicos, citas y precios de demostración en la vista. | [SUPUESTO] Datos no verificados pueden reducir confianza. | Alta | Alto |
| UX-05 | Carga | Las rutas estaban importadas de forma eager. | [SUPUESTO] El código innecesario puede retrasar la primera interacción. | Media | Medio |
| UX-06 | Reserva | Etiquetas visuales no estaban asociadas a sus controles y los errores de catálogo podían quedar ocultos. | [SUPUESTO] Dificulta continuar, especialmente con lector de pantalla. | Alta | Medio |

No se ha podido realizar todavía la revisión visual a 1440 y 375 px, las capturas ni las pruebas con tecnologías de asistencia: el navegador disponible en el entorno carece de bibliotecas del sistema. Gravedad y esfuerzo son estimaciones; no se ha medido la conversión. La validación con datos reales depende de #32 y de las condiciones del backend.

## Fase 2 — inventario inicial por código

| Componente actual | Variantes/ubicación | Mapeo propuesto |
| --- | --- | --- |
| Botones amarillos | Hero, búsqueda, tarjetas y promoción | Button/Primary |
| Botones de texto morado | Encabezados de secciones y perfiles | Button/Text |
| Botones de icono | Favoritos, añadir servicio y navegación | Button/Icon con nombre accesible |
| Campo de búsqueda | Hero; fondo blanco y bordes redondeados | Input/Search |
| Encabezados | Hero, secciones y tarjetas | Heading/Display, Heading/Section, Heading/Card |
| Tarjetas | Indicadores, servicios, técnicos y citas | Card/Metric, Card/Service, Card/Person, Card/Appointment |
| Banners | Hero y promoción premium | Banner/Hero, Banner/Promo |
| Estado y badges | Disponibilidad, cita, premium y confianza | Badge/Status y Badge/Category |
| Lista / timeline | Técnicos y próximas citas | List/Person y List/Appointment |
| Mapa embebido | Técnicos cercanos | Embed/Map |
| Navegación y perfil | Barra y sidebar/drawer | Navigation/Topbar, Navigation/Drawer, Profile/Summary |
| Modal de reserva | Flujo `/booking`, no directamente en inicio | Dialog/Booking; verificar foco y cierre |

La estandarización completa de todas las variantes y estados, sus medidas reales, y el inventario visual deben completarse después de la revisión en navegador. `DESIGN.md` registra la base disponible, no una certificación de que toda la aplicación la utilice.

## Cambios implementados y validación pendiente

- CTA «Solicitar servicio» y tarjetas conducen a `/booking`; la selección específica no se transfiere, por lo que el usuario la elige allí. Medir clics al CTA y reservas completadas, con consentimiento y analítica aprobada; aún no se instrumentó ni se midió.
- La búsqueda desplaza a los resultados filtrados. El drawer libera la primera pantalla móvil.
- Las rutas cargan por demanda. El build local pasó de 872.69 kB en un solo chunk a un entry de ~275 kB; validar transferencia y rendimiento real en navegador.
- Se mejoraron etiquetas y error visible en reserva; quedan pendientes auditoría de teclado completa, contraste y revisión de otras páginas (#22).
