# Auditoría de inicio del cliente — trabajo en curso

Objetivo confirmado: iniciar una solicitud de servicio. Alcance confirmado: variante de cliente de `/`. Barra móvil aprobada: menú y título visibles, idioma y perfil en el drawer.

## Fase 1 — auditoría de la captura y del código anterior

**Evidencia visual:** [captura de escritorio proporcionada por el operador](ux-screenshots/homepage-reference-desktop.jpeg), correspondiente al estado anterior a este PR. La imagen muestra una vista de escritorio, pero no confirma el ancho real del viewport ni sus condiciones de carga. No es evidencia de una revisión a 1440 px ni del resultado actual del PR. La prioridad expresa impacto/esfuerzo **estimado**, no un experimento ni una medición de conversión. En esta fase se registran hallazgos, no soluciones.

| Prioridad estimada | ID | Área | Qué pasa y evidencia | Por qué afecta la conversión | Gravedad | Esfuerzo estimado |
| --- | --- | --- | --- | --- | --- | --- |
| 1 · Alto/bajo | UX-02 | CTA principal | En la captura, el elemento más prominente del hero es la búsqueda; «Solicitar servicio» aparece en el sidebar, no como CTA explícito en el hero. El código anterior registraba en consola la acción `+` de las tarjetas. | La acción principal confirmada no es evidente en el hero y la acción de las tarjetas no conducía a la reserva. | Alta | Bajo |
| 2 · Alto/bajo | UX-07 | Legibilidad del hero | El saludo y la descripción se ven con poco contraste sobre el degradado en la imagen. No se ha medido la relación de contraste. | [SUPUESTO] El mensaje puede ser difícil de leer y comprender rápidamente. | Alta | Bajo |
| 3 · Alto/medio | UX-01 | Navegación móvil | La captura solo muestra escritorio. El código anterior apilaba el sidebar de ancho completo antes del contenido debajo de `md`. | [SUPUESTO] En móvil desplaza la propuesta y retrasa el inicio de solicitud. | Alta | Medio |
| 4 · Alto/medio | UX-04 | Confianza | Se muestran cifras concretas, calificaciones, técnicos cercanos y citas; el código anterior incluye valores de respaldo de ejemplo. La captura no demuestra su procedencia. | [SUPUESTO] Presentar información no verificada como real puede deteriorar la confianza necesaria para solicitar servicio. | Alta | Medio |
| 5 · Alto/medio | UX-06 | Formulario de reserva | La captura no muestra el formulario. El código anterior de reserva tenía etiquetas visuales sin asociación a controles y el error de catálogo podía quedar oculto. | [SUPUESTO] Dificulta continuar, especialmente con lector de pantalla o si falla la carga. | Alta | Medio |
| 6 · Medio/bajo | UX-03 | Búsqueda | La captura muestra búsquedas tanto en la barra como en el hero. En el código anterior, enviar el formulario del hero solo escribía en consola; el filtrado ocurría al escribir. | [SUPUESTO] Dos campos de búsqueda y un envío sin feedback explícito pueden generar confusión sobre dónde aparecen resultados. | Media | Bajo |
| 7 · Medio/bajo | UX-08 | Claridad de acciones | Los controles `+`, corazón, campana y chevron se muestran sin etiqueta textual visible; la imagen no permite verificar su nombre accesible ni interacción. | [SUPUESTO] La intención o el resultado de algunos controles puede no ser evidente. | Media | Bajo |
| 8 · Medio/medio | UX-09 | Jerarquía y fricción | Hay acciones para buscar, ver servicios, ver mapa, perfiles, agenda y actualizar plan, además de solicitar servicio en el sidebar. | [SUPUESTO] La competencia entre acciones puede desviar del objetivo de solicitud. | Media | Medio |
| 9 · Medio/medio | UX-10 | Consistencia | Se observan botones amarillos, enlaces de texto, acciones con icono y tarjetas con tratamientos distintos. La captura por sí sola no confirma si las diferencias corresponden a variantes intencionales. | [SUPUESTO] Estilos divergentes para acciones similares pueden dificultar identificar qué es interactivo. | Media | Medio |
| 10 · Medio/medio | UX-05 | Rendimiento percibido | El código anterior importaba rutas de forma eager. Una captura estática no muestra el orden ni el tiempo de carga. | [SUPUESTO] El código innecesario puede retrasar la primera interacción. | Media | Medio |

**Límites de la evidencia:** no se pueden comprobar desde una imagen estática los estados hover/focus/disabled, el foco por teclado, los nombres accesibles, validación de formularios, carga real ni el comportamiento de los enlaces. Quedan pendientes el recorrido móvil a 375 px, la comprobación explícita de escritorio a 1440 px, la medición de contraste y las capturas posteriores. La captura es útil como referencia visual de escritorio, no reemplaza esas pruebas. La validación con datos reales depende de #32 y del backend.

## Fase 2 — inventario inicial por captura y código

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

Los estados interactivos, medidas reales y componentes que solo aparecen después de una interacción no pueden verificarse en la captura; deben completarse mediante revisión en navegador. `DESIGN.md` registra la base disponible, no una certificación de que toda la aplicación la utilice.

## Cambios implementados y validación pendiente

- CTA «Solicitar servicio» y tarjetas conducen a `/booking`; la selección específica no se transfiere, por lo que el usuario la elige allí. Medir clics al CTA y reservas completadas, con consentimiento y analítica aprobada; aún no se instrumentó ni se midió.
- La búsqueda desplaza a los resultados filtrados. El drawer libera la primera pantalla móvil.
- Las rutas cargan por demanda. El build local pasó de 872.69 kB en un solo chunk a un entry de ~275 kB; validar transferencia y rendimiento real en navegador.
- Se mejoraron etiquetas y error visible en reserva; quedan pendientes auditoría de teclado completa, contraste y revisión de otras páginas (#22).
