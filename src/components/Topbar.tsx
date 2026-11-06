import { getCurrentUser } from "../utils/auth";
import { Bell, Search, ChevronDown } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLocation } from "react-router-dom";

export default function Topbar() {
  const user = getCurrentUser();
  const location = useLocation();
  
  const displayName = user?.name || "Usuario Demo";
  const role = user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'PROVIDER' ? 'Proveedor' : 'Cliente';
  
  const path = location.pathname;
  let pageTitle = "Inicio";
  if (path === "/services") pageTitle = "Productos";
  else if (path === "/support") pageTitle = "Servicio al Cliente";
  else if (path === "/booking") pageTitle = "Solicitar Servicio";
  else if (path === "/cotizar") pageTitle = "Cotizador";
  else if (path === "/quotes") pageTitle = "Mis Cotizaciones";

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6">
      
      {/* IZQUIERDA: TÍTULO DE LA PÁGINA Y BUSCADOR */}
      <div className="flex items-center gap-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            TaskPro / {role}
          </p>
          <h1 className="text-xl font-black text-[#42116f] leading-none mt-1">
            {pageTitle}
          </h1>
        </div>

        <div className="relative hidden lg:block ml-6">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar en TaskPro..." 
            className="w-72 rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-[#7a2fbf] focus:bg-white transition-all" 
          />
        </div>
      </div>

      {/* DERECHA: IDIOMA, NOTIFICACIONES, PERFIL */}
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        
        <button className="relative rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-gray-100 transition">
          <Bell size={20} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-gray-200 pl-4 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7a2fbf] font-bold text-white shadow-md">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-gray-900 leading-none">{displayName}</p>
            <p className="text-xs text-gray-500 mt-1">{role}</p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}