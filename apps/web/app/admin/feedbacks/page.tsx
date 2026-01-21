'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Package, Calendar } from 'lucide-react';
import axios from 'axios';

interface Feedback {
    id: string;
    type: string;
    message: string;
    userEmail: string | null;
    createdAt: string;
    user?: {
        name: string;
        email: string;
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

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/');
            return;
        }

        const fetchFeedbacks = async () => {
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/admin/feedbacks?page=${page}`
                );
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

    if (loading || !user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Carregando...</div>
            </div>
        );
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'GENERAL': return 'bg-blue-100 text-blue-700';
            case 'PRODUCT_REPORT': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

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
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">Feedbacks</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                        <div key={feedback.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <MessageSquare className="text-yellow-600" size={20} />
                                    </div>
                                    <div>
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(feedback.type)}`}>
                                            {getTypeText(feedback.type)}
                                        </span>
                                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                            <Calendar size={14} />
                                            {new Date(feedback.createdAt).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                                {feedback.user ? (
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-gray-800">
                                            {feedback.user.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {feedback.user.email}
                                        </div>
                                    </div>
                                ) : (feedback.userEmail && (
                                    <div className="text-sm text-gray-600">
                                        {feedback.userEmail}
                                    </div>
                                ))}
                            </div>

                            {feedback.product && (
                                <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                                    <Package size={16} className="text-gray-500" />
                                    <div className="text-sm">
                                        <span className="font-medium text-gray-700">{feedback.product.name}</span>
                                        <span className="text-gray-500 ml-2">(Cód: {feedback.product.sankhya_code})</span>
                                    </div>
                                </div>
                            )}

                            <div className="text-gray-700 whitespace-pre-wrap">
                                {feedback.message}
                            </div>
                        </div>
                    ))}

                    {feedbacks.length === 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500">Nenhum feedback recebido ainda.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-4">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-700">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próxima
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
