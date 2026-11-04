
import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export interface CheckoutStepProps {
  serviceName: string;
  subtotal: number;
  commission: number;
  currency?: string;
  loading?: boolean;
  onPay: () => Promise<void> | void;
}

export default function CheckoutStep({
  serviceName,
  subtotal,
  commission,
  currency = 'MXN',
  loading = false,
  onPay,
}: CheckoutStepProps): React.JSX.Element {
  const [error, setError] = useState<string | null>(null);

  const total = subtotal + commission;

  const formatMoney = (amount: number): string =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
    }).format(amount);

  const handlePay = async (): Promise<void> => {
    if (loading) return;

    setError(null);

    try {
      await onPay();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible iniciar el pago.',
      );
    }
  };

  return (
    <section className="w-full max-w-lg rounded-3xl border border-[#eeeaf3] bg-white p-6 shadow-[0_12px_45px_rgba(48,25,73,0.07)] sm:p-8">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#777386]">
            TaskPro Checkout
          </span>
          <h2 className="mt-1 text-2xl font-extrabold text-[#252136]">
            Resumen de pago
          </h2>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1e8fa] text-[#7a2fbf]">
          <CreditCard size={24} />
        </div>
      </div>

      <div className="mb-6 rounded-2xl bg-[#f8f9fc] p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles size={16} className="text-[#7a2fbf]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#777386]">
            Servicio contratado
          </span>
        </div>

        <h3 className="text-base font-bold text-[#252136]">
          {serviceName}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#777386]">
            Subtotal del servicio
          </span>
          <span className="font-semibold text-[#252136]">
            {formatMoney(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-[#777386]">
            Comisión TaskPro
          </span>
          <span className="font-semibold text-[#252136]">
            {formatMoney(commission)}
          </span>
        </div>
      </div>

      <div className="my-6 border-t border-dashed border-[#e8e3ee]" />

      <div className="rounded-2xl bg-gradient-to-br from-[#f3eafa] to-[#faf6ff] p-5">
        <span className="text-xs font-bold uppercase tracking-wider text-[#64239f]">
          Total a pagar
        </span>

        <div className="mt-1 flex items-end justify-between">
          <span className="text-3xl font-extrabold tracking-tight text-[#64239f]">
            {formatMoney(total)}
          </span>
          <span className="pb-1 text-xs font-semibold text-[#777386]">
            {currency}
          </span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="group mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#7a2fbf] px-5 py-4 font-bold text-white shadow-lg shadow-[#7a2fbf]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#64239f] hover:shadow-xl hover:shadow-[#7a2fbf]/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <ShieldCheck size={21} className="text-[#ffd43b]" />
        )}

        <span>
          {loading ? 'Conectando con Stripe...' : 'Proceder al Pago Seguro'}
        </span>

        {!loading && (
          <ArrowRight
            size={19}
            className="transition-transform group-hover:translate-x-1"
          />
        )}
      </button>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#777386]">
        <Lock size={13} />
        <span>Transacción protegida mediante Stripe</span>
        <CheckCircle2 size={13} className="text-[#7a2fbf]" />
      </div>
    </section>
  );
}
