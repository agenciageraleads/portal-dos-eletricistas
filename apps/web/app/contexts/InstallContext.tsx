'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

interface InstallContextType {
    isInstalled: boolean;
    isIOS: boolean;
    showInstallPrompt: boolean;
    triggerInstall: () => void;
    dismissPrompt: () => void;
}

const InstallContext = createContext<InstallContextType | undefined>(undefined);

export function InstallProvider({ children }: { children: React.ReactNode }) {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // Check if app is already installed
        if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Listen for beforeinstallprompt event (Android/Chrome only)
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Don't auto show banner if we want to control it via UI, 
            // but for now let's keep the logic or just store it.
            // If user previously dismissed, we might not want to show the footer banner,
            // but we ALWAYS want to capture the event for the Home Button.

            const dismissed = localStorage.getItem('pwa-install-dismissed');
            if (dismissed !== 'true') {
                setShowInstallPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowInstallPrompt(false);
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const triggerInstall = async () => {
        if (isIOS) {
            alert('Para instalar no iPhone: toque em Compartilhar e depois em "Adicionar à Tela de Início".');
        } else if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowInstallPrompt(false);
            }
            setDeferredPrompt(null);
        } else {
            // Fallback
            alert('Para instalar, procure a opção "Adicionar à Tela de Início" no menu do seu navegador.');
        }
    };

    const dismissPrompt = () => {
        setShowInstallPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    return (
        <InstallContext.Provider value={{ isInstalled, isIOS, showInstallPrompt, triggerInstall, dismissPrompt }}>
            {children}
            {/* We can render the Banner here globally if we want, or keep it separate */}
        </InstallContext.Provider>
    );
}

export function useInstallPrompt() {
    const context = useContext(InstallContext);
    if (context === undefined) {
        throw new Error('useInstallPrompt must be used within an InstallProvider');
    }
    return context;
}
