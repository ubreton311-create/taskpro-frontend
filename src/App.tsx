import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";

// Componentes Base
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

// Vistas Admin y Proveedor
import ClientsView from "./views/ClientsView";
import BillingView from "./views/BillingView";
import BookingView from "./views/BookingView";
import LoginView from "./views/LoginView";
import RequestQuoteView from "./views/RequestQuoteView";
import ProviderDashboardView from "./views/ProviderDashboardView";
import ProviderOnboardingView from "./views/ProviderOnboardingView";
import AdminDashboardView from "./views/AdminDashboardView";
import StaffView from "./views/StaffView";
import ReportsView from "./views/ReportsView";
import SettingsView from "./views/SettingsView";

// --- DISEÑO PREMIUM ---
import Dashboard from "./views/Dashboard";

// --- NUEVO CATÁLOGO DE PRODUCTOS ---
import CleaningCatalog from "./views/CleaningCatalog";

// --- NUEVO SERVICIO AL CLIENTE ---
import CustomerServiceView from "./views/CustomerServiceView";

// --- NUEVO PERFIL DEL TÉCNICO ---
import TechnicianProfileView from "./views/TechnicianProfileView";

// NUEVOS COMPONENTES DE GPT (Cliente)
import ClientQuotesView from "./components/client/ClientQuotesView";
import ClientCheckoutView from "./components/client/ClientCheckoutView";
import ClientBillingView from "./components/client/ClientBillingView";
import GlobalDashboard from "./views/GlobalDashboard";

import { getCurrentUser } from "./utils/auth";

const routeTitles: Record<string, string> = {
  "/": "Inicio", "/booking": "Solicitar servicio", "/cotizar": "Cotizador Inteligente",
  "/checkout": "Pago Seguro", "/provider": "Panel de Proveedor", "/admin": "Panel de Administración",
  "/onboarding": "Registro de Proveedor", "/services": "Tienda de Productos", "/tracking": "Seguimiento",
  "/support": "Servicio al Cliente", "/clients": "Clientes", "/staff": "Personal", "/reports": "Reportes",
  "/settings": "Configuración", "/quotes": "Mis Cotizaciones"
};

function PlaceholderPage() {
  const location = useLocation();
  const title = routeTitles[location.pathname] ?? "Página no encontrada";
  return (
    <section className="page-section">
      <div className="page-heading"><div><span className="eyebrow">TASK PRO SERVICE</span><h1>{title}</h1><p>Administra y consulta tu operación desde un solo lugar.</p></div></div>
      <div className="content-card empty-state"><div className="empty-state-icon">✦</div><h2>{title}</h2><p>Esta sección está preparada para integrar sus funcionalidades con tu backend.</p></div>
    </section>
  );
}

function HomeRoute() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  if (user?.role === 'ADMIN') {
    return <GlobalDashboard />; 
  }
  if (user?.role === 'PROVIDER') {
    navigate('/provider', { replace: true });
    return null; 
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

// Dejamos la función por si necesitas facturación después, pero la ruta ahora es /support
function BillingRoute() {
  const user = getCurrentUser();
  if (user?.role === 'CLIENT') return <ClientBillingView />;
  return <BillingView />; 
}

function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/quotes" element={<QuotesRoute />} />
            <Route path="/checkout/:quoteId" element={<CheckoutRoute />} />
            <Route path="/booking" element={<BookingView />} />
            <Route path="/cotizar" element={<RequestQuoteView />} />
            
            <Route path="/provider" element={<ProviderDashboardView />} />
            
            <Route path="/services" element={<CleaningCatalog />} />
            
            <Route path="/support" element={<CustomerServiceView />} />
            
            {/* AQUI ESTA LA NUEVA RUTA DEL TECNICO */}
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
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/onboarding" element={<ProviderOnboardingView />} /> 
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
