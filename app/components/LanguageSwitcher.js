'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { languages } from '../lib/translations';

export default function LanguageSwitcher({ variant = 'default', isLanding = false }) {
    const { language, setLanguage, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (langCode) => {
        setLanguage(langCode);
        setIsOpen(false);
    };

    // Compact variant for navbar
    if (variant === 'compact') {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors ${isLanding
                        ? 'text-white hover:bg-white/10 border border-white/20'
                        : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    title={t('settings.selectLanguage')}
                    aria-label={t('settings.selectLanguage')}
                >
                    <span className="text-sm">{currentLanguage.flag}</span>
                    <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${isLanding ? 'text-white/70' : 'text-gray-500'}`} />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-[100]">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition ${language === lang.code ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <span className="text-sm">{lang.flag}</span>
                                <span className={`text-sm ${language === lang.code ? 'font-medium text-[#042C71]' : 'text-gray-700'}`}>
                                    {lang.name}
                                </span>
                                {language === lang.code && (
                                    <Check size={14} className="ml-auto text-[#042C71]" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Default variant for settings page
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg bg-white hover:border-[#042C71] transition"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">{currentLanguage.flag}</span>
                    <span className="font-medium text-gray-800">{currentLanguage.name}</span>
                </div>
                <ChevronDown
                    size={20}
                    className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition ${language === lang.code ? 'bg-blue-50' : ''
                                }`}
                        >
                            <span className="text-xl">{lang.flag}</span>
                            <span className={`${language === lang.code ? 'font-semibold text-[#042C71]' : 'text-gray-700'}`}>
                                {lang.name}
                            </span>
                            {language === lang.code && (
                                <Check size={18} className="ml-auto text-[#042C71]" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
