import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "es" | "en";
type TranslationDictionary = { [key: string]: string };

const translations: Record<Language, TranslationDictionary> = {
  es: {
    "app.name": "TaskPro", "general.viewAll": "Ver todos", "nav.dashboard": "Inicio",
    "dashboard.greeting": "¡Hola, {{name}}!",
    "service.plumbing": "Plomería", "service.electrician": "Electricidad", "service.cleaning": "Limpieza", "service.ac": "Aire Acondicionado",
    "appointment.confirmed": "Confirmado", "appointment.pending": "Pendiente",
    "language.label": "Idioma",
  },
  en: {
    "app.name": "TaskPro", "general.viewAll": "View all", "nav.dashboard": "Home",
    "dashboard.greeting": "Hello, {{name}}!",
    "service.plumbing": "Plumbing", "service.electrician": "Electrical", "service.cleaning": "Cleaning", "service.ac": "Air Conditioning",
    "appointment.confirmed": "Confirmed", "appointment.pending": "Pending",
    "language.label": "Language",
  },
};

type I18nContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getInitialLanguage(): Language {
  const saved = localStorage.getItem("taskpro-language");
  if (saved === "es" || saved === "en") return saved;
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((nextLang: Language) => {
    setLanguageState(nextLang);
    localStorage.setItem("taskpro-language", nextLang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = translations[language][key] ?? key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(new RegExp(`{{${k}}}`, "g"), String(v));
        });
      }
      return value;
    },
    [language]
  );

  const contextValue = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used inside I18nProvider");
  return context;
}