import { createContext } from 'react';

export type Language = 'es' | 'en';

export interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);
