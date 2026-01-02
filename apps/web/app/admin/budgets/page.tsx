'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import api from '@/lib/api';
import { ChevronLeft, Shield, FileText, User, Calendar } from 'lucide-react';

interface BudgetAdmin {
    id: string;
    client_name: string;
    total_price: number;
    status: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
    _count: {
        items: number;
    };
}

export default function AdminBudgetsPage() {
    const { user: currentUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [budgets, setBudgets] = useState<BudgetAdmin[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!currentUser || currentUser.role !== 'ADMIN')) {
            router.push('/');
            return;
        }

        if (currentUser?.role === 'ADMIN') {
            fetchBudgets();
        }
    }, [currentUser, authLoading, router]);

    const fetchBudgets = async () => {
        try {
            const response = await api.get('/budgets/admin/all');
            setBudgets(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar orçamentos:', error);
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
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

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            SHARED: 'bg-blue-100 text-blue-800',
            DRAFT: 'bg-gray-100 text-gray-800',
            APPROVED: 'bg-green-100 text-green-800',
            CONVERTED: 'bg-purple-100 text-purple-800',
            EXPIRED: 'bg-red-100 text-red-800'
        };

        const labels: Record<string, string> = {
            SHARED: 'Enviado',
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

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                        <ChevronLeft size={24} />
                    </Link>
                    <Shield size={24} className="text-blue-600" />
                    <h1 className="text-xl font-bold text-gray-800">Todos os Orçamentos</h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Total de Orçamentos</h3>
                        <p className="text-2xl font-bold text-gray-900">{budgets.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Valor Total</h3>
                        <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(budgets.reduce((acc, b) => acc + Number(b.total_price), 0))}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Ticket Médio</h3>
                        <p className="text-2xl font-bold text-green-600">
                            {budgets.length > 0 ? formatCurrency(budgets.reduce((acc, b) => acc + Number(b.total_price), 0) / budgets.length) : 'R$ 0,00'}
                        </p>
                    </div>
                </div>

                {/* Budgets Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Eletricista
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Data
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Valor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {budgets.map((budget) => (
                                    <tr key={budget.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{budget.client_name || 'Não informado'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{budget.user.name}</p>
                                                <p className="text-xs text-gray-500">{budget.user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">{formatDate(budget.createdAt)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900">{budget._count.items}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-green-700">{formatCurrency(budget.total_price)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(budget.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/o/${budget.id}`}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                            >
                                                Ver Detalhes
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {budgets.length === 0 && (
                    <div className="text-center py-12">
                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Nenhum orçamento encontrado</h3>
                    </div>
                )}
            </main>
        </div>
    );
}
