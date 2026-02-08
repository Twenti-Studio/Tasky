'use client';

import { ToastProvider } from '../components/Toast';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';

export function Providers({ children }) {
    return (
        <LanguageProvider>
            <AuthProvider>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </AuthProvider>
        </LanguageProvider>
    );
}
