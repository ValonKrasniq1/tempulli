
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";
type Language = "sq" | "en";

type Preferences = {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (language: Language) => void;
  t: (sq: string, en: string) => string;
};

const PreferencesContext =
  createContext<Preferences | null>(null);

export default function PreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const [language, updateLanguage] =
    useState<Language>("sq");

  useEffect(() => {
    try {
      const savedTheme =
        localStorage.getItem("tempulli-theme");

      const savedLanguage =
        localStorage.getItem("tempulli-language");

      const nextTheme =
        savedTheme === "dark" ? "dark" : "light";

      const nextLanguage =
        savedLanguage === "en" ? "en" : "sq";

      setTheme(nextTheme);
      updateLanguage(nextLanguage);

      document.documentElement.dataset.theme =
        nextTheme;

      document.documentElement.lang =
        nextLanguage;
    } catch {}
  }, []);

  function toggleTheme() {
    const next = theme === "dark"
      ? "light"
      : "dark";

    setTheme(next);

    document.documentElement.dataset.theme = next;

    try {
      localStorage.setItem("tempulli-theme", next);
    } catch {}
  }

  function setLanguage(value: Language) {
    updateLanguage(value);

    document.documentElement.lang = value;

    try {
      localStorage.setItem(
        "tempulli-language",
        value
      );
    } catch {}
  }

  function t(sq: string, en: string) {
    return language === "en" ? en : sq;
  }

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        language,
        toggleTheme,
        setLanguage,
        t,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error(
      "PreferencesProvider is missing"
    );
  }

  return context;
}
