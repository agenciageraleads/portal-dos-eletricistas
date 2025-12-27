'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if user previously dismissed
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed === 'true') {
            return;
        }

        // Listen for beforeinstallprompt event (Android/Chrome only)
        const handler = (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed via appinstalled event
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowInstallPrompt(false);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowInstallPrompt(false);
        }

        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!showInstallPrompt || isInstalled) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-violet-600 text-white p-4 shadow-2xl z-50 animate-slide-up">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="text-sm font-semibold mb-1">Instalar Portal dos Eletricistas</p>
                    <p className="text-xs opacity-90">
                        Adicione à tela inicial para acesso rápido e recursos offline
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleDismiss}
                        className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                    >
                        Agora não
                    </button>
                    <button
                        onClick={handleInstallClick}
                        className="px-6 py-2 bg-white text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl"
                    >
                        Instalar
                    </button>
                </div>
            </div>
        </div>
    );
}
