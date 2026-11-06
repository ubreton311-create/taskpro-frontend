import { useEffect, useMemo, useState } from 'react';

import {
  Search,
  Filter,
  FileText,
  Loader2,
  CreditCard,
  AlertCircle,
} from 'lucide-react';

import { clientApi } from '../../services/clientApi';

import type {
  Quote,
  QuoteStatus,
} from '../../types/client.types';

interface ClientQuotesViewProps {
  onPay?: (quoteId: string) => void;
}

const statusConfig: Record<
  QuoteStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: 'Pendiente',
    className: 'bg-amber-50 text-amber-700',
  },
  CONFIRMED: {
    label: 'Confirmado',
    className: 'bg-purple-100 text-purple-700',
  },
  COMPLETED: {
    label: 'Completado',
    className: 'bg-emerald-50 text-emerald-700',
  },
};

const currency = (amount: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);

export default function ClientQuotesView({
  onPay,
}: ClientQuotesViewProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadQuotes() {
      try {
        setLoading(true);

        const data = await clientApi.getQuotes();

        if (active) setQuotes(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al cargar cotizaciones.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadQuotes();

    return () => {
      active = false;
    };
  }, []);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const quoteTitle = quote.title ?? quote.service?.name ?? '';
      const matchesSearch =
        quoteTitle.toLowerCase().includes(search.toLowerCase()) ||
        (quote.provider?.name || '')
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        quote.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotes, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7a2fbf]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-red-700">
        <AlertCircle className="mb-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7fb] p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-[#7a2fbf]">
          <FileText size={20} />
          <span className="text-sm font-semibold">
            TASKPRO / COTIZACIONES
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          Mis cotizaciones
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Consulta, administra y paga tus cotizaciones.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Total',
            value: quotes.length,
          },
          {
            label: 'Pendientes',
            value: quotes.filter(q => q.status === 'PENDING').length,
          },
          {
            label: 'Confirmadas',
            value: quotes.filter(q => q.status === 'CONFIRMED').length,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{item.label}</p>

            <p className="mt-2 text-2xl font-bold text-[#7a2fbf]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        {/* Search and filters */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">

          <div className="relative w-full md:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Buscar servicio o proveedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#7a2fbf] focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#7a2fbf]"
            >
              <option value="ALL">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="COMPLETED">Completado</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Cotización</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Importe</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredQuotes.map((quote) => {
                const status = statusConfig[quote.status];

                return (
                  <tr
                    key={quote.id}
                    className="transition hover:bg-purple-50/40"
                  >
                    <td className="px-6 py-5">
                      <p className="font-semibold text-gray-800">
                        {quote.title ?? quote.service?.name ?? 'Servicio'}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        ID: {quote.id}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <span className="text-gray-700">
                        {quote.provider?.name || 'Por asignar'}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-5 text-gray-500">
                      {new Date(quote.createdAt).toLocaleDateString('es-MX')}
                    </td>

                    <td className="whitespace-nowrap px-6 py-5 font-bold text-gray-800">
                      {currency(quote.amount ?? quote.totalAmount ?? 0)}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-center">
                      {quote.status === 'CONFIRMED' ? (
                        <button
                          onClick={() => onPay?.(quote.id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#7a2fbf] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#6524a5]"
                        >
                          <CreditCard size={15} />
                          Pagar
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {quote.status === 'COMPLETED'
                            ? 'Pagado / finalizado'
                            : 'En espera'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredQuotes.length === 0 && (
          <div className="p-12 text-center">
            <FileText
              size={40}
              className="mx-auto mb-3 text-gray-300"
            />

            <p className="font-semibold text-gray-700">
              No encontramos cotizaciones
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Intenta cambiar los filtros de búsqueda.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4">
          <p className="text-xs text-gray-400">
            Mostrando {filteredQuotes.length} de {quotes.length} cotizaciones
          </p>
        </div>

      </div>
    </div>
  );
}