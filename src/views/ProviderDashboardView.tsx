import { useEffect, useMemo, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import ProviderDashboard, { type JobOrder } from "../components/ProviderDashboard";
import ReviewModal from "../components/ReviewModal";
import { getCurrentUser } from "../utils/auth";
import { API_URL } from '../services/config';
import { getErrorMessage, getApiErrorMessage } from '../utils/errors';
import type { ApiQuote } from '../types/api.types';


function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Tu sesión ha expirado.");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

/** GET /quotes — resolves with the quotes assigned to the signed-in provider. */
async function fetchProviderQuotes(): Promise<ApiQuote[]> {
  const response = await fetch(`${API_URL}/quotes`, { headers: getAuthHeaders() });
  const data = await response.json();
  if (!response.ok) throw new Error(getApiErrorMessage(data, "Error al cargar solicitudes."), { cause: data });
  return Array.isArray(data) ? (data as ApiQuote[]) : [];
}

export default function ProviderDashboardView() {
  const [quotes, setQuotes] = useState<ApiQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewTarget, setReviewTarget] = useState<JobOrder | null>(null);

  const user = getCurrentUser();

  // 1. Cargar las cotizaciones (Solicitudes) de los clientes
  useEffect(() => {
    let active = true;
    fetchProviderQuotes()
      .then((data) => { if (active) setQuotes(data); })
      .catch((err: unknown) => { if (active) setError(getErrorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // 2. Mapear los datos de Prisma (Quote) a la interfaz visual (JobOrder)
  const orders: JobOrder[] = useMemo(() => {
    return quotes.map((q) => ({
      id: q.id,
      clientName: q.client?.name || "Cliente",
      serviceName: q.service?.name || "Servicio solicitado",
      address: q.address || "Dirección pendiente",
      scheduledDate: q.scheduledDate ?? "",
      amount: Number(q.totalAmount),
      status: q.status as JobOrder["status"],
      pdfUrl: typeof q.pdfUrl === "string" ? q.pdfUrl : undefined,
    }));
  }, [quotes]);

  const pendingJobs = quotes.filter((q) => q.status === "PENDING").length;
  
  // Sumamos comisiones de las cotizaciones ya pagadas/completadas
  const commissionsPaid = quotes.reduce((sum, q) => {
    if (q.status === "COMPLETED" || q.status === "CONFIRMED") {
      return sum + (Number(q.totalAmount) * 0.15); // Ejemplo 15% comisión
    }
    return sum;
  }, 0);

  // 3. Función para aceptar la cotización
  const handleAccept = async (order: JobOrder) => {
    try {
      const response = await fetch(`${API_URL}/quotes/${order.id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: "CONFIRMED" }),
      });
      if (!response.ok) throw new Error("Error al aceptar el servicio.");
      
      // Actualizamos la vista local
      setQuotes((prev) => prev.map((q) => q.id === order.id ? { ...q, status: "CONFIRMED" } : q));
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const handleReviewSubmit = async ({
    bookingId,
    rating,
    comment,
  }: {
    bookingId: string;
    rating: number;
    comment: string;
  }) => {
    const response = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookingId, rating, comment }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || "No fue posible registrar la reseña.");
    }

    setReviewTarget(null);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f8f9fc]"><LoaderCircle className="animate-spin text-[#7a2fbf]" size={38} /></div>;
  if (error) return <div className="p-10 text-center text-red-500"><AlertCircle className="mx-auto mb-4" />{error}</div>;

  return (
    <>
      <ProviderDashboard
        providerName={user?.name || "Proveedor"}
        pendingJobs={pendingJobs}
        commissionsPaid={commissionsPaid}
        orders={orders}
        onAccept={handleAccept} // Nueva función para aceptar trabajos
        onComplete={(order) => setReviewTarget(order)}
        onViewPdf={(order) => order.pdfUrl && window.open(order.pdfUrl, "_blank")}
      />
      <ReviewModal
        isOpen={Boolean(reviewTarget)}
        targetName={reviewTarget?.clientName || "Cliente"}
        targetRole="CLIENT"
        bookingId={reviewTarget?.id ?? ""}
        onClose={() => setReviewTarget(null)}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
}