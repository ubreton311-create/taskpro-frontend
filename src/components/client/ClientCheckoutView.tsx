import { useEffect, useState } from 'react';

import {
  ShieldCheck,
  LockKeyhole,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

import { clientApi } from '../../services/clientApi';

import type { Quote } from '../../types/client.types';

interface ClientCheckoutViewProps {
  quoteId: string;
  onBack?: () => void;
}

const currency = (amount: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);

export default function ClientCheckoutView({
  quoteId,
  onBack,
}: ClientCheckoutViewProps) {
  const [quote, setQuote] = useState<Quote | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadQuote() {
      try {
        setLoading(true);
        setError('');

        const quotes = await clientApi.getQuotes();

        const selectedQuote = quotes.find(
          (item) => item.id === quoteId,
        );

        if (!selectedQuote) {
          throw new Error('No encontramos esta cotización.');
        }

        if (active) {
          setQuote(selectedQuote);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al cargar la cotización.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadQuote();

    return () => {
      active = false;
    };
  }, [quoteId]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // No se realiza ningún cobro.
    // La integración real se hará mediante una pasarela de pagos.

    setPaymentNotice(true);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f7fb]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7a2fbf]" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-[#f8f7fb] p-8">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-sm">
          <AlertCircle className="mb-3 text-red-500" size={32} />

          <h2 className="font-bold text-gray-900">
            No se pudo cargar el pago
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error || 'Cotización no encontrada.'}
          </p>

          <button
            onClick={onBack}
            className="mt-6 rounded-xl bg-[#7a2fbf] px-5 py-3 text-sm font-semibold text-white"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (quote.status !== 'CONFIRMED') {
    return (
      <div className="min-h-screen bg-[#f8f7fb] p-8">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-sm">
          <AlertCircle className="mb-3 text-amber-500" size={32} />

          <h2 className="font-bold text-gray-900">
            Cotización no disponible para pago
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Solo puedes pagar cotizaciones confirmadas.
          </p>

          <button
            onClick={onBack}
            className="mt-6 rounded-xl bg-[#7a2fbf] px-5 py-3 text-sm font-semibold text-white"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7fb] px-4 py-8 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mx-auto mb-8 max-w-6xl">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#7a2fbf]"
        >
          <ArrowLeft size={18} />
          Volver a cotizaciones
        </button>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#7a2fbf] p-3 text-white">
            <CreditCard size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Finalizar pago
            </h1>

            <p className="text-sm text-gray-500">
              Completa los datos para continuar con tu servicio.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 lg:grid-cols-5">

        {/* Payment form */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-7 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Información de pago
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Datos de tu tarjeta bancaria.
                </p>
              </div>

              <LockKeyhole className="text-[#7a2fbf]" size={24} />
            </div>

            {/* Payment notification */}
            {paymentNotice && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertCircle
                    className="shrink-0 text-amber-600"
                    size={22}
                  />

                  <div>
                    <p className="font-semibold text-amber-800">
                      Pasarela pendiente de integración
                    </p>

                    <p className="mt-1 text-sm text-amber-700">
                      Esta es una interfaz de demostración.
                      No se ha realizado ningún cobro.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* Card preview */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a2fbf] via-[#6726a7] to-[#37105f] p-6 text-white shadow-xl">
                <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[25px] border-white/10" />

                <div className="relative flex items-center justify-between">
                  <span className="text-sm font-semibold tracking-widest">
                    TASKPRO
                  </span>

                  <CreditCard size={28} />
                </div>

                <p className="relative mt-10 text-xs text-purple-200">
                  TOTAL A PAGAR
                </p>

                <p className="relative mt-1 text-3xl font-bold">
                  {currency(quote.amount)}
                </p>

                <div className="relative mt-7 flex items-center justify-between">
                  <span className="text-xs text-purple-200">
                    Pago seguro
                  </span>

                  <ShieldCheck size={22} />
                </div>
              </div>

              {/* Cardholder */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Nombre del titular
                </label>

                <input
                  type="text"
                  placeholder="Nombre como aparece en la tarjeta"
                  autoComplete="cc-name"
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#7a2fbf] focus:ring-2 focus:ring-purple-100"
                />
              </div>

              {/* Card number */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Número de tarjeta
                </label>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 5678 9012 3456"
                    required
                    maxLength={23}
                    pattern="[0-9 ]{13,23}"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#7a2fbf] focus:ring-2 focus:ring-purple-100"
                  />

                  <CreditCard
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>

              {/* Expiration and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Vencimiento
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/AA"
                    required
                    maxLength={5}
                    pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#7a2fbf] focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    CVV
                  </label>

                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="•••"
                    required
                    maxLength={4}
                    pattern="[0-9]{3,4}"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#7a2fbf] focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              {/* Security */}
              <div className="flex items-start gap-3 rounded-xl bg-purple-50 p-4">
                <ShieldCheck
                  className="mt-0.5 shrink-0 text-[#7a2fbf]"
                  size={21}
                />

                <p className="text-xs leading-relaxed text-gray-600">
                  Interfaz de demostración. Los datos de tarjeta
                  no se envían al backend ni se almacenan.
                  La integración de pagos deberá utilizar
                  una pasarela certificada.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#7a2fbf] py-4 font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-[#6524a5] active:scale-[0.99]"
              >
                <LockKeyhole size={19} />
                Confirmar Pago
              </button>

            </form>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck size={15} />
              Experiencia de checkout de TaskPro
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-2">
              <ShoppingBag className="text-[#7a2fbf]" size={21} />

              <h2 className="text-lg font-bold text-gray-900">
                Resumen de compra
              </h2>
            </div>

            <div className="rounded-xl bg-purple-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7a2fbf]">
                Servicio contratado
              </p>

              <h3 className="mt-2 text-xl font-bold text-gray-900">
                {quote.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {quote.description || 'Servicio solicitado mediante TaskPro.'}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-gray-500">
                  Proveedor
                </span>

                <span className="text-right font-semibold text-gray-800">
                  {quote.provider?.name || 'Asignado'}
                </span>
              </div>

              <div className="flex justify-between gap-3 text-sm">
                <span className="text-gray-500">
                  Cotización
                </span>

                <span className="font-semibold text-gray-800">
                  #{quote.id.slice(0, 8)}
                </span>
              </div>

              <div className="flex justify-between gap-3 text-sm">
                <span className="text-gray-500">
                  Estado
                </span>

                <span className="font-semibold text-emerald-600">
                  Confirmado
                </span>
              </div>
            </div>

            <div className="my-6 border-t border-dashed border-gray-200" />

            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">
                Total a pagar
              </span>

              <span className="text-2xl font-bold text-[#7a2fbf]">
                {currency(quote.amount)}
              </span>
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <CheckCircle2 size={18} className="text-[#7a2fbf]" />
                Cotización confirmada
              </div>

              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                Tu proveedor ha confirmado el servicio.
                Puedes continuar con el proceso de pago.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}