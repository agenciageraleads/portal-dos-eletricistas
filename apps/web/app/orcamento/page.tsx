'use client';

import { useState, useEffect, Suspense } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Trash2, Share2, Loader2, LogIn, Save, Plus, PackagePlus, X } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import SmartBudgetImport from '../components/SmartBudgetImport';

const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

const QuantityInput = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
    const [localValue, setLocalValue] = useState(value.toString());

    useEffect(() => {
        // Sync local state if external value changes (e.g. via +/- buttons)
        // But only if it's different to avoid cursor jumping if we were typing?
        // actually if we type "10", blur -> onChange(10) -> value becomes 10 -> useEffect(10). Matches.
        // If we click +, onChange(11) -> value becomes 11 -> useEffect(11). Matches.
        setLocalValue(value.toString());
    }, [value]);

    const handleBlur = () => {
        let val = parseInt(localValue);
        if (isNaN(val) || val < 1) val = 1;
        onChange(val);
        setLocalValue(val.toString());
    };

    return (
        <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden h-9">
            <button
                type="button"
                onClick={() => onChange(Math.max(1, value - 1))}
                className="w-8 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold active:bg-gray-200 transition-colors border-r border-gray-200"
            >
                -
            </button>
            <input
                type="number"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                className="w-12 h-full text-center text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset z-10"
            />
            <button
                type="button"
                onClick={() => onChange(value + 1)}
                className="w-8 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold active:bg-gray-200 transition-colors border-l border-gray-200"
            >
                +
            </button>
        </div>
    );
};

