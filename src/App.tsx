import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";

// Componentes Base
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

const ClientsView = lazy(() => import("./views/ClientsView"));
const BillingView = lazy(() => import("./views/BillingView"));
const BookingView = lazy(() => import("./views/BookingView"));
const LoginView = lazy(() => import("./views/LoginView"));
const RequestQuoteView = lazy(() => import("./views/RequestQuoteView"));
const ProviderDashboardView = lazy(() => import("./views/ProviderDashboardView"));
const ProviderOnboardingView = lazy(() => import("./views/ProviderOnboardingView"));
const AdminDashboardView = lazy(() => import("./views/AdminDashboardView"));
const StaffView = lazy(() => import("./views/StaffView"));
const ReportsView = lazy(() => import("./views/ReportsView"));
const SettingsView = lazy(() => import("./views/SettingsView"));
const Dashboard = lazy(() => import("./views/Dashboard"));
const CleaningCatalog = lazy(() => import("./views/CleaningCatalog"));
const CustomerServiceView = lazy(() => import("./views/CustomerServiceView"));
const TechnicianProfileView = lazy(() => import("./views/TechnicianProfileView"));
const ClientQuotesView = lazy(() => import("./components/client/ClientQuotesView"));
const ClientCheckoutView = lazy(() => import("./components/client/ClientCheckoutView"));
const ClientBillingView = lazy(() => import("./components/client/ClientBillingView"));
const GlobalDashboard = lazy(() => import("./views/GlobalDashboard"));

import { getCurrentUser } from "./utils/auth";

import { getRouteTitle } from "./utils/routeTitles";

function PlaceholderPage() {
  const location = useLocation();
  const title = getRouteTitle(location.pathname);
  return (
    <section className="page-section">
      <div className="page-heading"><div><span className="eyebrow">TASK PRO SERVICE</span><h1>{title}</h1><p>Administra y consulta tu operación desde un solo lugar.</p></div></div>
      <div className="content-card empty-state"><div className="empty-state-icon">✦</div><h2>{title}</h2><p>Esta sección está preparada para integrar sus funcionalidades con tu backend.</p></div>
    </section>
  );
}

function HomeRoute() {
  const user = getCurrentUser();

  if (user?.role === 'ADMIN') {
    return <GlobalDashboard />; 
  }
  if (user?.role === 'PROVIDER') {
    return <Navigate to="/provider" replace />;
  }
  return <Dashboard />;
}

function QuotesRoute() {
  const navigate = useNavigate();
  return <ClientQuotesView onPay={(id) => navigate(`/checkout/${id}`)} />;
}

function CheckoutRoute() {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  if (!quoteId) return <Navigate to="/quotes" replace />;
  return <ClientCheckoutView quoteId={quoteId} onBack={() => navigate('/quotes')} />;
}

function BillingRoute() {
  const user = getCurrentUser();
  if (user?.role === 'CLIENT') return <ClientBillingView />;
  return <BillingView />; 
}

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const location = useLocation();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog.open) dialog.close();
    const previousOverflow = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menuOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = () => { if (media.matches) setMenuOpen(false); };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    // El contenedor principal: min-h-screen permite scroll en celular.
    // En pantallas md (tablet/web), h-screen y flex-row para layout de escritorio.
    <div className="flex min-h-screen w-full flex-col bg-gray-50 md:h-screen md:flex-row md:overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:p-3 focus:text-purple-900">Saltar al contenido</a>
      <div className="hidden shrink-0 md:block"><Sidebar /></div>
      <dialog id="mobile-navigation" ref={dialogRef} aria-label="Navegación principal" onClose={() => setMenuOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setMenuOpen(false); }} onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')).filter((element) => element.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }} className="mobile-drawer">
        <Sidebar mobile onClose={() => setMenuOpen(false)} />
      </dialog>
      <div className="flex w-full flex-1 flex-col overflow-hidden">
        <Topbar menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />
        {/* El main con overflow-y-auto para que el contenido scrollee independientemente */}
        <main id="main-content" key={location.pathname} tabIndex={-1} className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/quotes" element={<QuotesRoute />} />
            <Route path="/checkout/:quoteId" element={<CheckoutRoute />} />
            <Route path="/booking" element={<BookingView />} />
            <Route path="/cotizar" element={<RequestQuoteView />} />
            
            <Route path="/provider" element={<ProviderDashboardView />} />
            
            <Route path="/services" element={<CleaningCatalog />} />
            
            <Route path="/support" element={<CustomerServiceView />} />
            
            <Route path="/technician/:id" element={<TechnicianProfileView />} />
            
            <Route path="/admin" element={<AdminDashboardView />} /> 
            <Route path="/staff" element={<StaffView />} />
            <Route path="/reports" element={<ReportsView />} />
            <Route path="/clients" element={<ClientsView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/billing" element={<BillingRoute />} />
            
            <Route path="/tracking" element={<PlaceholderPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div role="status" className="p-6">Cargando…</div>}><Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/onboarding" element={<ProviderOnboardingView />} /> 
        <Route path="/*" element={<AppLayout />} />
      </Routes></Suspense>
    </BrowserRouter>
  );
}