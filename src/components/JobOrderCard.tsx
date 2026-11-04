import {
  CalendarDays, MapPin, UserRound, BriefcaseBusiness, Banknote, CheckCircle2, Clock3, LoaderCircle,
} from "lucide-react";

export type JobOrderStatus = "PENDING" | "CONFIRMED" | "COMPLETED";

export interface JobOrder {
  id: string;
  clientName: string;
  serviceName: string;
  scheduledDate: string;
  address: string;
  totalAmount: number;
  status: JobOrderStatus;
}

interface JobOrderCardProps {
  order: JobOrder;
  onAccept: (orderId: string) => void;
  onComplete: (orderId: string) => void;
  isLoading?: boolean;
}

const statusConfig: Record<JobOrderStatus, { label: string; badgeClass: string; icon: typeof Clock3 }> = {
  PENDING: { label: "Pendiente", badgeClass: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200", icon: Clock3 },
  CONFIRMED: { label: "Aceptado", badgeClass: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200", icon: CheckCircle2 },
  COMPLETED: { label: "Terminado", badgeClass: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200", icon: CheckCircle2 },
};

export default function JobOrderCard({ order, onAccept, onComplete, isLoading = false }: JobOrderCardProps) {
  const status = statusConfig[order.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  const formattedDate = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.scheduledDate));
  const formattedAmount = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(order.totalAmount);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#EAE6F0] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D8C3EC] hover:shadow-lg hover:shadow-purple-950/5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7A2FBF] via-[#A56BDA] to-[#E8D7F8] opacity-80" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8A8498]">
            <BriefcaseBusiness className="h-4 w-4 text-[#7A2FBF]" /> Solicitud de servicio
          </div>
          <h3 className="break-words text-lg font-bold tracking-tight text-[#252136] sm:text-xl">{order.serviceName}</h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-[#777386]">
            <UserRound className="h-4 w-4 shrink-0" /> <span className="truncate">{order.clientName}</span>
          </div>
        </div>
        <span className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.badgeClass}`}>
          <StatusIcon className="h-3.5 w-3.5" /> {status.label}
        </span>
      </div>
      <div className="my-5 h-px bg-[#F0EDF4]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#7A2FBF]"><CalendarDays className="h-5 w-5" /></div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#9691A4]">Fecha programada</p>
            <p className="mt-1 break-words text-sm font-semibold text-[#393448]">{formattedDate}</p>
          </div>
        </div>
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#7A2FBF]"><MapPin className="h-5 w-5" /></div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#9691A4]">Dirección</p>
            <p className="mt-1 break-words text-sm font-semibold leading-5 text-[#393448]">{order.address}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-4 rounded-xl bg-[#FAF9FC] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-[#777386]"><Banknote className="h-4 w-4" /> Monto total a cobrar</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#252136]">{formattedAmount}</p>
        </div>
        {order.status === "PENDING" && (
          <button type="button" disabled={isLoading} onClick={() => onAccept(order.id)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7A2FBF] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-purple-200/60 transition-all hover:-translate-y-0.5 hover:bg-[#64239F] disabled:opacity-60">
            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {isLoading ? "Aceptando..." : "Aceptar"}
          </button>
        )}
        {order.status === "CONFIRMED" && (
          <button type="button" disabled={isLoading} onClick={() => onComplete(order.id)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-100 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60">
            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {isLoading ? "Completando..." : "Completar"}
          </button>
        )}
        {order.status === "COMPLETED" && (
          <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Trabajo finalizado
          </span>
        )}
      </div>
    </article>
  );
}