'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Check, MessageCircle, PackageOpen, Share2, Edit, Loader2, PackagePlus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useRouter } from 'next/navigation';
import { DownloadBudgetButton } from '../../components/DownloadBudgetButton';
import { getImageUrl, formatCurrency } from '@/lib/utils';

export default function BudgetViewPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { user } = useAuth();
    const { loadBudgetIntoCart } = useCart();
    const [budget, setBudget] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Fix: JWT payload usually returns 'sub' as ID, but our interface expects 'id'. 
    // We check both to be safe.
    const userId = user?.id || (user as any)?.sub;
    const isOwner = userId && budget && userId === budget.userId;



    const handleEdit = () => {
        if (!budget) return;
        loadBudgetIntoCart(budget.items);
        router.push(`/orcamento?edit=${id}`);
    };

    const handleShare = () => {
        const shareLink = window.location.href;
        const message = `Aqui está o seu orçamento, acesse esse link para visualizar os detalhes: ${shareLink}`;
        const phone = budget.client_phone?.replace(/\D/g, '');

        if (phone) {
            const finalPhone = phone.length <= 11 ? `55${phone}` : phone;
            window.open(`https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(message)}`, '_blank');
            localStorage.setItem('hasSharedWhatsapp', 'true');
            window.dispatchEvent(new Event('jornada-progress-update'));
        } else {
            // Fallback se não tiver telefone: copia o link
            navigator.clipboard.writeText(shareLink)
                .then(() => alert('Link copiado! Cole no WhatsApp do cliente.'))
                .catch(() => prompt('Copie o link:', shareLink));
        }
    };

    useEffect(() => {
        if (id) {
            fetchBudget();
        }
    }, [id]);

    const fetchBudget = async () => {
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/budgets/${id}`);
            setBudget(data);
        } catch (error) {
            console.error('Erro ao buscar orçamento', error);
        } finally {
            setLoading(false);
        }
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
                    <div className="flex-1 text-center pr-10 flex flex-col items-center">
                        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            Detalhes do Orçamento
                            {budget.status === 'DRAFT' && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-bold border border-yellow-200">
                                    Rascunho
                                </span>
                            )}
                        </h1>
                        <p className="text-xs text-gray-500">
                            {budget.client_name}
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

                {/* Identidade do Eletricista (NOVO) */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg p-6 text-white text-center sm:text-left sm:flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white/30 shrink-0 mx-auto sm:mx-0 overflow-hidden">
                        {electrician?.logo_url ? (
                            <img
                                src={getImageUrl(electrician.logo_url) || undefined}
                                alt={electrician.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span>{electrician?.name?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <span className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1 block">Orçamento enviado por:</span>
                        <h2 className="text-2xl font-bold mb-1">{electrician?.name || 'Eletricista'}</h2>
                        {electrician?.bio && <p className="text-blue-100 text-sm italic">"{electrician.bio}"</p>}
                    </div>
                    <div className="mt-4 sm:mt-0">
                        {/* Optional CTA here if needed */}
                    </div>
                </div>

                {/* Resumo (Condicional) */}
                {budget.show_labor_total ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <span className="text-sm text-gray-500 block mb-1">Mão de Obra do Eletricista</span>
                            <span className="text-2xl font-bold text-gray-800">{formatCurrency(budget.total_labor)}</span>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <span className="text-sm text-gray-500 block mb-1">Materiais Necessários (Loja)</span>
                            <span className="text-2xl font-bold text-gray-800">{formatCurrency(budget.total_materials)}</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                        <span className="text-sm text-gray-500 block mb-1">Valor Total do Orçamento</span>
                        <span className="text-3xl font-bold text-gray-800">{formatCurrency(budget.total_price)}</span>
                    </div>
                )}

                {/* Lista de Itens */}
                <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 font-medium text-gray-700">
                        Lista de Materiais
                    </div>
                    <div className="divide-y divide-gray-100">
                        {budget.items.map((item: any) => (
                            <div key={item.id} className="p-4 flex items-center gap-4">
                                {/* Product Image - Left Side */}
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center">
                                    {item.is_external ? (
                                        item.custom_photo_url ? (
                                            <img
                                                src={item.custom_photo_url.startsWith('http') ? item.custom_photo_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}${item.custom_photo_url}`}
                                                alt={item.custom_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-[10px] text-gray-400">Sem foto</span>
                                        )
                                    ) : (
                                        item.product?.image_url && (
                                            <img
                                                src={
                                                    item.product.image_url.startsWith('http')
                                                        ? item.product.image_url
                                                        : item.product.image_url.startsWith('/products')
                                                            ? item.product.image_url
                                                            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}${item.product.image_url}`
                                                }
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )
                                    )}
                                </div>

                                {/* Product Info - Middle */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-800">
                                        {item.is_external ? item.custom_name : item.product?.name}
                                        {!item.is_external && item.product?.brand && (
                                            <span className="text-gray-500"> - {item.product.brand}</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {budget.show_unit_prices ? (
                                            <>{item.quantity}x {formatCurrency(item.price)}</>
                                        ) : (
                                            <>{item.quantity} {item.product?.unit || 'un'}</>
                                        )}
                                        {item.is_external && item.suggested_source && (
                                            <span className="block italic text-blue-500">Fonte sugerida: {item.suggested_source}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Price - Right Side */}
                                {budget.show_unit_prices && (
                                    <div className="font-bold text-gray-700 flex-shrink-0">{formatCurrency((item.price * item.quantity).toString())}</div>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Only show bottom total block if we are showing breakdown, otherwise redundante with top total? 
                        Actually nice to see total at bottom too.
                    */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-gray-800">Total Geral</span>
                        <span className="text-2xl font-bold text-blue-600">{formatCurrency(budget.total_price)}</span>
                    </div>
                </section>

                {/* Ações */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:static md:bg-transparent md:border-t-0 md:p-0">
                    <div className="max-w-3xl mx-auto flex flex-col gap-3">
                        {isOwner ? (
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2 w-full"> {/* Container for Edit/Share */}
                                    <button
                                        onClick={handleEdit}
                                        className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                                    >
                                        <Edit size={20} />
                                        Editar
                                    </button>
                                    <DownloadBudgetButton budget={budget} />
                                </div>
                                <button
                                    onClick={handleShare}
                                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    <Share2 size={20} />
                                    Enviar para Cliente
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <DownloadBudgetButton budget={budget} />
                                <button
                                    className="w-full bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-200 active:scale-95"
                                    onClick={() => {
                                        const msg = `Olá! Vi o orçamento #${budget.id.slice(0, 5)} no valor de ${formatCurrency(budget.total_price)}. Poderíamos agendar?`;
                                        const phone = electrician?.phone?.replace(/\D/g, '');
                                        if (phone) {
                                            window.open(`https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(msg)}`, '_blank');
                                        } else {
                                            alert('Telefone do eletricista não disponível.');
                                        }
                                    }}
                                >
                                    <MessageCircle size={24} />
                                    Falar com Eletricista (Aprovar)
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
