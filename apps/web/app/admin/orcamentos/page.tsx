'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';

interface Budget {
    id: string;
    client_name: string | null;
    client_phone: string | null;
    status: string;
    total_price: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
        phone: string | null;
    };
    _count: { items: number };
}

export default function AdminBudgets() {
    const { user } = useAuth();
    const router = useRouter();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/');
            return;
        }

        const fetchBudgets = async () => {
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/admin/budgets?page=${page}`
                );
                setBudgets(data.data);
                setTotalPages(data.pagination.totalPages);
            } catch (error) {
                console.error('Error fetching budgets:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBudgets();
        }
    }, [user, router, page]);

    if (loading || !user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Carregando...</div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-700';
            case 'SHARED': return 'bg-blue-100 text-blue-700';
            case 'APPROVED': return 'bg-green-100 text-green-700';
            case 'CONVERTED': return 'bg-purple-100 text-purple-700';
            case 'EXPIRED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'Rascunho';
            case 'SHARED': return 'Enviado';
            case 'APPROVED': return 'Aprovado';
            case 'CONVERTED': return 'Convertido';
            case 'EXPIRED': return 'Expirado';
            default: return status;
        }
    };

    const formatPrice = (price: string) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(Number(price));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">Orçamentos</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Eletricista
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Itens
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Valor Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {budgets.map((budget) => (
                                    <tr key={budget.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="text-blue-600" size={20} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{budget.user.name}</div>
                                                    <div className="text-sm text-gray-500">{budget.user.phone || budget.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{budget.client_name || '-'}</div>
                                            <div className="text-sm text-gray-500">{budget.client_phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{budget._count.items} itens</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                                                <DollarSign size={16} className="text-green-600" />
                                                {formatPrice(budget.total_price)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(budget.status)}`}>
                                                {getStatusText(budget.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(budget.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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
        </div>
    );
}
