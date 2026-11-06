/**
 * Normalise an unknown thrown value into a message we can show a user.
 *
 * `catch (err: any)` was used in ~20 places; a rejected `fetch` is a `TypeError`
 * and a rejected promise can hand back a string, so `err.message` was often
 * `undefined` and the UI rendered an empty error box.
 */
export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return fallback;
}

/**
 * Extract the `message` field from an API error body (`{ message: "..." }`),
 * falling back to the generic message when the body has no usable text.
 */
export function getApiErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return getErrorMessage(body, fallback);
}
