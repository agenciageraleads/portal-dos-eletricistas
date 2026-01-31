'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, MessageSquare, CheckCircle } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import PushNotificationManager from '../components/PushNotificationManager';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    title: string;
    message: string;
    read: boolean;
    type: string;
    link?: string;
    createdAt: string;
}

export default function InboxPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
            setLoading(false);
        }
    };

    const markAsRead = async (id: string, link?: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            // Update local state
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

            if (link) {
                router.push(link);
            }
        } catch (error) {
            console.error('Erro ao marcar como lida:', error);
            if (link) router.push(link);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
            <header className="bg-white p-4 border-b border-gray-200 sticky top-0 z-20 flex items-center gap-3 shadow-sm">
                <Link href="/" className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="font-bold text-gray-800 text-lg">Notificações</h1>
            </header>

            <main className="flex-1 p-4 max-w-md mx-auto w-full">
                <PushNotificationManager />

                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-400">
                            <Bell size={40} className="animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-gray-800">Tudo limpo por aqui! 🚀</h2>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                Você não tem novas notificações no momento. Avisaremos quando algo importante acontecer.
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                        >
                            Voltar ao Início
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => markAsRead(notification.id, notification.link)}
                                className={`
                                    p-4 rounded-xl shadow-sm border cursor-pointer transition-all
                                    ${notification.read ? 'bg-white border-gray-100 opacity-70' : 'bg-blue-50 border-blue-100 shadow-md'}
                                `}
                            >
                                <div className="flex gap-3">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                        ${notification.read ? 'bg-gray-100 text-gray-500' : 'bg-blue-200 text-blue-700'}
                                    `}>
                                        {notification.type === 'NEW_SERVICE' ? <Bell size={20} /> : <MessageSquare size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`text-sm font-bold ${notification.read ? 'text-gray-700' : 'text-blue-900'}`}>
                                                {notification.title}
                                            </h3>
                                            {!notification.read && (
                                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed mb-2">
                                            {notification.message}
                                        </p>
                                        <span className="text-[10px] text-gray-400 block">
                                            {formatDate(notification.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
