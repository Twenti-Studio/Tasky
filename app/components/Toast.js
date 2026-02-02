'use client';

import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Toast Context
const ToastContext = createContext(null);

// Toast types configuration
const toastConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
        borderColor: 'border-green-400',
        iconColor: 'text-white',
        progressColor: 'bg-green-300',
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-gradient-to-r from-red-500 to-rose-600',
        borderColor: 'border-red-400',
        iconColor: 'text-white',
        progressColor: 'bg-red-300',
    },
    warning: {
        icon: AlertCircle,
        bgColor: 'bg-gradient-to-r from-amber-500 to-orange-600',
        borderColor: 'border-amber-400',
        iconColor: 'text-white',
        progressColor: 'bg-amber-300',
    },
    info: {
        icon: Info,
        bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        borderColor: 'border-blue-400',
        iconColor: 'text-white',
        progressColor: 'bg-blue-300',
    },
};

// CSS Keyframes as inline styles
const keyframes = `
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
`;

// Individual Toast Component
function Toast({ toast, onRemove }) {
    const config = toastConfig[toast.type] || toastConfig.info;
    const Icon = config.icon;

    const animationStyle = {
        animation: toast.isLeaving
            ? 'slideOutRight 0.4s ease-in forwards'
            : 'slideInRight 0.4s ease-out forwards',
    };

    return (
        <div
            className={`
                relative overflow-hidden
                ${config.bgColor} ${config.borderColor}
                border-l-4 rounded-xl shadow-2xl
                transform transition-all duration-500 ease-out
                min-w-[320px] max-w-[420px]
                backdrop-blur-sm
            `}
            style={animationStyle}
        >
            {/* Glass overlay effect */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

            {/* Content */}
            <div className="relative p-4">
                <div className="flex items-start gap-3">
                    {/* Icon with pulse animation */}
                    <div className={`flex-shrink-0 ${config.iconColor}`}>
                        <div className="relative">
                            <Icon size={24} className="drop-shadow-lg" />
                            <div className="absolute inset-0 animate-ping opacity-30">
                                <Icon size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                        {toast.title && (
                            <h4 className="font-bold text-white text-sm mb-0.5 drop-shadow-md">
                                {toast.title}
                            </h4>
                        )}
                        <p className="text-white/95 text-sm leading-relaxed drop-shadow-sm">
                            {toast.message}
                        </p>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={() => onRemove(toast.id)}
                        className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
                    >
                        <X size={18} className="text-white/80 hover:text-white" />
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                <div
                    className={`h-full ${config.progressColor}`}
                    style={{
                        animation: `shrink ${toast.duration || 4000}ms linear forwards`,
                    }}
                />
            </div>
        </div>
    );
}

// Toast Container Component - Only renders on client
function ToastContainer({ toasts, removeToast }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render on server to avoid hydration mismatch
    if (!mounted) {
        return null;
    }

    return (
        <>
            {/* Inject keyframes via style tag */}
            <style dangerouslySetInnerHTML={{ __html: keyframes }} />

            <div
                className="fixed top-4 right-4 flex flex-col gap-3 pointer-events-none"
                style={{ zIndex: 9999 }}
            >
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast toast={toast} onRemove={removeToast} />
                    </div>
                ))}
            </div>
        </>
    );
}

// Toast Provider Component
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, message, options = {}) => {
        const id = Date.now() + Math.random();
        const duration = options.duration || 4000;

        const newToast = {
            id,
            type,
            message,
            title: options.title,
            duration,
            isLeaving: false,
        };

        setToasts((prev) => [...prev, newToast]);

        // Auto remove after duration
        setTimeout(() => {
            setToasts((prev) =>
                prev.map((t) => (t.id === id ? { ...t, isLeaving: true } : t))
            );
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 400);
        }, duration);

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, isLeaving: true } : t))
        );
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 400);
    }, []);

    const toast = {
        success: (message, options) => addToast('success', message, options),
        error: (message, options) => addToast('error', message, options),
        warning: (message, options) => addToast('warning', message, options),
        info: (message, options) => addToast('info', message, options),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

// Hook to use toast
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
