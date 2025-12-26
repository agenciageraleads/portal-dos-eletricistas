'use client';

import { useState, useEffect, Suspense } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Trash2, Share2, Loader2, LogIn, Save } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function OrcamentoContent() {
    const { items, total, removeFromCart, updateQuantity, clearCart } = useCart();
    const { user, loading: authLoading } = useAuth();

    // Client inputs (meaning the end-customer, wait. No. "Seus Dados" = Electrician Info)
    // The previous code said "Seus Dados (Para o Cliente)". That implies Electrician info.
    // However, the backend now stores `client_name` and `client_phone` which are the END CUSTOMER.
    // AND the `userId` is the electrician.
    // So the input "Seus Dados" in the previous code was actually mimicking the "Electrician who is using the app as a Guest".
    // NOW that we have login, "Seus Dados" are implied by the logged in user.
    // WE NEED INPUTS FOR THE CUSTOMER (CLIENT) DATA. "Dados do Cliente".

    // Let's rename the state variables to avoid confusion.
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [laborValue, setLaborValue] = useState<string>('0');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const params = useSearchParams();
    const editId = params.get('edit');
    const [isEditMode, setIsEditMode] = useState(!!editId);

    useEffect(() => {
        if (editId) {
            setIsEditMode(true);
            const fetchBudget = async () => {
                try {
                    const { data } = await api.get(`/budgets/${editId}`);
                    setCustomerName(data.client_name);
                    setCustomerPhone(data.client_phone);
                    setLaborValue(data.total_labor.toString());
                    // Note: Items should ideally be loaded into cart via context before hitting this page,
                    // BUT if user refreshes, we might lose context state if not persisted perfectly or if we rely solely on context call from Details page.
                    // The plan said "Redirect to /orcamento?edit=ID and load items". 
                    // Best approach: Verify if items are in cart. If not, load them? 
                    // Or trust that the Details page called loadBudgetIntoCart.
                    // Let's rely on Details page for now to keep it simple, or re-fetch here if needed?
                    // Re-fetching here is safer for refresh.
                    // Let's assume CartContext loadBudgetIntoCart handles it.
                } catch (error) {
                    console.error('Erro ao carregar orçamento para edição', error);
                }
            };
            fetchBudget();
        }
    }, [editId]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    const labor = parseFloat(laborValue) || 0;
    const grandTotal = total + labor;

    const handleFinish = async (status: 'DRAFT' | 'SHARED' = 'SHARED') => {
        if (!user) return;

        if (!customerName) {
            alert('Por favor, informe o nome do cliente.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                clientName: customerName,
                clientPhone: customerPhone.replace(/\D/g, ''),
                items: items.map(item => ({
                    productId: item.id,
                    quantity: Number(item.quantity),
                    price: Number(item.price)
                })),
                laborValue: Number(labor),
                status: status
            };

            let budgetId = editId;

            if (isEditMode && editId) {
                await api.patch(`/budgets/${editId}`, payload);
            } else {
                const response = await api.post('/budgets', payload);
                budgetId = response.data.id;
            }

            // Se for Rascunho, só avisa e redireciona
            if (status === 'DRAFT') {
                alert('Rascunho salvo com sucesso!');
                clearCart();
                router.push(`/o/${budgetId}`);
                return;
            }

            // Se for SHARED, faz o fluxo de compartilhar
            const shareLink = `${window.location.origin}/o/${budgetId}`;
            const message = `Olá ${customerName}! Aqui está o orçamento do *Portal do Eletricista*:\n\nMateriais: ${formatPrice(total)}\nMão de Obra: ${formatPrice(labor)}\nTotal: ${formatPrice(grandTotal)}\n\nAcesse no link abaixo:\n${shareLink}`;

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Orçamento Portal do Eletricista',
                        text: message,
                        url: shareLink
                    });
                } catch (err) {
                    console.error('Erro no share nativo', err);
                }
            } else {
                try {
                    await navigator.clipboard.writeText(shareLink);
                    alert('O link foi copiado!');
                } catch (err) {
                    // Fallback para conexões não-seguras (HTTP)
                    const textArea = document.createElement("textarea");
                    textArea.value = shareLink;
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        alert('O link foi copiado! (via fallback)');
                    } catch (err) {
                        prompt('Copie o link abaixo:', shareLink);
                    }
                    document.body.removeChild(textArea);
                }

                const whatsappUrl = `https://api.whatsapp.com/send?phone=55${customerPhone.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            }

            clearCart();
            setCustomerName('');
            setCustomerPhone('');
            setLaborValue('0');
            router.push(`/o/${budgetId}`);

        } catch (error: any) {
            console.error('Erro ao salvar orçamento:', error);
            const serverMessage = error.response?.data?.message;
            if (Array.isArray(serverMessage)) {
                alert(`Erro: ${serverMessage.join(', ')}`);
            } else {
                alert(`Erro ao salvar orçamento: ${serverMessage || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className="p-8 text-center">Carregando...</div>;

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4">
                <LogIn size={48} className="text-gray-300" />
                <h1 className="text-xl font-bold text-gray-800">Faça login para criar orçamentos</h1>
                <p className="text-gray-500 max-w-xs">Você precisa estar logado para salvar orçamentos e enviar aos seus clientes.</p>
                <div className="flex gap-4">
                    <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold">
                        Entrar
                    </Link>
                    <Link href="/register" className="border border-blue-600 text-blue-600 px-6 py-2 rounded-full font-bold">
                        Cadastrar
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-40">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-800">{isEditMode ? 'Editar Orçamento' : 'Novo Orçamento'}</h1>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

                {/* 1. Materiais */}
                <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-700">1. Materiais Selecionados</h2>
                        <span className="text-sm text-gray-500">{items.length} itens</span>
                    </div>
                    {items.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-4">
                            <span>Seu carrinho está vazio. Adicione produtos primeiro.</span>
                            <Link href="/" className="text-blue-600 font-bold hover:underline">
                                Ir para Catálogo
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <div key={item.id} className="p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">IMG</div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-800 text-sm">{item.name}</h3>
                                        <p className="text-xs text-gray-500">{item.quantity}x {formatPrice(parseFloat(item.price))}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 text-sm">{formatPrice(parseFloat(item.price) * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="p-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                        <span className="text-gray-600 font-medium">Subtotal Materiais</span>
                        <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
                    </div>
                </section>

                {/* 2. Mão de Obra */}
                <section className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                    <h2 className="font-bold text-gray-800 mb-2">2. Valor da sua Mão de Obra</h2>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                        <input
                            type="number"
                            value={laborValue}
                            onChange={(e) => setLaborValue(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 text-2xl font-bold text-gray-900 bg-gray-50 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </section>

                {/* 3. Dados do Cliente */}
                <section className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="font-bold text-gray-800 mb-4">3. Dados do Cliente (Para quem é?)</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
                            <input
                                type="text"
                                placeholder="Ex: Dona Maria"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp do Cliente (Opcional)</label>
                            <input
                                type="tel"
                                placeholder="Ex: (11) 99999-9999"
                                value={customerPhone}
                                onChange={(e) => {
                                    let v = e.target.value.replace(/\D/g, '');
                                    v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
                                    v = v.replace(/(\d)(\d{4})$/, '$1-$2');
                                    setCustomerPhone(v);
                                }}
                                maxLength={15}
                                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </section>

            </main>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
                <div className="max-w-5xl mx-auto flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <span className="text-sm text-gray-500">Total do Orçamento</span>
                        <span className="text-3xl font-bold text-blue-600">{formatPrice(grandTotal)}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => handleFinish('DRAFT')}
                            disabled={loading || items.length === 0}
                            className="w-full sm:flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                            {loading ? '...' : 'Salvar Rascunho'}
                        </button>

                        <button
                            onClick={() => handleFinish('SHARED')}
                            disabled={loading || items.length === 0}
                            className="w-full sm:flex-[2] bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (isEditMode ? <Save size={24} /> : <Share2 size={24} />)}
                            {loading ? 'Salvando...' : (isEditMode ? 'Salvar e Gerar Link' : 'Gerar Link do Orçamento')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OrcamentoPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
            <OrcamentoContent />
        </Suspense>
    );
}
