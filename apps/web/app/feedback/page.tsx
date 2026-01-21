'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import BottomNav from '../components/BottomNav';
import PageHeader from '../components/PageHeader';

export default function FeedbackPage() {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [type, setType] = useState('GENERAL');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsLoading(true);
        try {
            await api.post('/feedback', {
                message,
                type
            });
            setSent(true);
        } catch (error) {
            alert('Erro ao enviar feedback. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                    <Send size={40} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Obrigado pelo Feedback!</h1>
                <p className="text-gray-600 mb-8 max-w-sm">
                    Sua opinião é fundamental para melhorarmos o Portal dos Eletricistas.
                </p>
                <button
                    onClick={() => router.back()}
                    className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition"
                >
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            <PageHeader
                title="Enviar Feedback"
                showBack={true}
            />

            <main className="max-w-md mx-auto p-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">O que você achou?</h2>
                            <p className="text-sm text-gray-500">Ajude-nos a melhorar o app.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Feedback</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="GENERAL">Sugestão ou Elogio</option>
                                <option value="PRODUCT_REPORT">Relatar Problema</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sua mensagem</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Conte-nos o que você gostou ou o que podemos melhorar..."
                                rows={6}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Enviando...' : (
                                <>
                                    <span>Enviar Feedback</span>
                                    <Send size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Seu feedback será analisado pela nossa equipe de produto.
                </p>
            </main>
            <BottomNav />
        </div>
    );
}
