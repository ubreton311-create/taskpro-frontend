import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  CalendarPlus, 
  FileText, 
  ShoppingBag, 
  Headphones, 
  LogOut
} from "lucide-react";
import { getCurrentUser } from "../utils/auth";

export default function Sidebar() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("taskpro-language");
    localStorage.removeItem("taskpro-token");
    navigate("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#42116f] text-white">
      {/* LOGO */}
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 font-black text-[#42116f]">
          T
        </div>
        <div>
          <h1 className="text-lg font-black leading-tight tracking-wider">
            TASKPRO
          </h1>
          <p className="text-[10px] font-bold tracking-widest text-purple-200">
            SERVICE
          </p>
        </div>
      </div>

      {/* MENÚ PRINCIPAL */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-purple-300">
          Menú principal
        </p>

        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
              isActive ? "bg-white/10 text-yellow-400" : "text-purple-100 hover:bg-white/5"
            }`
          }
        >
          <LayoutDashboard size={20} />
          Inicio
        </NavLink>

        <NavLink
          to="/booking"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
              isActive ? "bg-white/10 text-yellow-400" : "text-purple-100 hover:bg-white/5"
            }`
          }
        >
          <CalendarPlus size={20} />
          Solicitar servicio
        </NavLink>

        <NavLink
          to="/cotizar"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
              isActive ? "bg-white/10 text-yellow-400" : "text-purple-100 hover:bg-white/5"
            }`
          }
        >
          <FileText size={20} />
          Cotizador
        </NavLink>

        <NavLink
          to="/services"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
              isActive ? "bg-[#facc15] text-[#42116f] shadow-sm" : "text-purple-100 hover:bg-white/5"
            }`
          }
        >
          <ShoppingBag size={20} />
          Productos
        </NavLink>

        <NavLink
          to="/support"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
              isActive ? "bg-white/10 text-yellow-400" : "text-purple-100 hover:bg-white/5"
            }`
          }
        >
          <Headphones size={20} />
          Servicio al Cliente
        </NavLink>
      </div>

      {/* SECCIÓN INFERIOR (USUARIO) */}
      <div className="mt-auto p-4">
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 to-yellow-500 text-lg font-black text-[#42116f] shadow-lg">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{user?.name || "Usuario Demo"}</p>
            <p className="truncate text-xs font-semibold text-[#facc15] uppercase tracking-wider">{user?.role || "Cliente"}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#5a189a] px-3 py-3 text-sm font-bold text-white transition hover:bg-red-500 hover:border-red-500"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}