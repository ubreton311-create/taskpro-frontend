import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Clock3, LoaderCircle, RefreshCw, ClipboardList, AlertCircle, MessageSquare } from "lucide-react";
import JobOrderCard, { type JobOrder, type JobOrderStatus } from "../components/JobOrderCard";
import { API_URL } from '../services/config';
import { getErrorMessage, getApiErrorMessage } from '../utils/errors';
import type { ApiQuote } from '../types/api.types';
import ChatBox from "../components/chat/ChatBox"; // <-- IMPORT DEL CHAT
import { getCurrentUser } from "../utils/auth"; // <-- IMPORT DEL USUARIO ACTUAL


const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
};

/** GET /quotes — resolves with the provider's assigned quotes. */
async function fetchProviderQuotes(): Promise<ApiQuote[]> {
  const res = await fetch(`${API_URL}/quotes`, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(getApiErrorMessage(data, "Error al cargar solicitudes"), { cause: data });
  return Array.isArray(data) ? (data as ApiQuote[]) : [];
}

export default function ServicesView() {
  const [quotes, setQuotes] = useState<ApiQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<JobOrderStatus>("PENDING");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // ESTADOS PARA EL CHAT
  const [chatTarget, setChatTarget] = useState<{ id: string; clientName?: string } | null>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    let active = true;
    fetchProviderQuotes()
      .then((data) => { if (active) setQuotes(data); })
      .catch((err: unknown) => { if (active) setError(getErrorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const refresh = () => {
    setLoading(true);
    setError("");
    void fetchProviderQuotes()
      .then(setQuotes)
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  const orders: JobOrder[] = useMemo(() => {
    return quotes.map((q) => ({
      id: q.id,
      clientName: q.client?.name || "Cliente",
      serviceName: q.service?.name || "Servicio",
      address: q.address || "Dirección pendiente",
      scheduledDate: q.scheduledDate ?? "",
      totalAmount: Number(q.totalAmount),
      status: (q.status as JobOrderStatus) || "PENDING",
    }));
  }, [quotes]);

  const filteredOrders = orders.filter((o) => o.status === activeTab);

  const counts = {
    PENDING: orders.filter((o) => o.status === "PENDING").length,
    CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
    COMPLETED: orders.filter((o) => o.status === "COMPLETED").length,
  };

  const handleAction = async (orderId: string, newStatus: JobOrderStatus) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`${API_URL}/quotes/${orderId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Error al actualizar estado");
      setQuotes((prev) => prev.map((q) => q.id === orderId ? { ...q, status: newStatus } : q));
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { id: "PENDING" as JobOrderStatus, label: "Pendientes", icon: Clock3 },
    { id: "CONFIRMED" as JobOrderStatus, label: "Aceptadas", icon: CheckCircle2 },
    { id: "COMPLETED" as JobOrderStatus, label: "Completadas", icon: BriefcaseBusiness },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#7A2FBF]">
            <BriefcaseBusiness className="h-4 w-4" /> Gestión de servicios
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#252136]">Mis solicitudes</h1>
          <p className="mt-2 text-sm text-[#777386]">Administra tus trabajos desde la aceptación hasta su finalización.</p>
        </div>
        <button onClick={refresh} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-[#E8E2F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#393448] shadow-sm transition hover:bg-purple-50 disabled:opacity-60">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Actualizar
        </button>
      </header>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[#ECE7F2] bg-white p-2 shadow-sm w-fit">
        <div className="flex min-w-max gap-2">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${active ? "bg-[#7A2FBF] text-white shadow-md shadow-purple-200" : "text-[#777386] hover:bg-purple-50 hover:text-[#7A2FBF]"}`}>
                <Icon className="h-4 w-4" /> {label}
                <span className={`rounded-lg px-2 py-0.5 text-xs ${active ? "bg-white/20 text-white" : "bg-[#F2EEF7] text-[#777386]"}`}>{counts[id]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-[#ECE7F2] bg-white">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#7A2FBF]" />
          <p className="mt-4 text-sm font-medium text-[#777386]">Cargando solicitudes...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCD3E8] bg-white px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-[#7A2FBF]"><ClipboardList className="h-8 w-8" /></div>
          <h2 className="mt-5 text-lg font-bold text-[#252136]">
            {activeTab === "PENDING" ? "Todo al día" : activeTab === "CONFIRMED" ? "No tienes trabajos aceptados" : "Aún no hay trabajos completados"}
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#777386]">
            {activeTab === "PENDING" ? "Cuando recibas nuevas solicitudes de clientes, aparecerán aquí." : activeTab === "CONFIRMED" ? "Las solicitudes que aceptes aparecerán en esta sección." : "Los trabajos finalizados se mostrarán aquí para que puedas consultarlos."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
          {filteredOrders.map((order) => (
            <div key={order.id} className="relative group">
              <JobOrderCard
                order={order}
                isLoading={actionLoading === order.id}
                onAccept={(id) => { void handleAction(id, "CONFIRMED"); }}
                onComplete={(id) => { void handleAction(id, "COMPLETED"); }}
              />
              
              {/* BOTÓN DE CHAT INTEGRADO EN LA TARJETA */}
              <div className="mt-3 flex justify-end px-2">
                <button 
                  onClick={() => setChatTarget(order)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#7a2fbf] shadow-sm border border-[#eeeaf5] hover:bg-purple-50 transition"
                >
                  <MessageSquare size={18} /> Chatear con el cliente
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CHAT */}
      {chatTarget && currentUser && (
        <ChatBox 
          quoteId={chatTarget.id} 
          currentUserId={currentUser.id} 
          otherUserName={chatTarget.clientName ?? "Cliente"} 
          onClose={() => setChatTarget(null)} 
        />
      )}
    </div>
  );
}