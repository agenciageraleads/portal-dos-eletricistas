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
    const [showInstructions, setShowInstructions] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

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

        // Show for iOS users if not dismissed, since beforeinstallprompt doesnt fire
        if (ios && !isInstalled) {
            setShowInstallPrompt(true);
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
        if (isIOS) {
            // iOS instructions
            setShowInstructions(true);
        } else if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowInstallPrompt(false);
            }
            setDeferredPrompt(null);
        } else {
            // Fallback for desktop or non-supported browsers
            alert('Para instalar, procure a opção "Adicionar à Tela de Início" no menu do seu navegador.');
        }
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!showInstallPrompt || isInstalled) {
        return null;
    }

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-violet-600 text-white p-4 shadow-2xl z-50 animate-slide-up pb-safe">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-sm font-semibold mb-1">Instalar PortalElétricos</p>
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
                            {isIOS ? 'Como Instalar?' : 'Instalar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* iOS Instructions Modal */}
            {showInstructions && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-end sm:items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white text-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Instalar no iPhone</h3>
                            <button onClick={() => setShowInstructions(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><span className="text-xl">×</span></button>
                        </div>
                        <ol className="space-y-4 text-sm">
                            <li className="flex gap-3 items-center">
                                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                                <span>Toque no botão <strong>Compartilhar</strong> <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Ios_share_icon.svg" className="inline w-4 h-4 mx-1" alt="Share" /> na barra inferior.</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                                <span>Role para cima e selecione <strong>Adicionar à Tela de Início</strong>.</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                                <span>Confirme clicando em <strong>Adicionar</strong> no canto superior.</span>
                            </li>
                        </ol>
                        <button onClick={() => setShowInstructions(false)} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Entendi</button>
                    </div>
                </div>
            )}
        </>
    );
}
