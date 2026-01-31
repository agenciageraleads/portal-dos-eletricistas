'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const icons = {
        success: <CheckCircle className="text-white" size={20} />,
        error: <AlertCircle className="text-white" size={20} />,
        warning: <AlertTriangle className="text-white" size={20} />,
        info: <Info className="text-white" size={20} />
    };

    return (
        <div className={`fixed top-4 right-4 z-[9999] flex items-center p-4 rounded-lg shadow-lg text-white animate-slideIn ${bgColors[type]}`}>
            <div className="mr-3">{icons[type]}</div>
            <div className="mr-8 font-medium">{message}</div>
            <button onClick={onClose} className="ml-auto hover:opacity-75 transition-opacity">
                <X size={18} />
            </button>
        </div>
    );
};

interface ToastProviderProps {
    children: React.ReactNode;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const showToast = (message: string, type: ToastType) => {
        setToast({ message, type });
    };

    const hideToast = () => setToast(null);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
