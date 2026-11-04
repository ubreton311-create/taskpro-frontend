import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, LoaderCircle, ArrowLeft } from "lucide-react";
import CheckoutStep from "../components/CheckoutStep";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface QuoteData {
  id: string;
  subtotal: number | string;
  commissionAmount: number | string;
  totalAmount: number | string;
  scheduledDate?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export default function CheckoutView() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!quoteId) {
      setError("No se proporcionó un identificador de cotización.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchQuote() {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/quotes/${quoteId}`, {
          method: "GET",
          headers: getAuthHeaders(),
          signal: controller.signal,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || "No fue posible cargar la cotización.");
        }

        setQuote(data);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "Ocurrió un error al cargar la cotización.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchQuote();
    return () => controller.abort();
  }, [quoteId]);

  const handlePay = useCallback(async () => {
    if (!quoteId) throw new Error("No se encontró el ID de la cotización.");
    
    try {
      const response = await fetch(`${API_URL}/bookings/finalize`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          quoteId,
          scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Mañana
          addressInfo: {
            exactAddress: "Dirección capturada en el sistema", 
            latitude: 32.5149,
            longitude: -117.0382,
            additionalInstructions: "",
          },
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "No fue posible iniciar el pago.");
      }

      if (!data.checkoutUrl) throw new Error("El servidor no devolvió una URL de pago válida.");
      
      window.location.assign(data.checkoutUrl);
    } catch (err: any) {
      throw new Error(err.message || "Error al procesar el pago.");
    }
  }, [quoteId]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f9fc]">
        <div className="text-center">
          <LoaderCircle size={40} className="animate-spin text-[#7a2fbf] mx-auto mb-4" />
          <p className="text-sm font-medium text-[#777386]">Cargando cotización...</p>
        </div>
      </main>
    );
  }

  // Si hay un error, o si simplemente no hay cotización, mostramos el panel de error.
  if (error || !quote) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f9fc] px-4">
        <div className="w-full max-w-md rounded-3xl border border-[#eeeaf3] bg-white p-8 text-center shadow-[0_12px_45px_rgba(48,25,73,0.07)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="mt-5 text-xl font-extrabold text-[#252136]">
            No pudimos cargar tu cotización
          </h2>
          <p className="mt-2 text-sm font-medium text-[#777386]">
            {error || "El ID de la cotización no es válido o no tienes acceso a ella."}
          </p>
          <button 
            onClick={() => window.history.back()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7a2fbf] px-5 py-3 font-bold text-white transition hover:bg-[#64239f]"
          >
            <ArrowLeft size={18} /> Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  // MAPEO CRÍTICO: De Prisma (commissionAmount/totalAmount) a UI (commission/total)
  return (
    <main className="min-h-screen bg-[#f8f9fc] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <CheckoutStep
          subtotal={Number(quote.subtotal || 0)}
          commission={Number(quote.commissionAmount || 0)}
          total={Number(quote.totalAmount || 0)}
          onPay={handlePay}
        />
      </div>
    </main>
  );
}