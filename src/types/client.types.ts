export type QuoteStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED';

export interface Provider { id: string; name: string; avatar?: string; }
export interface Service { id: string; name: string; description?: string; price: number; image?: string; }

export interface Quote {
  id: string;
  service?: Service; // Adaptado al backend real
  provider?: Provider;
  totalAmount: number; // El backend devuelve totalAmount
  status: QuoteStatus;
  scheduledDate: string;
  address?: string;
  createdAt: string;
  /** Campos heredados del modelo anterior; se mantienen opcionales por compatibilidad hacia atrás. */
  title?: string;
  description?: string;
  amount?: number;
}

export interface Booking {
  id: string; quoteId?: string; status: string;
  totalAmount: number; scheduledDate: string;
  service?: Service;
}

export interface DashboardStats {
  activeServices: number; totalSpent: number; upcomingBookings: number;
}