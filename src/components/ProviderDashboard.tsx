import { useState } from "react";
import { getErrorMessage } from '../utils/errors';
import {
  BriefcaseBusiness,
  Wallet,
  Star,
  MapPin,
  CalendarDays,
  FileText,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

export type JobOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface JobOrder {
  id: string;
  serviceName: string;
  clientName: string;
  scheduledDate: string;
  address: string;
  amount: number;
  status: JobOrderStatus;
  pdfUrl?: string;
}

export interface ProviderDashboardProps {
  providerName: string;
  pendingJobs: number;
  commissionsPaid: number;
  averageRating?: number;
  orders: JobOrder[];
  onViewPdf: (order: JobOrder) => void;
  onComplete: (order: JobOrder) => Promise<void> | void;
  onAccept?: (order: JobOrder) => Promise<void> | void;
}

const money = (amount: number): string =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(amount);

export default function ProviderDashboard({
  providerName,
  pendingJobs,
  commissionsPaid,
  averageRating,
  orders,
  onViewPdf,
  onComplete,
  onAccept,
}: ProviderDashboardProps) {
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (order: JobOrder) => {
    if (completingId) return;
    setCompletingId(order.id);
    setError(null);

    try {
      await onComplete(order);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No fue posible completar la orden."));
    } finally {
      setCompletingId(null);
    }
  };

  // Función para obtener la clase del status según tu CSS global
  const getStatusClass = (status: JobOrderStatus) => {
    if (status === "COMPLETED") return "status-confirmed";
    if (status === "IN_PROGRESS") return "status-pending";
    return "status-pending"; // PENDING y CONFIRMED
  };

  return (
    <section className="page-section">
      {/* CABECERA GLOBAL */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">PANEL DE PROVEEDOR</span>
          <h1>Hola, {providerName}</h1>
          <p>Aquí tienes el resumen de tu actividad en TaskPro.</p>
        </div>
      </div>

      {error && (
        <div className="api-fallback-notice">
          <span>{error}</span>
        </div>
      )}

      {/* TARJETAS DE ESTADÍSTICAS (Usando tus clases globales) */}
      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon stat-icon-purple">
              <BriefcaseBusiness size={20} />
            </div>
          </div>
          <p className="stat-label">Trabajos Pendientes</p>
          <div className="stat-value-row">
            <span className="stat-value">{pendingJobs}</span>
          </div>
          <p className="stat-note">Órdenes por atender</p>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon stat-icon-yellow">
              <Wallet size={20} />
            </div>
          </div>
          <p className="stat-label">Comisiones Pagadas</p>
          <div className="stat-value-row">
            <span className="stat-value">{money(commissionsPaid)}</span>
          </div>
          <p className="stat-note">Total acumulado</p>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon stat-icon-blue">
              <Star size={20} />
            </div>
          </div>
          <p className="stat-label">Calificación Promedio</p>
          <div className="stat-value-row">
            <span className="stat-value">
              {typeof averageRating === 'number' ? averageRating.toFixed(1) : '—'}
            </span>
          </div>
          <p className="stat-note">
            {typeof averageRating === 'number' ? 'Opiniones de clientes' : 'Sin reseñas todavía'}
          </p>
        </article>
      </div>

      {/* LISTA DE ÓRDENES (Usando tus tarjetas globales) */}
      <div className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Órdenes de Servicio</h2>
            <p>Gestiona tus trabajos y entregas.</p>
          </div>
          <span
            className="status-pill status-pending"
            style={{ padding: "8px 12px", fontSize: "11px" }}
          >
            {orders.length} órdenes
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {orders.length === 0 ? (
            <div className="content-card empty-state" style={{ minHeight: "200px" }}>
              <BriefcaseBusiness size={36} className="empty-state-icon" />
              <h2>No tienes órdenes todavía</h2>
              <p>Cuando recibas una reserva, aparecerá aquí.</p>
            </div>
          ) : (
            orders.map((order) => (
              <article
                key={order.id}
                className="content-card"
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: "0 0 4px",
                        fontSize: "16px",
                        fontWeight: 750,
                        color: "var(--text)",
                      }}
                    >
                      {order.serviceName}
                    </h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                      Cliente: {order.clientName}
                    </p>
                  </div>
                  <span className={`status-pill ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <CalendarDays size={14} />
                    {new Date(order.scheduledDate).toLocaleString("es-MX")}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={14} />
                    {order.address}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--border)",
                    paddingTop: "16px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Importe del servicio
                    </span>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 800,
                        color: "var(--primary)",
                      }}
                    >
                      {money(order.amount)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {onAccept && order.status === "PENDING" && (
                      <button
                        className="btn btn-secondary"
                        onClick={() => onAccept(order)}
                        disabled={completingId === order.id}
                      >
                        <CheckCircle2 size={16} />
                        Aceptar
                      </button>
                    )}
                    <button
                      className="btn btn-secondary"
                      onClick={() => onViewPdf(order)}
                      disabled={!order.pdfUrl}
                    >
                      <FileText size={16} />
                      Ver PDF
                    </button>
                    {order.status !== "COMPLETED" && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleComplete(order)}
                        disabled={completingId === order.id}
                      >
                        {completingId === order.id ? (
                          <LoaderCircle size={16} className="spin" />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Completar
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}