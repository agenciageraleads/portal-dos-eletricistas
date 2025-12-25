'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import api from '@/lib/api';
import { ChevronLeft, Eye, Calendar, User, DollarSign, FileText } from 'lucide-react';

interface Budget {
    id: string;
    client_name: string;
    total_price: string; // Vem como string do backend as vezes ou number
    status: string;
    createdAt: string;
    _count: {
        items: number;
    }
}

export default function MyBudgetsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchBudgets();
        }
    }, [user, authLoading, router]);

    const fetchBudgets = async () => {
        try {
            const response = await api.get('/budgets');
            setBudgets(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar orçamentos:', error);
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            SHARED: 'bg-blue-100 text-blue-800',
            DRAFT: 'bg-gray-100 text-gray-800',
            APPROVED: 'bg-green-100 text-green-800',
            CONVERTED: 'bg-purple-100 text-purple-800',
            EXPIRED: 'bg-red-100 text-red-800'
        };

        const labels: Record<string, string> = {
            SHARED: 'Criado',
            DRAFT: 'Rascunho',
            APPROVED: 'Aprovado',
            CONVERTED: 'Vendido',
            EXPIRED: 'Expirado'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (authLoading || (loading && user)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/" className="text-gray-500 hover:text-gray-700">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800">Meus Orçamentos</h1>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6">
                {budgets.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Nenhum orçamento encontrado</h3>
                        <p className="text-gray-500 mt-2">Você ainda não criou nenhum orçamento.</p>
                        <Link
                            href="/"
                            className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Criar Novo Orçamento
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {budgets.map((budget) => (
                            <div key={budget.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar size={14} />
                                        <span>{formatDate(budget.createdAt)}</span>
                                        <span className="text-gray-300">|</span>
                                        <span>{budget._count?.items || 0} itens</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                        <User size={16} className="text-gray-400" />
                                        {budget.client_name || 'Cliente não identificado'}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(budget.status)}
                                        <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded text-sm">
                                            {formatCurrency(budget.total_price)}
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    href={`/o/${budget.id}`} // Assumindo que a rota de visualização pública/shared é /o/:id
                                    className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition whitespace-nowrap"
                                >
                                    <Eye size={18} />
                                    Ver Detalhes
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
