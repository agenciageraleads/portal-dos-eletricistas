'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, MessageSquare } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function InboxPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
            <header className="bg-white p-4 border-b border-gray-200 sticky top-0 z-20 flex items-center gap-3 shadow-sm">
                <Link href="/" className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="font-bold text-gray-800 text-lg">Notificações</h1>
            </header>

            <main className="flex-1 p-4 max-w-md mx-auto w-full">
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <Bell size={32} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Tudo limpo por aqui!</h2>
                        <p className="text-gray-500 max-w-xs mx-auto mt-1">
                            Você não tem novas notificações no momento. Avisaremos quando algo importante acontecer.
                        </p>
                    </div>
                </div>

                {/* Exemplo de como seria uma notificação 
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3 flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-800">Nova resposta no orçamento</h3>
                        <p className="text-xs text-gray-600 mt-1">O cliente Maria visualizou seu orçamento.</p>
                        <span className="text-[10px] text-gray-400 mt-2 block">Há 5 minutos</span>
                    </div>
                </div>
                */}
            </main>

            <BottomNav />
        </div>
    );
}
