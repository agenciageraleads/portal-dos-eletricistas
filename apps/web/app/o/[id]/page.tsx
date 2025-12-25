'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Check, MessageCircle, PackageOpen } from 'lucide-react';
import Link from 'next/link';

export default function BudgetViewPage() {
    const params = useParams();
    const id = params.id as string;
    const [budget, setBudget] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchBudget();
        }
    }, [id]);

    const fetchBudget = async () => {
        try {
            const { data } = await axios.get(`http://localhost:3333/budgets/${id}`);
            setBudget(data);
        } catch (error) {
            console.error('Erro ao buscar orçamento', error);
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

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando orçamento...</div>;
    if (!budget) return <div className="p-8 text-center text-red-500">Orçamento não encontrado.</div>;

    const electrician = budget.user;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/orcamentos" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </Link>
                    <div className="flex-1 text-center pr-10"> {/* pr-10 balances the left button */}
                        <h1 className="text-lg font-bold text-gray-800">Detalhes do Orçamento</h1>
                        <p className="text-xs text-gray-500">
                            {budget.client_name}
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <span className="text-sm text-gray-500 block mb-1">Mão de Obra do Eletricista</span>
                        <span className="text-2xl font-bold text-gray-800">{formatPrice(budget.total_labor)}</span>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <span className="text-sm text-gray-500 block mb-1">Materiais Necessários (Loja)</span>
                        <span className="text-2xl font-bold text-gray-800">{formatPrice(budget.total_materials)}</span>
                    </div>
                </div>

                {/* Lista de Itens */}
                <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 font-medium text-gray-700">
                        Lista de Materiais
                    </div>
                    <div className="divide-y divide-gray-100">
                        {budget.items.map((item: any) => (
                            <div key={item.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-gray-800">{item.product.name}</div>
                                    <div className="text-xs text-gray-500">{item.quantity}x {formatPrice(item.price)}</div>
                                </div>
                                <div className="font-bold text-gray-700">{formatPrice((item.price * item.quantity).toString())}</div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-gray-800">Total Geral</span>
                        <span className="text-2xl font-bold text-blue-600">{formatPrice(budget.total_price)}</span>
                    </div>
                </section>

                {/* Ações */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:static md:bg-transparent md:border-t-0 md:p-0">
                    <div className="max-w-3xl mx-auto flex flex-col gap-3">
                        <button
                            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-200 active:scale-95"
                            onClick={() => {
                                const msg = `Olá! Vi o orçamento #${budget.id.slice(0, 5)} no valor de ${formatPrice(budget.total_price)}. Poderíamos agendar?`;
                                const phone = electrician?.phone?.replace(/\D/g, '');
                                if (phone) {
                                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                                } else {
                                    alert('Telefone do eletricista não disponível.');
                                }
                            }}
                        >
                            <MessageCircle size={24} />
                            Falar com Eletricista (Aprovar)
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
}
