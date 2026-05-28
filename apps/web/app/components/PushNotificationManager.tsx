'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '@/lib/api';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PushNotificationManager() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isNative, setIsNative] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        const checkPlatform = () => {
            const isCapacitor = Capacitor.isNativePlatform();
            setIsNative(isCapacitor);

            if (isCapacitor) {
                // Capacitor: Check if already have permission or token
                PushNotifications.checkPermissions().then((res) => {
                    if (res.receive === 'granted') {
                        setIsSubscribed(true);
                        // Optional: Re-register to ensure token is fresh
                        registerCapacitorPush();
                    }
                });
            } else if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                // PWA: Check existing SW registration
                navigator.serviceWorker.ready.then(reg => {
                    setRegistration(reg);
                    reg.pushManager.getSubscription().then(sub => {
                        if (sub && !(sub.expirationTime && Date.now() > sub.expirationTime)) {
                            setIsSubscribed(true);
                        }
                    });
                });
            }
        };

        checkPlatform();
    }, []);

    const registerCapacitorPush = async () => {
        try {
            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                throw new Error('User denied permissions!');
            }

            await PushNotifications.register();

            // Handle token registration
            PushNotifications.addListener('registration', async (token) => {
                console.log('FCM Token:', token.value);
                await api.post('/notifications/fcm-token', {
                    token: token.value,
                    deviceType: Capacitor.getPlatform()
                });
                setIsSubscribed(true);
            });

            PushNotifications.addListener('registrationError', (error) => {
                console.error('Registration error: ', error.error);
            });

        } catch (e) {
            console.error('Error in Capacitor Push register:', e);
        }
    };

    const subscribeToPush = async () => {
        if (isNative) {
            await registerCapacitorPush();
            return;
        }

        if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
            alert('Para ativar notificações, acesse via HTTPS ou localhost.');
            return;
        }

        if (!registration || !VAPID_PUBLIC_KEY) {
            if (!('serviceWorker' in navigator)) {
                alert('Seu navegador não suporta Service Workers/Notificações.');
                return;
            }
            if (!VAPID_PUBLIC_KEY) {
                console.error('VAPID Key missing in env');
                return;
            }
            alert('Aguarde o carregamento do sistema e tente novamente.');
            return;
        }

        try {
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Send to backend
            await api.post('/notifications/subscribe', sub);

            setIsSubscribed(true);
            alert('Notificações ativadas com sucesso!');
        } catch (error: any) {
            console.error('Failed to subscribe user: ', error);
            if (error.name === 'NotAllowedError') {
                alert('Você bloqueou as permissões. Vá nas configurações do site (cadeado na barra de endereço) e permita Notificações.');
            } else {
                alert('Erro ao ativar notificações: ' + error.message);
            }
        }
    };

    if (isSubscribed) return null; // Already subscribed, hide button

    return (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Bell size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-blue-900 text-sm">Receber avisos?</h3>
                    <p className="text-xs text-blue-700">Saiba quando um serviço novo aparecer.</p>
                </div>
            </div>
            <button
                onClick={subscribeToPush}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition"
            >
                Ativar
            </button>
        </div>
    );
}
