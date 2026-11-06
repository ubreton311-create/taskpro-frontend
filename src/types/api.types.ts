/**
 * Shapes returned by the TaskPro API that are shared across screens.
 *
 * These are intentionally permissive on optional fields (`status` is a string,
 * money may arrive as a string from Prisma's Decimal) because the API is the
 * source of truth and the client must not crash on a shape it did not expect.
 */

/**
 * A row from `GET /quotes`. Every screen except the admin dashboard reads
 * `totalAmount` and `service.name` (see #26 — `RecentQuote` in
 * `services/adminDashboardApi.ts` spells them `amount` / `service.title`).
 */
export interface ApiQuote {
  id: string;
  status: string;
  totalAmount: number | string;
  subtotal?: number | string;
  commissionAmount?: number | string;
  createdAt: string;
  scheduledDate?: string;
  address?: string;
  pdfUrl?: string | null;
  client?: { id?: string; name?: string; email?: string };
  provider?: { id?: string; name?: string; email?: string };
  service?: { id?: string; name?: string; description?: string };
}

export interface ApiUser {
  id: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role: string;
  status?: string;
  specialty?: string;
  createdAt?: string;
}
