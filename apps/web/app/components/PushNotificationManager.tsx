'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '@/lib/api';

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
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (window as any).workbox !== undefined) {
            // Wait for service worker to be ready
            navigator.serviceWorker.ready.then(reg => {
                setRegistration(reg);
                reg.pushManager.getSubscription().then(sub => {
                    if (sub && !(sub.expirationTime && Date.now() > sub.expirationTime)) {
                        setSubscription(sub);
                        setIsSubscribed(true);
                    }
                });
            });
        }
    }, []);

    const subscribeToPush = async () => {
        if (!registration || !VAPID_PUBLIC_KEY) {
            console.error('Registration or Key missing');
            return;
        }

        try {
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Send to backend
            await api.post('/notifications/subscribe', sub);

            setSubscription(sub);
            setIsSubscribed(true);
            alert('Notificações ativadas com sucesso!');
        } catch (error) {
            console.error('Failed to subscribe user: ', error);
            alert('Erro ao ativar notificações. Verifique se você deu permissão.');
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
