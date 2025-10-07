"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
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

  // Load saved language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage === 'en' || savedLanguage === 'ur') {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage whenever it changes
  const setLanguageAndSave = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  }, []);

  const translate = useCallback((key: TranslationKeys): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation key "${key}" not found.`);
      return key; // Fallback to key if translation not found
    }
    return translation[language];
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageAndSave, translate }}>
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