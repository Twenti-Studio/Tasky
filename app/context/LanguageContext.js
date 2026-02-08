'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { defaultLanguage, translations } from '../lib/translations';

const LanguageContext = createContext({});

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(defaultLanguage);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved language preference from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLanguage = localStorage.getItem('mita_language');
            if (savedLanguage && translations[savedLanguage]) {
                setLanguageState(savedLanguage);
            }
            setIsLoaded(true);
        }
    }, []);

    // Set language and save to localStorage
    const setLanguage = (lang) => {
        if (translations[lang]) {
            setLanguageState(lang);
            if (typeof window !== 'undefined') {
                localStorage.setItem('mita_language', lang);
            }
        }
    };

    // Get translation by key path (e.g., 'common.loading')
    const t = (keyPath, replacements = {}) => {
        const keys = keyPath.split('.');
        let result = translations[language];

        for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key];
            } else {
                // Fallback to default language if key not found
                result = translations[defaultLanguage];
                for (const k of keys) {
                    if (result && typeof result === 'object' && k in result) {
                        result = result[k];
                    } else {
                        console.warn(`Translation key not found: ${keyPath}`);
                        return keyPath; // Return key path if not found
                    }
                }
                break;
            }
        }

        // Handle string replacements like {amount}
        if (typeof result === 'string' && Object.keys(replacements).length > 0) {
            Object.entries(replacements).forEach(([key, value]) => {
                result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
            });
        }

        return result;
    };

    // Get all translations for current language
    const getTranslations = () => translations[language];

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage,
                t,
                getTranslations,
                isLoaded,
                isIndonesian: language === 'id',
                isEnglish: language === 'en',
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

// Hook to use language context
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

// Shorthand hook for translations
export const useTranslation = () => {
    const { t, language, setLanguage, isLoaded } = useLanguage();
    return { t, language, setLanguage, isLoaded };
};
