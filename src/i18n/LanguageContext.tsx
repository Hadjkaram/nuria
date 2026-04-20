import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase'; // <-- Ajout
import { translations as staticTranslations, type Lang } from './translations';

interface LanguageContextType {
  lang: string; // Changé en 'string' pour accepter dynamiquement n'importe quelle langue (wo, zu, etc.)
  setLang: (lang: string) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<string>(() => {
    return localStorage.getItem('nuria-lang') || 'fr';
  });

  // Stockage des traductions dynamiques venues de Supabase
  const [dbTranslations, setDbTranslations] = useState<Record<string, Record<string, string>>>({});

  // Récupération des traductions depuis la base de données
  useEffect(() => {
    const loadTranslations = async () => {
      const { data, error } = await supabase.from('translations').select('key, fr, en, pt, ar');
      if (!error && data) {
        const formatted: Record<string, Record<string, string>> = { fr: {}, en: {}, pt: {}, ar: {} };
        data.forEach(row => {
           if (row.fr) formatted.fr[row.key] = row.fr;
           if (row.en) formatted.en[row.key] = row.en;
           if (row.pt) formatted.pt[row.key] = row.pt;
           if (row.ar) formatted.ar[row.key] = row.ar;
        });
        setDbTranslations(formatted);
      }
    };
    loadTranslations();
  }, []);

  const setLang = useCallback((newLang: string) => {
    setLangState(newLang);
    localStorage.setItem('nuria-lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback((key: string): string => {
    // 1. Priorité absolue : Chercher dans la base de données Supabase
    if (dbTranslations[lang] && dbTranslations[lang][key] && dbTranslations[lang][key].trim() !== '') {
       return dbTranslations[lang][key];
    }
    // 2. Repli de sécurité : Fichiers statiques locaux
    if (staticTranslations[lang as Lang] && staticTranslations[lang as Lang][key]) {
       return staticTranslations[lang as Lang][key];
    }
    // 3. Dernier recours : Français par défaut ou la clé brute
    return staticTranslations['fr']?.[key] || key;
  }, [lang, dbTranslations]);

  const isRtl = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};