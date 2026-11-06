/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the TaskPro API. Required for production builds. */
  readonly VITE_API_URL?: string;
  /** Google OAuth web client id. Optional; hides the Google button when unset. */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  /** Public support channels. Unset channels are hidden from the UI. */
  readonly VITE_SUPPORT_EMAIL?: string;
  readonly VITE_SUPPORT_PHONE?: string;
  readonly VITE_SUPPORT_WHATSAPP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
