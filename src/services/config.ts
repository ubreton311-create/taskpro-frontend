/**
 * Single source of truth for build-time configuration.
 *
 * `VITE_*` values are inlined intothe bundle at build time and are therefore
 * **public** — never put a secret here.
 *
 * `API_URL` must be provided for production builds. There is deliberately no
 * silent `localhost` fallback outside development: shipping one turns a missing
 * environment variable into a broken deployment instead of a failed build.
 */

const DEV_API_FALLBACK = 'http://localhost:3000';

function readEnv(name: keyof ImportMetaEnv): string | undefined {
  const value = import.meta.env[name];
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function resolveApiUrl(): string {
  const configured = readEnv('VITE_API_URL');
  if (configured) return configured.replace(/\/+$/, '');

  if (import.meta.env.DEV) return DEV_API_FALLBACK;

  throw new Error(
    '[config] VITE_API_URL is not set. Define it for the build environment ' +
      '(Railway/Netlify service variables) or in .env.local for local ' +
      'development. See DEPLOY.md.',
  );
}

/** Base URL of the TaskPro API, without a trailing slash. */
export const API_URL = resolveApiUrl();

/** Google OAuth web client id. When unset, the Google sign-in button is hidden. */
export const GOOGLE_CLIENT_ID = readEnv('VITE_GOOGLE_CLIENT_ID');

/**
 * Public support channels. Any channel left unset is not rendered, so we never
 * show a placeholder phone number or WhatsApp link to a real customer.
 */
export const SUPPORT = {
  email: readEnv('VITE_SUPPORT_EMAIL'),
  phone: readEnv('VITE_SUPPORT_PHONE'),
  whatsapp: readEnv('VITE_SUPPORT_WHATSAPP'),
} as const;
