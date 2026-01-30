'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Package, Calendar, MessageCircle } from 'lucide-react';
import api from '@/lib/api';

interface Feedback {
    id: string;
    type: string;
    message: string;
    userEmail: string | null;
    createdAt: string;
    user?: {
        name: string;
        email: string;
        phone?: string;
    } | null;
    product: {
        name: string;
        sankhya_code: number;
    } | null;
}

export default function AdminFeedbacks() {
    const { user } = useAuth();
    const router = useRouter();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [replyingId, setReplyingId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleReply = async (id: string) => {
        if (!replyText.trim()) return;
        setSubmitting(true);
        try {
            await api.patch(`/admin/feedbacks/${id}/reply`, { reply: replyText });
            setReplyingId(null);
            setReplyText('');
            // Reload
            const { data } = await api.get(`/admin/feedbacks?page=${page}`);
            setFeedbacks(data.data);
            alert('Resposta enviada!');
        } catch (error) {
            console.error(error);
            alert('Erro ao enviar resposta');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/');
            return;
        }

        const fetchFeedbacks = async () => {
            try {
                const { data } = await api.get(`/admin/feedbacks?page=${page}`);
                setFeedbacks(data.data);
                setTotalPages(data.pagination.totalPages);
            } catch (error) {
                console.error('Error fetching feedbacks:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchFeedbacks();
        }
    }, [user, router, page]);

    const openWhatsApp = (feedback: Feedback) => {
        const phone = feedback.user?.phone || '';
        const name = feedback.user?.name || 'Cliente';
        const email = feedback.user?.email || feedback.userEmail || '';

        const message = `Olá ${name}! Vimos seu feedback no PortalElétricos (${email}): "${feedback.message}". Gostaríamos de conversar sobre...`;

        const cleanPhone = phone.replace(/\D/g, '');
        if (!cleanPhone) {
            alert('Usuário sem telefone cadastrado.');
            return;
        }

        const url = `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    if (loading || !user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Carregando...</div>
            </div>
        );
    }

    const getTypeText = (type: string) => {
        switch (type) {
            case 'GENERAL': return 'Geral';
            case 'PRODUCT_REPORT': return 'Problema no Produto';
            default: return type;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.push('/admin')} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Gerir Feedbacks</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                        <div key={feedback.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                                            {getTypeText(feedback.type)}
                                        </span>
                                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(feedback.createdAt).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <div className="text-sm font-bold text-gray-800">
                                        {feedback.user?.name || 'Visitante'}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openWhatsApp(feedback)}
                                            className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                                        >
                                            <MessageCircle size={14} /> WhatsApp
                                        </button>
                                        <button
                                            onClick={() => setReplyingId(replyingId === feedback.id ? null : feedback.id)}
                                            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                                        >
                                            <MessageSquare size={14} /> Responder
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {feedback.product && (
                                <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center gap-2 text-sm border border-gray-100">
                                    <Package size={16} className="text-gray-400" />
                                    <span className="font-medium text-gray-700">{feedback.product.name}</span>
                                    <span className="text-gray-400 text-xs">(Cód: {feedback.product.sankhya_code})</span>
                                </div>
                            )}

                            <div className="text-gray-700 bg-gray-50/50 p-4 rounded-xl text-sm italic mb-4">
                                "{feedback.message}"
                            </div>

                            {replyingId === feedback.id && (
                                <div className="mt-4 border-t pt-4 animate-in slide-in-from-top-2">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Escreva sua resposta..."
                                        className="w-full p-3 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
                                        rows={3}
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            onClick={() => setReplyingId(null)}
                                            className="px-4 py-2 text-sm text-gray-500 font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => handleReply(feedback.id)}
                                            disabled={submitting || !replyText.trim()}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {submitting ? 'Enviando...' : 'Enviar Resposta'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {feedbacks.length === 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <MessageSquare className="mx-auto text-gray-200 mb-4" size={48} />
                            <p className="text-gray-500">Nenhum feedback recebido ainda.</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <span className="text-sm border border-gray-200 bg-white px-4 py-2 rounded-lg">
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                        >
                            Próxima
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
