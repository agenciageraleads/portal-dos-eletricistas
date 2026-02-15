'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import api from '@/lib/api';
import { ChevronLeft, Eye, Calendar, User, DollarSign, FileText, Trash2, XCircle } from 'lucide-react';

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

import UserMenu from '../components/UserMenu';

export default function MyBudgetsPage() {
    const { user, loading: authLoading, logout } = useAuth();
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
            SHARED: 'bg-teal-50 text-brand-primary',
            DRAFT: 'bg-gray-100 text-gray-800',
            APPROVED: 'bg-emerald-50 text-emerald-700',
            REJECTED: 'bg-red-50 text-red-700',
            NEGOTIATING: 'bg-amber-50 text-amber-700',
            CONVERTED: 'bg-brand-primary text-white border-brand-primary',
            EXPIRED: 'bg-gray-200 text-gray-600'
        };

        const labels: Record<string, string> = {
            SHARED: 'Enviado',
            DRAFT: 'Rascunho',
            APPROVED: 'Aprovado',
            REJECTED: 'Recusado',
            NEGOTIATING: 'Negociando',
            CONVERTED: 'Fechado ✅',
            EXPIRED: 'Perdido'
        };

        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-transparent ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (authLoading || (loading && user)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase tracking-[0.2em] font-bold text-[10px] text-gray-400">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent"></div>
                    Carregando Propostas
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ChevronLeft size={24} />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-800">Meus Orçamentos</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/orcamento/novo"
                            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-95"
                        >
                            + Novo
                        </Link>
                        <UserMenu user={user} logout={logout} />
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-md mx-auto px-4 py-6 w-full">

                {/* Mini Dashboard Brand Evolution */}
                {budgets.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Em Negociação</h3>
                            <p className="text-lg font-bold text-brand-primary">
                                {formatCurrency(budgets.filter(b => b.status !== 'CONVERTED' && b.status !== 'EXPIRED').reduce((acc, curr) => acc + Number(curr.total_price), 0))}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Fechados</h3>
                            <p className="text-lg font-bold text-emerald-600">
                                {formatCurrency(budgets.filter(b => b.status === 'CONVERTED').reduce((acc, curr) => acc + Number(curr.total_price), 0))}
                            </p>
                        </div>
                    </div>
                )}

                {budgets.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Nenhum orçamento</h3>
                        <p className="text-gray-500 mt-2 text-sm">Comece criando sua primeira <br />proposta profissional.</p>
                        <Link
                            href="/orcamento/novo"
                            className="mt-8 inline-block bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-primary-hover transition-all shadow-xl active:scale-95"
                        >
                            Criar Agora
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {budgets.map((budget) => (
                            <div key={budget.id} data-testid="budget-card" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition">
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

                                <div className="flex gap-2 mt-2 sm:mt-0">
                                    <Link
                                        href={`/o/${budget.id}`}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-brand-primary-light text-brand-primary px-3 py-2 rounded-lg font-bold text-xs hover:bg-teal-100 transition shadow-sm"
                                    >
                                        <Eye size={16} /> Ver
                                    </Link>

                                    {/* Actions Menu or Simple Buttons */}
                                    <button
                                        onClick={async () => {
                                            if (confirm('Marcar como Ganho/Vendido?')) {
                                                try {
                                                    await api.patch(`/budgets/${budget.id}`, { status: 'CONVERTED' });
                                                    fetchBudgets();
                                                } catch (error) {
                                                    console.error('Erro ao marcar como ganho:', error);
                                                    alert('Não foi possível marcar como ganho. Tente novamente.');
                                                }
                                            }
                                        }}
                                        className="flex items-center justify-center p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
                                        title="Marcar como Ganho"
                                    >
                                        <DollarSign size={16} />
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (confirm('Marcar como Perdido?')) {
                                                try {
                                                    await api.patch(`/budgets/${budget.id}`, { status: 'EXPIRED' });
                                                    fetchBudgets();
                                                } catch (error) {
                                                    console.error('Erro ao marcar como perdido:', error);
                                                    alert('Não foi possível marcar como perdido. Tente novamente.');
                                                }
                                            }
                                        }}
                                        className="flex items-center justify-center p-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100"
                                        title="Marcar como Perdido"
                                    >
                                        <XCircle size={16} />
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (confirm('Excluir orçamento permanentemente?')) {
                                                // In real app maybe archive (EXPIRED) or Delete
                                                await api.delete(`/budgets/${budget.id}`);
                                                fetchBudgets();
                                            }
                                        }}
                                        className="flex items-center justify-center p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
