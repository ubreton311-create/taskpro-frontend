import React, { useState } from 'react';
import {
  Star,
  X,
  MessageSquareText,
  Send,
  CheckCircle2,
} from 'lucide-react';

export interface ReviewModalProps {
  isOpen: boolean;
  targetName: string;
  targetRole?: 'PROVIDER' | 'CLIENT'; // <-- Nueva prop para saber a quién calificamos
  bookingId: string;
  onClose: () => void;
  onSubmit: (
    data: {
      bookingId: string;
      rating: number;
      comment: string;
    },
  ) => Promise<void>;
}

export default function ReviewModal({
  isOpen,
  targetName,
  targetRole = 'PROVIDER', // Por defecto asume que se califica a un proveedor
  bookingId,
  onClose,
  onSubmit,
}: ReviewModalProps): React.JSX.Element | null {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (rating < 1 || rating > 5) {
      setError('Selecciona una calificación de 1 a 5 estrellas.');
      return;
    }

    if (comment.trim().length > 2000) {
      setError('El comentario no puede superar 2,000 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        bookingId,
        rating,
        comment: comment.trim(),
      });

      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible enviar tu reseña.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (): void => {
    if (loading) return;

    setRating(0);
    setHoveredRating(0);
    setComment('');
    setError(null);
    setSubmitted(false);
    onClose();
  };

  // Lógica dinámica de textos según quién califica
  const isReviewingClient = targetRole === 'CLIENT';
  const titleText = isReviewingClient ? '¿Cómo fue tu experiencia con este cliente?' : '¿Cómo fue tu experiencia?';
  const subtitleText = isReviewingClient ? 'Califica el trato y comunicación con' : 'Califica el servicio de';
  const placeholderText = isReviewingClient ? '¿El cliente fue puntual? ¿El lugar estaba en buenas condiciones?' : '¿Qué te gustó del servicio?';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#252136]/50 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        className="relative w-full max-w-md animate-[fadeIn_.2s_ease-out] rounded-3xl bg-white p-7 shadow-[0_25px_80px_rgba(37,33,54,0.25)] sm:p-9"
      >
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          aria-label="Cerrar reseña"
          className="absolute right-5 top-5 rounded-xl p-2 text-[#777386] transition hover:bg-[#f8f9fc] hover:text-[#252136] disabled:opacity-40"
        >
          <X size={20} />
        </button>

        {!submitted ? (
          <>
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff8d9] text-[#d6a600]">
                <Star size={32} fill="currentColor" />
              </div>
            </div>

            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#7a2fbf]">
                Tu opinión importa
              </span>

              <h2
                id="review-title"
                className="mt-2 text-2xl font-extrabold text-[#252136]"
              >
                {titleText}
              </h2>

              <p className="mt-2 text-sm text-[#777386]">
                {subtitleText}{' '}
                <strong className="text-[#252136]">
                  {targetName}
                </strong>
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <fieldset className="mt-7">
                <legend className="mb-3 block w-full text-center text-sm font-bold text-[#252136]">
                  Tu calificación
                </legend>

                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const active = value <= (hoveredRating || rating);

                    return (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} estrellas`}
                        aria-pressed={rating === value}
                        onMouseEnter={() => setHoveredRating(value)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onFocus={() => setHoveredRating(value)}
                        onBlur={() => setHoveredRating(0)}
                        onClick={() => setRating(value)}
                        className="rounded-lg p-1 transition duration-150 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-[#7a2fbf]"
                      >
                        <Star
                          size={34}
                          strokeWidth={1.8}
                          className={
                            active
                              ? 'fill-[#ffd43b] text-[#e3b300]'
                              : 'fill-transparent text-[#d8d4df]'
                          }
                        />
                      </button>
                    );
                  })}
                </div>

                <p className="mt-3 text-center text-xs font-semibold text-[#7a2fbf]">
                  {rating === 0
                    ? 'Selecciona de 1 a 5 estrellas'
                    : [
                        '',
                        'Necesita mejorar',
                        'Regular',
                        'Bueno',
                        'Muy bueno',
                        '¡Excelente!',
                      ][rating]}
                </p>
              </fieldset>

              <div className="mt-7">
                <label
                  htmlFor="review-comment"
                  className="mb-2 flex items-center gap-2 text-sm font-bold text-[#252136]"
                >
                  <MessageSquareText size={17} className="text-[#7a2fbf]" />
                  Cuéntanos tu experiencia
                </label>

                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={placeholderText}
                  maxLength={2000}
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-[#e9e5ef] bg-[#faf9fc] p-4 text-sm text-[#252136] outline-none transition placeholder:text-[#aaa5b5] focus:border-[#7a2fbf] focus:bg-white focus:ring-4 focus:ring-[#7a2fbf]/10"
                />

                <div className="mt-1 text-right text-xs text-[#aaa5b5]">
                  {comment.length}/2000
                </div>
              </div>

              {error && (
                <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || rating === 0}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7a2fbf] px-5 py-4 font-bold text-white shadow-lg shadow-[#7a2fbf]/20 transition-all hover:-translate-y-0.5 hover:bg-[#64239f] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Send size={18} />
                )}

                {loading ? 'Enviando reseña...' : 'Enviar reseña'}
              </button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2 size={36} />
            </div>

            <h2
              id="review-title"
              className="mt-5 text-2xl font-extrabold text-[#252136]"
            >
              ¡Gracias por tu reseña!
            </h2>

            <p className="mt-2 text-sm text-[#777386]">
              Tu opinión ayuda a mejorar la comunidad TaskPro.
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="mt-7 w-full rounded-2xl bg-[#7a2fbf] px-5 py-3.5 font-bold text-white transition hover:bg-[#64239f]"
            >
              Continuar
            </button>
          </div>
        )}
      </section>
    </div>
  );
}