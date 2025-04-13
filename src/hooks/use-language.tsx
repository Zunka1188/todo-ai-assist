
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import i18n from "@/i18n/i18n";
import { languages } from "@/i18n/i18n";
import { useToast } from "@/hooks/use-toast";

type LanguageCode = keyof typeof languages;
type LanguageContextProps = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  languageList: typeof languages;
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const { toast } = useToast();
  const [language, setLanguageState] = useState<LanguageCode>(
    () => (localStorage.getItem("language") as LanguageCode) || "en"
  );

  // Function to change language
  const setLanguage = (newLanguage: LanguageCode) => {
    if (languages[newLanguage]) {
      localStorage.setItem("language", newLanguage);
      i18n.changeLanguage(newLanguage);
      setLanguageState(newLanguage);
      
      // Show toast in the new language
      const messages = {
        en: "Language changed to English",
        fr: "Langue changée en Français",
        pl: "Język zmieniony na Polski"
      };
      
      toast({
        title: messages[newLanguage],
        description: ""
      });
    }
  };

  // Initialize language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as LanguageCode;
    if (savedLanguage && languages[savedLanguage]) {
      i18n.changeLanguage(savedLanguage);
      setLanguageState(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languageList: languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
