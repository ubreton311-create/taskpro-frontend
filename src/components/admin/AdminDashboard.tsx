import { useMemo, useState } from 'react';
import type { AdminStats, KycProvider } from '../../types/admin';

interface AdminDashboardProps {
  stats: AdminStats;
  providers: KycProvider[];
  loading?: boolean;
  actionLoading?: boolean;
  onRefresh: () => Promise<void>;
  onApprove: (providerId: string) => Promise<void>;
  onReject: (providerId: string, reason: string) => Promise<void>;
}

type DocumentKey = 'ine' | 'selfie' | 'proofOfAddress';

const COLORS = {
  primary: '#7A2FBF',
  primaryDark: '#64239F',
  background: '#F8F9FC',
  text: '#252136',
  secondary: '#777386',
};

function formatCurrency(amount: number, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function KpiCard({ title, value, description, icon, iconClass }: any) {
  return (
    <article className="min-w-0 rounded-2xl border border-[#eeeaf5] bg-white p-5 shadow-[0_4px_20px_rgba(48,25,78,0.05)] transition-shadow hover:shadow-[0_8px_28px_rgba(48,25,78,0.09)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#777386]">{title}</p>
          <p className="mt-2 break-words text-2xl font-bold tracking-tight text-[#252136]">{value}</p>
          <p className="mt-2 text-xs text-[#777386]">{description}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${iconClass}`}>{icon}</span>
      </div>
    </article>
  );
}

function DocumentCard({ title, document, onPreview }: any) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#eeeaf5] bg-white">
      <div className="border-b border-[#f0edf5] px-3 py-3">
        <h4 className="truncate text-sm font-semibold text-[#34294a]">{title}</h4>
      </div>
      <button type="button" onClick={onPreview} className="group block w-full p-3 text-left">
        <div className="flex h-36 items-center justify-center overflow-hidden rounded-lg bg-[#f8f6fb]">
          <img src={document.url} alt={document.label} className="h-full w-full object-contain transition-transform group-hover:scale-[1.03]" />
        </div>
        <p className="mt-3 text-center text-sm font-semibold text-[#7A2FBF]">Ver documento ↗</p>
      </button>
    </article>
  );
}

function ProviderKycModal({ provider, busy, onClose, onApprove, onReject }: any) {
  const [preview, setPreview] = useState<DocumentKey | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const documents = { ine: provider.documents.ine, selfie: provider.documents.selfie, proofOfAddress: provider.documents.proofOfAddress };

  async function handleApprove() {
    setError('');
    try { await onApprove(); } catch (err: any) { setError(err.message || 'Error al aprobar.'); }
  }

  async function handleReject() {
    if (reason.trim().length < 10) return setError('El motivo debe tener al menos 10 caracteres.');
    setError('');
    try { await onReject(reason.trim()); } catch (err: any) { setError(err.message || 'Error al rechazar.'); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#21132f]/60 p-4 backdrop-blur-sm">
      <section className="my-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#eeeaf5] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7A2FBF]">Verificación KYC</p>
            <h2 className="mt-1 text-xl font-bold text-[#252136]">Expediente del proveedor</h2>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="rounded-lg px-3 py-1 text-2xl text-[#777386] hover:bg-[#f6f2fa] disabled:opacity-50">×</button>
        </header>
        <div className="max-h-[65vh] space-y-6 overflow-y-auto p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f1e7fb] text-xl font-bold text-[#64239F]">{provider.fullName.charAt(0).toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-[#252136]">{provider.fullName}</h3>
              <p className="break-all text-sm text-[#777386]">{provider.email}</p>
              <p className="mt-1 text-sm font-medium text-[#64239F]">{provider.specialty}</p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">Pendiente</span>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-[#252136]">Documentos de verificación</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <DocumentCard title="INE / Identificación" document={documents.ine} onPreview={() => setPreview('ine')} />
              <DocumentCard title="Selfie de verificación" document={documents.selfie} onPreview={() => setPreview('selfie')} />
              <DocumentCard title="Comprobante de domicilio" document={documents.proofOfAddress} onPreview={() => setPreview('proofOfAddress')} />
            </div>
          </div>
          {rejecting && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <label className="block text-sm font-semibold text-red-900">Motivo del rechazo</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Indica qué documento debe corregirse..." className="mt-2 w-full rounded-lg border border-red-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-red-200" />
            </div>
          )}
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </div>
        <footer className="flex flex-col-reverse justify-end gap-3 border-t border-[#eeeaf5] bg-[#fcfbfe] px-6 py-4 sm:flex-row">
          <button type="button" onClick={() => { setRejecting(true); setError(''); }} disabled={busy} className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Rechazar solicitud</button>
          {rejecting ? (
            <button type="button" onClick={handleReject} disabled={busy} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">{busy ? 'Procesando...' : 'Confirmar rechazo'}</button>
          ) : (
            <button type="button" onClick={handleApprove} disabled={busy} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{busy ? 'Procesando...' : '✓ Aprobar proveedor'}</button>
          )}
        </footer>
        {preview && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-[#252136]">{documents[preview].label}</h3>
                <button onClick={() => setPreview(null)} className="rounded-lg px-3 py-1 text-xl hover:bg-gray-100">×</button>
              </div>
              <img src={documents[preview].url} alt={documents[preview].label} className="mx-auto max-h-[70vh] max-w-full object-contain" />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminDashboard({ stats, providers, loading = false, actionLoading = false, onRefresh, onApprove, onReject }: AdminDashboardProps) {
  const [selected, setSelected] = useState<KycProvider | null>(null);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const pendingProviders = useMemo(() => providers.filter(p => p.status === 'PENDING' && `${p.fullName} ${p.email} ${p.specialty}`.toLowerCase().includes(search.toLowerCase().trim())), [providers, search]);

  async function refresh() {
    setRefreshing(true);
    setError('');
    try { await onRefresh(); } catch (err: any) { setError(err.message || 'Error al actualizar.'); } finally { setRefreshing(false); }
  }

  async function approve(providerId: string) {
    await onApprove(providerId);
    setSelected(null);
    await onRefresh();
  }

  async function reject(providerId: string, reason: string) {
    await onReject(providerId, reason);
    setSelected(null);
    await onRefresh();
  }

  return (
    <div className="w-full min-w-0 space-y-7 bg-[#F8F9FC] p-4 sm:p-6 xl:p-8">
      <section>
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#7A2FBF]">Resumen general</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#252136] sm:text-3xl">Panel de Administración</h1>
          <p className="mt-2 text-sm text-[#777386]">Supervisa el rendimiento de TaskPro y las verificaciones pendientes.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <KpiCard title="Usuarios Totales" value={stats.totalUsers.toLocaleString('es-MX')} description="Cuentas registradas" icon="♙" iconClass="bg-purple-50 text-[#7A2FBF]" />
          <KpiCard title="Proveedores Activos" value={stats.activeProviders.toLocaleString('es-MX')} description="Proveedores habilitados" icon="▣" iconClass="bg-violet-50 text-violet-600" />
          <KpiCard title="KYC Pendientes" value={stats.pendingKyc.toLocaleString('es-MX')} description="Solicitudes por revisar" icon="◷" iconClass="bg-amber-50 text-amber-600" />
          <KpiCard title="Ingresos por Comisiones" value={formatCurrency(stats.commissionRevenue, stats.currency)} description="Importe reportado" icon="$" iconClass="bg-emerald-50 text-emerald-600" />
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#eeeaf5] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eeeaf5] px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#252136] sm:text-xl">Verificación de Proveedores (KYC)</h2>
            <p className="mt-1 text-sm text-[#777386]">Revisa los expedientes antes de habilitar las cuentas.</p>
          </div>
          <button type="button" onClick={refresh} disabled={refreshing || loading} className="rounded-xl border border-[#e4d3f7] bg-white px-4 py-2.5 text-sm font-semibold text-[#64239F] transition hover:bg-[#faf6ff] disabled:opacity-50">↻ {refreshing ? 'Actualizando...' : 'Actualizar'}</button>
        </div>
        <div className="border-b border-[#f0edf5] p-4 sm:px-6">
          <label className="flex max-w-md items-center gap-3 rounded-xl border border-[#eeeaf5] bg-[#faf9fc] px-3 py-2.5 focus-within:border-[#7A2FBF] focus-within:ring-2 focus-within:ring-purple-100">
            <span className="text-lg text-[#777386]">⌕</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar proveedor..." className="w-full bg-transparent text-sm outline-none" />
          </label>
        </div>
        {error && <p className="mx-5 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-[#faf8fd] text-xs uppercase tracking-wide text-[#777386]">
              <tr>
                <th className="px-6 py-4 font-semibold">Proveedor</th>
                <th className="px-4 py-4 font-semibold">Especialidad</th>
                <th className="px-4 py-4 font-semibold">Fecha</th>
                <th className="px-4 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0edf5]">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-14 text-center text-sm text-[#777386]">Cargando solicitudes...</td></tr>
              ) : pendingProviders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-xl text-[#7A2FBF]">✓</div>
                  <p className="mt-3 font-semibold text-[#252136]">No hay solicitudes pendientes</p>
                  <p className="mt-1 text-sm text-[#777386]">{search ? 'Intenta con otro término.' : 'Las nuevas solicitudes aparecerán aquí.'}</p>
                </td></tr>
              ) : pendingProviders.map(p => (
                <tr key={p.id} className="hover:bg-[#fcfaff]">
                  <td className="px-6 py-4"><p className="font-semibold text-[#252136]">{p.fullName}</p><p className="mt-1 text-xs text-[#777386]">{p.email}</p></td>
                  <td className="px-4 py-4 text-sm text-[#454052]">{p.specialty}</td>
                  <td className="px-4 py-4 text-sm text-[#777386]">{new Date(p.submittedAt).toLocaleDateString('es-MX')}</td>
                  <td className="px-4 py-4"><span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">PENDING</span></td>
                  <td className="px-6 py-4 text-right"><button onClick={() => setSelected(p)} className="rounded-xl bg-[#7A2FBF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#64239F]">Ver expediente</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eeeaf5] px-6 py-4 text-sm text-[#777386]">
          <span>{pendingProviders.length} solicitud{pendingProviders.length === 1 ? '' : 'es'} pendiente{pendingProviders.length === 1 ? '' : 's'}</span>
          <span>Verificación de identidad</span>
        </footer>
      </section>
      {selected && <ProviderKycModal provider={selected} busy={actionLoading} onClose={() => !actionLoading && setSelected(null)} onApprove={() => approve(selected.id)} onReject={(reason: string) => reject(selected.id, reason)} />}
    </div>
  );
}