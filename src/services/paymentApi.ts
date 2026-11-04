const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function createCheckoutSession(quoteId: string) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Sesión expirada');

  const response = await fetch(`${API_URL}/payments/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ quoteId }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al iniciar pago');
  return data;
}