function OrcamentoContent() {
    const { items, total, removeFromCart, updateQuantity, clearCart, addManualItem, addToCart } = useCart();

    // State
    const [laborValue, setLaborValue] = useState('');
    const [laborDescription, setLaborDescription] = useState('');

    const [executionTime, setExecutionTime] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('');
    const [validity, setValidity] = useState('');
    const [warranty, setWarranty] = useState('');
    const [notes, setNotes] = useState('');

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    // Privacy
    const [showUnitPrices, setShowUnitPrices] = useState(true);
    const [showLaborTotal, setShowLaborTotal] = useState(true);

    // UI
    const [loading, setLoading] = useState(false);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [shareData, setShareData] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState('');

    // Manual Item Form
    const [manualName, setManualName] = useState('');
    const [manualPrice, setManualPrice] = useState('');
    const [manualQty, setManualQty] = useState('1');
    const [manualSource, setManualSource] = useState('');

    // Upload state
    const [manualImage, setManualImage] = useState('');
    const [uploading, setUploading] = useState(false);

    // Derived
    const labor = parseFloat(laborValue.replace(',', '.')) || 0;
    const grandTotal = total + labor;

    const router = useRouter();
    const searchParams = useSearchParams();

    // Load existing budget if ID present
    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setIsEditMode(true);
            setEditId(id);
            // Load logic would go here, but omitted for now to save space/complexity
        }
    }, [searchParams]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setManualImage(data.url);
        } catch (error) {
            console.error('Erro no upload', error);
            alert('Erro ao enviar imagem.');
        } finally {
            setUploading(false);
        }
    };

    const handleAddManualItem = () => {
        if (!manualName || !manualPrice) return;
        addManualItem({
            name: manualName,
            price: parseFloat(manualPrice.replace(',', '.')),
            image_url: manualImage,
            source: manualSource,
            quantity: parseInt(manualQty) || 1
        });
        setIsManualModalOpen(false);
        setManualName('');
        setManualPrice('');
        setManualQty('1');
        setManualSource('');
        setManualImage('');
    };

    const handleFinish = async (type: 'DRAFT' | 'SHARED') => {
        setLoading(true);
        try {
            const payload = {
                items: items.map(i => ({ product_id: i.id, quantity: i.quantity, price: parseFloat(i.price) })),
                labor_value: labor,
                labor_description: laborDescription,
                customer_name: customerName,
                customer_phone: customerPhone,
                execution_time: executionTime,
                payment_terms: paymentTerms,
                validity: validity,
                warranty: warranty,
                notes: notes,
                show_unit_prices: showUnitPrices,
                show_labor_total: showLaborTotal,
                status: 'DRAFT'
            };

            const { data } = await api.post('/budgets', payload);
            if (type === 'SHARED') {
                const link = `${window.location.origin}/o/${data.id}`;
                setShareData({
                    shareLink: link,
                    whatsappUrl: `https://wa.me/?text=${encodeURIComponent('Orçamento: ' + link)}`
                });
                setShowSuccessModal(true);
                setEditId(data.id);
                setIsEditMode(true);
            } else {
                alert('Rascunho salvo!');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <main className="min-h-screen bg-gray-50 pb-32">
                {/* Header Mobile */}
                <header className="bg-white p-4 border-b border-gray-200 sticky top-0 z-20 flex items-center justify-between shadow-sm">
                    <Link href="/" className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="font-bold text-gray-800 text-lg">Novo Orçamento</h1>
                    <div className="w-10"></div>
                </header>

                <div className="max-w-3xl mx-auto p-4 space-y-6 mt-4">

                    <section className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-gray-800">1. Itens e Materiais</h2>
                            <button onClick={clearCart} className="text-red-500 text-xs hover:underline">
                                Limpar
                            </button>
                        </div>

                        {items.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <p>Nenhum item adicionado ainda.</p>
                                <Link href="/" className="text-blue-600 font-bold hover:underline mt-2 inline-block">
                                    Ir para o Catálogo
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs text-gray-400 font-bold">FOTO</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-800 text-sm line-clamp-2">{item.name}</h3>
                                            <div className="mt-1">
                                                <QuantityInput
                                                    value={item.quantity}
                                                    onChange={(val) => updateQuantity(item.id, val)}
                                                />
                                            </div>
                                            <p className="text-xs text-center text-gray-400 mt-1">{formatPrice(parseFloat(item.price))} un</p>
                                        </div>
                                        <div className="text-right flex flex-col justify-between h-16 py-1">
                                            <p className="font-bold text-gray-900 text-sm">{formatPrice(parseFloat(item.price) * item.quantity)}</p>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-500 p-1 hover:bg-red-50 rounded-full self-end"
                                                title="Remover item"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="p-4 bg-gray-50 flex flex-col gap-4 border-t border-gray-100">
                            <SmartBudgetImport
                                onImportItems={(importedItems) => {
                                    importedItems.forEach(item => {
                                        addToCart({
                                            ...item,
                                            price: String(item.price) // Ensure price is string
                                        }, item.quantity);
                                    });
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setIsManualModalOpen(true)}
                                className="flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all font-medium"
                            >
                                <PackagePlus size={20} />
                                Adicionar Item que não está no catálogo
                            </button>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-gray-600 font-medium">Subtotal Materiais</span>
                                <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
                            </div>
                        </div>
                    </section >

                    {/* 2. Mão de Obra */}
                    < section className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500" >
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
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço (Opcional)</label>
                            <textarea
                                value={laborDescription}
                                onChange={(e) => setLaborDescription(e.target.value)}
                                placeholder="Descreva o que será feito (ex: Troca de fiação, instalação de 5 pontos...)"
                                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                            />
                        </div>

                        {/* Privacy Toggles v1.2.0 */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-bold text-gray-700 mb-3">⚙️ Configurações de Privacidade</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showUnitPrices}
                                        onChange={(e) => setShowUnitPrices(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-gray-900">Mostrar preços unitários</span>
                                        <p className="text-xs text-gray-500">Se desativado, o cliente verá apenas o total</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showLaborTotal}
                                        onChange={(e) => setShowLaborTotal(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-gray-900">Mostrar valor de mão de obra separado</span>
                                        <p className="text-xs text-gray-500">Se desativado, mão de obra será incluída no total geral</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </section >

                    {/* 3. Observações e Condições */}
                    < section className="bg-white rounded-xl shadow-sm p-6" >
                        <h2 className="font-bold text-gray-800 mb-4">3. Observações e Condições Comerciais</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de Execução</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 5 dias úteis"
                                    value={executionTime}
                                    onChange={(e) => setExecutionTime(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 50% entrada + 50% final"
                                    value={paymentTerms}
                                    onChange={(e) => setPaymentTerms(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Validade do Orçamento</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 7 dias"
                                    value={validity}
                                    onChange={(e) => setValidity(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Garantia (Mão de Obra)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 90 dias"
                                    value={warranty}
                                    onChange={(e) => setWarranty(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">Observações Gerais</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Outros detalhes..."
                            className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                        />
                        <p className="text-xs text-gray-500 mt-2">Todas as informações acima aparecerão no PDF e na visão do cliente.</p>
                    </section >

                    {/* 4. Dados do Cliente */}
                    < section className="bg-white rounded-xl shadow-sm p-6" >
                        <h2 className="font-bold text-gray-800 mb-4">4. Dados do Cliente (Para quem é?)</h2>
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
                </div>
            </main>

            <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom z-30 shadow-lg">
                <div className="max-w-5xl mx-auto flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <span className="text-sm text-gray-500">Total do Orçamento</span>
                        <span className="text-3xl font-bold text-blue-600">{formatPrice(grandTotal)}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => handleFinish('DRAFT')}
                            disabled={loading || (items.length === 0 && labor === 0)}
                            className="w-full sm:flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                            {loading ? '...' : 'Salvar Rascunho'}
                        </button>

                        <button
                            onClick={() => handleFinish('SHARED')}
                            disabled={loading || (items.length === 0 && labor === 0)}
                            className="w-full sm:flex-[2] bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (isEditMode ? <Save size={24} /> : <Share2 size={24} />)}
                            {loading ? 'Salvando...' : (isEditMode ? 'Salvar e Gerar Link' : 'Gerar Link do Orçamento')}
                        </button>
                    </div>
                </div>
            </div>


            {/* Success Modal */}
            {
                showSuccessModal && shareData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
                            <div className="bg-green-100 p-6 flex flex-col items-center justify-center text-center gap-2">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-2 shadow-lg shadow-green-200">
                                    <Share2 size={32} />
                                </div>
                                <h2 className="text-xl font-bold text-green-900">Orçamento Pronto!</h2>
                                <p className="text-green-800 text-sm">Seu orçamento foi salvo com sucesso.</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <a
                                    href={shareData.whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-green-200"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.231-.298.347-.497.116-.198.058-.371-.029-.544-.087-.174-.775-1.867-1.066-2.559-.282-.67-.568-.58-.783-.591-.202-.011-.433-.013-.665-.013-.232 0-.608.087-.926.432-.318.346-1.214 1.187-1.214 2.895 0 1.708 1.243 3.359 1.417 3.593.174.235 2.45 3.737 5.935 5.241.83.358 1.476.571 1.983.732 1.05.334 2.007.288 2.771.174.847-.126 1.758-.718 2.005-1.411.248-.694.248-1.289.174-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Enviar no WhatsApp
                                </a>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(shareData.shareLink)
                                            .then(() => alert('Link copiado!'))
                                            .catch(() => prompt('Copie o link:', shareData.shareLink));
                                    }}
                                    className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Share2 size={20} />
                                    Copiar Link
                                </button>

                                <button
                                    onClick={() => router.push(`/o/${editId}`)}
                                    className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-2"
                                >
                                    Fechar e ver Orçamento
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal de Item Manual */}
            {
                isManualModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Plus className="text-blue-600" />
                                    Item fora do catálogo
                                </h3>
                                <button onClick={() => setIsManualModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Item/Serviço *</label>
                                    <input
                                        type="text"
                                        value={manualName}
                                        onChange={(e) => setManualName(e.target.value)}
                                        placeholder="Ex: Fita Isolante 3M Alta Fusão"
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Preço Unitário *</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                                            <input
                                                type="number"
                                                value={manualPrice}
                                                onChange={(e) => setManualPrice(e.target.value)}
                                                placeholder="0,00"
                                                className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Quantidade</label>
                                        <input
                                            type="number"
                                            value={manualQty}
                                            onChange={(e) => setManualQty(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sugestão de onde comprar (Opcional)</label>
                                    <input
                                        type="text"
                                        value={manualSource}
                                        onChange={(e) => setManualSource(e.target.value)}
                                        placeholder="Ex: Leroy Merlin, Loja da Esquina..."
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Foto do Produto (Opcional)</label>
                                    <div className="flex items-center gap-4">
                                        {manualImage ? (
                                            <div className="relative w-20 h-20 border border-gray-200 rounded-lg overflow-hidden group">
                                                <img src={manualImage} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setManualImage('')}
                                                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                {uploading ? <Loader2 className="animate-spin text-gray-400" /> : <PackagePlus className="text-gray-400" />}
                                                <span className="text-[10px] text-gray-500 mt-1">{uploading ? '...' : 'Foto'}</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                            </label>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Adicione uma foto para enriquecer o orçamento.</p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 italic">
                                    * Este item não será faturado pelo Portal Distribuidora e deve ser providenciado pelo eletricista.
                                </p>
                            </div>

                            <div className="p-6 bg-gray-50 flex gap-3">
                                <button
                                    onClick={() => setIsManualModalOpen(false)}
                                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddManualItem}
                                    className="flex-2 py-3 px-6 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    Adicionar ao Orçamento
                                </button>
                            </div>
                        </div>
                    </div >
                )
            }
        </>
    );
}

export default function OrcamentoPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
            <OrcamentoContent />
        </Suspense>
    );
}
