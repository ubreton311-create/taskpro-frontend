const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Sesión no encontrada. Inicia sesión nuevamente.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message ?? `Error HTTP ${response.status}: ${response.statusText}`);
  }
  return data as T;
}

export interface AdminProfile { id?: string; name: string; email: string; }
export interface UpdateProfilePayload { name: string; email: string; }
export interface PlatformSettings { commissionRate: number; }

export const adminApi = {
  getUsers: () => request<unknown>('/users'),
  getProfile: () => request<AdminProfile>('/users/profile'),
  updateProfile: (payload: UpdateProfilePayload) => request<AdminProfile>('/users/profile', { method: 'PATCH', body: JSON.stringify(payload) }),
  getPlatformSettings: () => request<PlatformSettings>('/admin/settings'),
  updatePlatformSettings: (payload: PlatformSettings) => request<PlatformSettings>('/admin/settings', { method: 'PATCH', body: JSON.stringify(payload) }),
};