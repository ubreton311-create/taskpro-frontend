const routeTitles: Record<string, string> = {
  "/": "Inicio", "/booking": "Solicitar servicio", "/cotizar": "Cotizador Inteligente",
  "/checkout": "Pago Seguro", "/provider": "Panel de Proveedor", "/admin": "Panel de Administración",
  "/onboarding": "Registro de Proveedor", "/services": "Tienda de Productos", "/tracking": "Seguimiento",
  "/support": "Servicio al Cliente", "/clients": "Clientes", "/staff": "Personal", "/reports": "Reportes",
  "/settings": "Configuración", "/quotes": "Mis Cotizaciones", "/billing": "Facturación", "/technician": "Perfil del técnico",
};

export function getRouteTitle(path: string) {
  return routeTitles[path] ?? routeTitles[`/${path.split("/")[1]}`] ?? "Página no encontrada";
}
