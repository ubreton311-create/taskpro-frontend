import type { Quote, Booking, Service } from '../types/client.types';
import { API_URL } from './config';


async function apiFetch<T>(endpoint: string): Promise<T> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No existe una sesión activa.');

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) throw new Error('Tu sesión ha expirado.');
  if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

  return response.json() as Promise<T>;
}

export const clientApi = {
  getQuotes: () => apiFetch<Quote[]>('/quotes'),
  getServices: () => apiFetch<Service[]>('/services'),
  getBookings: () => apiFetch<Booking[]>('/bookings'),
};