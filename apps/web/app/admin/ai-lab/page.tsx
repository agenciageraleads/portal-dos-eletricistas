'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Brain, ScanText, ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface ParsedItem {
    raw_text: string;
    quantity: number;
    unit: string | null;
    description: string;
    brand: string | null;
    code_ref: string | null;
}

interface MatchResult {
    parsed: ParsedItem;
    match_score: number;
    status: 'MATCHED' | 'SUGGESTED' | 'NOT_FOUND';
    product?: any;
}

export default function AiLabPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
    const [inputText, setInputText] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [results, setResults] = useState<MatchResult[]>([]); // Adjust type as needed
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        setLoading(true);
        setError('');
        setResults([]);
        try {
            let res;
            if (activeTab === 'text') {
                res = await api.post('/admin/ai-lab/analyze-text', { text: inputText });
            } else {
                if (!imageUrl) {
                    setError('Insira uma URL de imagem válida.');
                    setLoading(false);
                    return;
                }
                res = await api.post('/admin/ai-lab/analyze-image', { imageUrl });
            }
            setResults(res.data.results);
        } catch (err) { // eslint-disable-next-line @typescript-eslint/no-explicit-any
            console.error(err);
            setError('Erro ao processar. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    if (user && user.role !== 'ADMIN') {
        router.push('/');
        return null; // Or unauthorized component
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Brain className="text-purple-600" /> AI Budget Lab
                        </h1>
                        <p className="text-sm text-gray-500">Ambiente de Testes e Treinamento da IA</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex bg-gray-100 p-1 rounded-lg mb-6 max-w-sm">
                                <button
                                    onClick={() => setActiveTab('text')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'text' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <ScanText size={18} /> Texto
                                </button>
                                <button
                                    onClick={() => setActiveTab('image')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'image' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <ImageIcon size={18} /> Imagem (URL)
                                </button>
                            </div>

                            {activeTab === 'text' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cole sua lista de materiais</label>
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                                        placeholder={`Exemplo:\n50m Cabo Flexivel 2.5mm\n10 Disjuntor 20A Steck\n20 Tomada 10A Tramontina`}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem</label>
                                    <input
                                        type="text"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                                        placeholder="https://exemplo.com/lista.jpg"
                                    />
                                    {imageUrl && (
                                        <div className="relative h-64 w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-6">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={loading || (activeTab === 'text' && !inputText) || (activeTab === 'image' && !imageUrl)}
                                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Processar com IA'}
                                </button>
                                {error && <p className="mt-2 text-red-500 text-sm text-center">{error}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <CheckCircle className="text-green-500" size={20} /> Resultados da Análise
                            </h2>

                            {results.length === 0 && !loading && (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <Brain size={48} className="mb-4 opacity-20" />
                                    <p>Aguardando processamento...</p>
                                </div>
                            )}

                            {loading && (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="animate-pulse flex gap-4 p-4 border rounded-lg">
                                            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-4">
                                {results.map((item, index) => (
                                    <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-purple-200 transition-colors bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono">
                                                "{item.parsed.raw_text}"
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${item.status === 'MATCHED' ? 'bg-green-100 text-green-700' :
                                                item.status === 'SUGGESTED' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {item.status} ({item.match_score}%)
                                            </span>
                                        </div>

                                        <div className="flex gap-4 mt-3">
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Extraído</p>
                                                <p className="font-medium text-gray-900">{item.parsed.description}</p>
                                                <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                                    <span>Qtd: <b>{item.parsed.quantity}{item.parsed.unit}</b></span>
                                                    {item.parsed.brand && <span>Marca: <b>{item.parsed.brand}</b></span>}
                                                </div>
                                            </div>

                                            <div className="flex-1 border-l pl-4 border-gray-200">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Produto Encontrado</p>
                                                {item.product ? (
                                                    <div>
                                                        <p className="font-medium text-blue-700">{item.product.name}</p>
                                                        <p className="text-xs text-gray-400 mt-1">ID: {item.product.id.substring(0, 8)}...</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                                                        <AlertCircle size={16} /> Produto não encontrado
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
