'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import BottomNav from '../components/BottomNav';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';

export default function FeedbackPage() {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [type, setType] = useState('GENERAL');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const { user } = useAuth(); // Need to import useAuth
    const [feedbacks, setFeedbacks] = useState<any[]>([]);

    // Fetch feedbacks
    useEffect(() => {
        api.get('/feedback?scope=me').then(({ data }) => setFeedbacks(data)).catch(console.error);
    }, [sent]);

    const handleReply = async (id: string, reply: string) => {
        try {
            await api.patch(`/feedback/${id}/reply`, { reply });
            setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, reply, repliedAt: new Date() } : f));
        } catch (error) {
            alert('Erro ao responder');
        }
    };

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
                    Sua opinião é fundamental para melhorarmos o PortalElétricos.
                </p>
                <button
                    onClick={() => { setSent(false); setMessage(''); }}
                    className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition"
                >
                    Enviar Outro
                </button>
                <button
                    onClick={() => router.back()}
                    className="mt-4 text-blue-600 font-bold hover:underline"
                >
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            <PageHeader
                title="Feedback e Sugestões"
                showBack={true}
            />

            <main className="max-w-md mx-auto p-4 pb-24">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Novo Feedback</h2>
                            <p className="text-sm text-gray-500">Ajude-nos a melhorar o app.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
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
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Sua mensagem..."
                                rows={4}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Enviando...' : <span>Enviar</span>}
                        </button>
                    </form>
                </div>

                {/* Support Button */}
                <div className="flex justify-center mb-8">
                    <a
                        href="https://wa.me/5562982435286"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                        <MessageSquare size={20} />
                        Falar com Suporte no WhatsApp
                    </a>
                </div>

                <h3 className="font-bold text-gray-800 mb-4 px-1">Histórico</h3>
                <div className="space-y-4">
                    {feedbacks.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.type === 'GENERAL' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {item.type === 'GENERAL' ? 'Sugestão' : 'Report'}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-800 text-sm mb-3">{item.message}</p>

                            {item.reply ? (
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <p className="text-xs font-bold text-blue-800 mb-1">Resposta do Admin:</p>
                                    <p className="text-sm text-blue-900">{item.reply}</p>
                                </div>
                            ) : (
                                user?.role === 'ADMIN' && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <input
                                            type="text"
                                            placeholder="Responder..."
                                            className="w-full text-sm p-2 border rounded-lg"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleReply(item.id, e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Pressione Enter para enviar.</p>
                                    </div>
                                )
                            )}
                        </div>
                    ))}
                    {feedbacks.length === 0 && (
                        <p className="text-center text-gray-400 text-sm py-4">Nenhum feedback enviado.</p>
                    )}
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
