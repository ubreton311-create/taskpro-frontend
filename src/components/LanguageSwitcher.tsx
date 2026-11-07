import { Globe, ChevronDown } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation"; // Vite resuelve el .tsx automáticamente

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es");
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={`${t("language.label")}: ${language === "es" ? "ES, cambiar a English" : "EN, switch to Español"}`}
      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#1a1a1a] shadow-sm transition hover:border-yellow-400 hover:bg-yellow-50"
    >
      <Globe size={18} />
      <span>{language === "es" ? "ES" : "EN"}</span>
      <ChevronDown size={15} />
    </button>
  );
}