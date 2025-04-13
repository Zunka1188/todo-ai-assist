
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import enTranslation from "./locales/en.json";
import frTranslation from "./locales/fr.json";
import plTranslation from "./locales/pl.json";

// Define available languages
export const languages = {
  en: { code: "en", label: "English" },
  fr: { code: "fr", label: "Français" },
  pl: { code: "pl", label: "Polski" }
};

// Setup i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      fr: { translation: frTranslation },
      pl: { translation: plTranslation }
    },
    lng: localStorage.getItem("language") || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // React already safes from XSS
    },
    react: {
      useSuspense: false // We don't want suspense during loading
    }
  });

export default i18n;
