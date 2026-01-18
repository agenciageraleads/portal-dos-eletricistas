
import { useState } from 'react';
import { FileText, Upload, Sparkles, Check, X, AlertTriangle, Loader2, Search } from 'lucide-react';
import api from '@/lib/api';

interface SmartBudgetImportProps {
    onImportItems: (items: any[]) => void;
}

interface MatchResult {
    parsed: {
        raw_text: string;
        quantity: number;
        unit: string | null;
        description: string;
        brand: string | null;
        code_ref: string | null;
    };
    match_score: number;
    status: 'MATCHED' | 'SUGGESTED' | 'NOT_FOUND';
    product?: any;
}

export default function SmartBudgetImport({ onImportItems }: SmartBudgetImportProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'TEXT' | 'FILE'>('TEXT');
    const [textInput, setTextInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<MatchResult[] | null>(null);

    const handleAnalyze = async () => {
        if (mode === 'TEXT' && !textInput.trim()) return;
        setIsLoading(true);
        setResults(null);
        try {
            let payload: any = {};

            if (mode === 'TEXT') {
                payload.text = textInput;
            } else {
                // File mode
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                if (!fileInput || !fileInput.files || !fileInput.files[0]) {
                    alert('Selecione um arquivo.');
                    setIsLoading(false);
                    return;
                }
                const file = fileInput.files[0];
                const base64 = await toBase64(file);
                payload.imageUrl = base64;
            }

            const { data } = await api.post('/budgets/smart-import', payload);
            setResults(data);
        } catch (error) {
            console.error('Erro na análise:', error);
            const msg = (error as any).response?.data?.message || (error as any).message || 'Erro ao analisar.';
            alert(`Erro: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    };

    // State for swapping product
    const [swapItemIndex, setSwapItemIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleOpenSwap = (index: number) => {
        setSwapItemIndex(index);
        setSearchTerm(results![index].parsed.description); // Pre-fill with description
        handleSearchProduct(results![index].parsed.description);
    };

    const handleSearchProduct = async (query: string) => {
        setSearchTerm(query);
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            const { data } = await api.get('/products', { params: { search: query } });
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectReplacement = async (product: any) => {
        if (swapItemIndex === null || !results) return;

        const originalResult = results[swapItemIndex];
        const newResults = [...results];

        // Update local state
        newResults[swapItemIndex] = {
            ...originalResult,
            status: 'MATCHED', // Now it's matched/corrected
            product: product
        };
        setResults(newResults);
        setSwapItemIndex(null);

        // Send Feedback to Backend
        try {
            await api.post('/budgets/feedback', {
                original_text: originalResult.parsed.raw_text,
                suggested_pid: originalResult.product?.id,
                correct_pid: product.id,
                correction_type: 'FIXED'
            });
            console.log('Feedback sent successfully');
        } catch (error) {
            console.error('Error sending feedback:', error);
        }
    };

    // ... (rest of toBase64)

    const handleConfirmImport = () => {
        if (!results) return;

        const itemsToImport = results
            .filter(item => item.product)
            .map(item => ({
                product_id: item.product.id,
                quantity: item.parsed.quantity,
                unit_price: item.product.price,
                // Add other necessary fields compatible with the cart/budget
            }));

        if (itemsToImport.length === 0) {
            alert('Nenhum produto identificado com correspondência para importar.');
            return;
        }

        onImportItems(itemsToImport);
        setIsOpen(false);
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            {/* Main Modal */}
            <div className={`bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${swapItemIndex !== null ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* ... Existing Modal Content ... */}
                {/* Update the Item Render to include Swap Button */}
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Sparkles className="text-blue-600" />
                            Orçamento com IA
                        </h3>
                        <p className="text-sm text-gray-500">Cole sua lista e deixe que a gente encontre os produtos.</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 text-black">
                    {!results ? (
                        /* Input Mode (Text/File) - Unchanged */
                        <>
                            <div className="flex gap-4 mb-4">
                                <button
                                    onClick={() => setMode('TEXT')}
                                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${mode === 'TEXT'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    <FileText size={18} />
                                    Colar Lista
                                </button>
                                <button
                                    onClick={() => setMode('FILE')}
                                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${mode === 'FILE'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    <Upload size={18} />
                                    Upload Arquivo
                                </button>
                            </div>

                            {mode === 'TEXT' ? (
                                <textarea
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Cole aqui sua lista de materiais..."
                                    className="w-full h-64 p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm shadow-inner"
                                />
                            ) : (
                                <div className="h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const label = document.getElementById('file-label');
                                                if (label) label.innerText = file.name;
                                            }
                                        }}
                                    />
                                    <Upload size={48} className="text-gray-400 mb-4" />
                                    <p className="text-gray-600 font-medium">Clique ou arraste sua imagem aqui</p>
                                    <p id="file-label" className="text-sm text-blue-600 mt-2 font-bold"></p>
                                    <p className="text-xs text-gray-400 mt-2">Suporta: JPG, PNG (Max 5MB)</p>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Results Mode - Modified with Swap Button */
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-700 text-lg">Resultado da Análise</h4>
                            <div className="space-y-3">
                                {results.map((item, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border flex items-center gap-4 ${item.status === 'MATCHED' ? 'border-green-200 bg-green-50' :
                                        item.status === 'SUGGESTED' ? 'border-yellow-200 bg-yellow-50' :
                                            'border-red-200 bg-red-50'
                                        }`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.status === 'MATCHED' ? 'bg-green-100 text-green-600' :
                                            item.status === 'SUGGESTED' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-red-100 text-red-500'
                                            }`}>
                                            {item.status === 'MATCHED' ? <Check size={20} /> :
                                                item.status === 'SUGGESTED' ? <Search size={20} /> :
                                                    <AlertTriangle size={20} />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-500 mb-1">
                                                "{item.parsed.raw_text}"
                                            </p>
                                            {item.product ? (
                                                <div className="font-bold text-gray-800 flex flex-col">
                                                    <span>{item.product.name}</span>
                                                    <span className="text-xs font-normal text-gray-500">
                                                        Cód: {item.product.sankhya_code} | Preço: R$ {item.product.price}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="font-bold text-red-600 text-sm">Produto não encontrado</span>
                                            )}
                                        </div>

                                        <div className="text-right flex flex-col items-end gap-2">
                                            <span className="block font-bold text-gray-900 text-lg">
                                                {item.parsed.quantity} {item.parsed.unit || 'un'}
                                            </span>
                                            <button
                                                onClick={() => handleOpenSwap(idx)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-bold underline"
                                            >
                                                Trocar Produto
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    {!results ? (
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading || (mode === 'TEXT' && !textInput.trim())}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                            {isLoading ? 'Analisando...' : 'Identificar Produtos'}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setResults(null)}
                                className="px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleConfirmImport}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-200"
                            >
                                <Check size={20} />
                                Importar Itens Encontrados
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Swap Product Modal Overlay */}
            {swapItemIndex !== null && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col h-[600px] border border-gray-200">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Trocar Produto</h3>
                            <button onClick={() => setSwapItemIndex(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    autoFocus
                                    value={searchTerm}
                                    onChange={(e) => handleSearchProduct(e.target.value)}
                                    placeholder="Buscar produto..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {isSearching ? (
                                <div className="flex justify-center p-8 text-gray-400"><Loader2 className="animate-spin" /></div>
                            ) : searchResults.length === 0 ? (
                                <p className="text-center text-gray-500 mt-8">Nenhum produto encontrado.</p>
                            ) : (
                                searchResults.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => handleSelectReplacement(p)}
                                        className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-200 cursor-pointer flex justify-between items-center group"
                                    >
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm group-hover:text-blue-700">{p.name}</p>
                                            <p className="text-xs text-gray-500">Cód: {p.sankhya_code}</p>
                                        </div>
                                        <span className="font-bold text-gray-900 text-sm">R$ {p.price}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

