import { Menu, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import { getCurrentUser } from "../utils/auth";
import { getRouteTitle } from "../utils/routeTitles";

export default function Topbar({ onOpenMenu, menuOpen }: { onOpenMenu: () => void; menuOpen: boolean }) {
  const user = getCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role === "ADMIN" ? "Administrador" : user?.role === "PROVIDER" ? "Proveedor" : "Cliente";
  const displayName = user?.name || "Usuario Demo";

  return (
    <header className="tp-topbar flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 md:h-20 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onOpenMenu} aria-label="Abrir menú" aria-expanded={menuOpen} aria-controls="mobile-navigation" className="rounded-lg p-2 text-[#42116f] hover:bg-purple-50 md:hidden">
          <Menu size={24} aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <p className="hidden text-[11px] font-bold uppercase tracking-wider text-gray-500 md:block">TaskPro / {role}</p>
          <p className="truncate text-lg font-black leading-tight text-[#42116f] md:mt-1 md:text-xl">{getRouteTitle(location.pathname)}</p>
        </div>
        <form className="relative ml-6 hidden lg:block" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); navigate(`/?q=${encodeURIComponent(String(data.get("q") || "").trim())}#popular-services`); }}>
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} aria-hidden="true" />
          <input name="q" type="search" aria-label="Buscar servicios" placeholder="Buscar en TaskPro..." className="w-72 rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-[#7a2fbf] focus:bg-white" />
        </form>
      </div>
      <div className="hidden items-center gap-4 md:flex">
        <LanguageSwitcher />
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7a2fbf] font-bold text-white" aria-hidden="true">{displayName.charAt(0).toUpperCase()}</div>
          <div><p className="text-sm font-bold text-gray-900">{displayName}</p><p className="text-xs text-gray-600">{role}</p></div>
        </div>
      </div>
    </header>
  );
}
