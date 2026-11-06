import { useCallback, useEffect, useState } from 'react';
import AdminDashboard from '../components/admin/AdminDashboard';
import type { AdminStats, KycProvider } from '../types/admin';
import { API_URL } from '../services/config';


async function apiRequest<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Error HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export default function AdminDashboardView() {
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, activeProviders: 0, pendingKyc: 0, commissionRevenue: 0, currency: 'MXN' });
  const [providers, setProviders] = useState<KycProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const refresh = useCallback(async () => {
    if (!token) throw new Error('Tu sesión ha expirado.');
    setError('');
    const [nextStats, nextProviders] = await Promise.all([
      apiRequest<AdminStats>('/admin/stats', token),
      apiRequest<KycProvider[]>('/admin/kyc/pending', token),
    ]);
    setStats(nextStats);
    setProviders(nextProviders);
  }, [token]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try { if (!token) throw new Error('Debes iniciar sesión.'); await refresh(); } 
      catch (err: any) { if (active) setError(err.message); } 
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [token, refresh]);

  async function approve(providerId: string) {
    setActionLoading(true);
    try { await apiRequest(`/admin/kyc/${providerId}/approve`, token!, { method: 'PATCH' }); } 
    finally { setActionLoading(false); }
  }

  async function reject(providerId: string, reason: string) {
    setActionLoading(true);
    try { await apiRequest(`/admin/kyc/${providerId}/reject`, token!, { method: 'PATCH', body: JSON.stringify({ reason }) }); } 
    finally { setActionLoading(false); }
  }

  return (
    <div>
      {error && <div role="alert" className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700">{error}</div>}
      <AdminDashboard stats={stats} providers={providers} loading={loading} actionLoading={actionLoading} onRefresh={refresh} onApprove={approve} onReject={reject} />
    </div>
  );
}