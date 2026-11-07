import { API_URL } from './config';

async function apiGet<T>(endpoint: string): Promise<T> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Sesión expirada. Inicia sesión nuevamente.');

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message ?? `Error HTTP ${response.status}`);
  return data as T;
}

export interface AdminStats {
  totalUsers: number;
  activeProviders: number;
  pendingKyc: number;
  commissionRevenue: number;
}

export interface RecentQuote {
  id: string;
  amount: number | string;
  status: string;
  createdAt?: string;
  client?: { id?: string; name?: string; email?: string; };
  provider?: { id?: string; name?: string; email?: string; };
  service?: { title?: string; provider?: { id?: string; name?: string; }; };
}

export const adminDashboardApi = {
  getStats: () => apiGet<AdminStats>('/admin/stats'),
  getPendingKyc: () => apiGet<unknown>('/admin/kyc/pending'),
  getQuotes: () => apiGet<unknown>('/quotes'),
};