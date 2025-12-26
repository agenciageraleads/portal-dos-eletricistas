'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Link from 'next/link';
import { ArrowRight, Share2, Eye, PlusCircle, LogOut } from 'lucide-react';

export default function DashboardPage() {
    const { user, logout, loading: authLoading } = useAuth();
    const [budgets, setBudgets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchBudgets();
        }
    }, [user]);

    const fetchBudgets = async () => {
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/budgets`);
            setBudgets(data);
        } catch (error) {
            console.error('Erro ao buscar orçamentos', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: string) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(parseFloat(price));
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR');
    };

    if (authLoading) return <div className="p-8">Carregando...</div>;
    if (!user) return <div className="p-8">Redirecionando para login...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
                        <h1 className="font-bold text-gray-800 hidden sm:block">Painel do Eletricista</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 hidden sm:block">Olá, <strong>{user.name}</strong></span>
                        <button onClick={logout} className="text-gray-400 hover:text-red-500 p-2">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Meus Orçamentos</h2>
                    <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors">
                        <PlusCircle size={20} />
                        Novo Orçamento
                    </Link>
                </div>

                {loading ? (
                    <div className="grid gap-4 animate-pulse">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                ) : budgets.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                        <p className="text-gray-500 mb-4">Você ainda não criou nenhum orçamento.</p>
                        <Link href="/" className="text-blue-600 font-medium hover:underline">
                            Começar agora
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {budgets.map((budget) => (
                            <div key={budget.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${budget.status === 'SHARED' ? 'bg-blue-100 text-blue-700' :
                                            budget.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {budget.status === 'SHARED' ? 'Enviado' : budget.status}
                                        </span>
                                        <span className="text-xs text-gray-400">Criado em {formatDate(budget.createdAt)}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg">{budget.client_name || 'Cliente Sem Nome'}</h3>
                                    <p className="text-sm text-gray-500">{budget._count?.items || 0} itens • Total: <span className="text-gray-900 font-bold">{formatPrice(budget.total_price)}</span></p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/o/${budget.id}`);
                                            alert('Link copiado!');
                                        }}
                                    >
                                        <Share2 size={16} />
                                        Copiar Link
                                    </button>
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                                        onClick={() => window.open(`/o/${budget.id}`, '_blank')}
                                    >
                                        <Eye size={16} />
                                        Ver
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
