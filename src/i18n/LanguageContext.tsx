"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { translations, TranslationKeys } from './translations';

type Language = 'en' | 'ur';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en'); // Default language is English

  const translate = useCallback((key: TranslationKeys): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation key "${key}" not found.`);
      return key; // Fallback to key if translation not found
    }
    return translation[language];
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};