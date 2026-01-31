'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Calendar } from 'lucide-react';
import api from '@/lib/api';

interface FailedSearch {
    id: string;
    query: string;
    createdAt: string;
}

export default function FailedSearchesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [searches, setSearches] = useState<FailedSearch[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Analysis State
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [approving, setApproving] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/');
            return;
        }

        fetchSearches();
    }, [user, router, page]);

    const fetchSearches = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/products/admin/failed-searches?page=${page}`);
            setSearches(data.data);
            setTotalPages(data.pagination.totalPages);
            setTotalItems(data.pagination.total);
        } catch (error) {
            console.error('Error fetching failed searches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async (term: string) => {
        setAnalyzingId(term);
        setAnalysisResult(null);
        try {
            const { data } = await api.get(`/products/admin/search-suggestions?term=${encodeURIComponent(term)}`);
            setAnalysisResult(data);
        } catch (error) {
            alert('Erro ao analisar com IA');
        }
    };

    const handleApproveSynonyms = async (term: string, synonyms: string[]) => {
        if (!confirm(`Adicionar sinônimos para "${term}"?`)) return;
        setApproving(true);
        try {
            await api.post('/products/admin/synonyms', { term: term.toUpperCase(), synonyms });
            alert('Sinônimos adicionados com sucesso!');
            setAnalysisResult(null);
            setAnalyzingId(null);
            // Optionally remove from list or mark as resolved?
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar sinônimos.');
        } finally {
            setApproving(false);
        }
    };

    if (loading && !searches.length) {
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
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Buscas Sem Resultado</h1>
                        <p className="text-sm text-gray-500">Curadoria Assistida por IA</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Termo</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {searches.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 text-lg">"{item.query}"</span>
                                                <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString('pt-BR')}</span>
                                            </div>

                                            {/* Analysis Result Area */}
                                            {analyzingId === item.query && (
                                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                    <h4 className="text-sm font-bold text-blue-800 mb-2">Sugestão da IA:</h4>
                                                    {analysisResult ? (
                                                        <div>
                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                {analysisResult.synonyms?.map((syn: string, i: number) => (
                                                                    <span key={i} className="px-2 py-1 bg-white text-blue-700 text-sm font-medium border border-blue-200 rounded">
                                                                        {syn}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleApproveSynonyms(item.query, analysisResult.synonyms)}
                                                                    disabled={approving}
                                                                    className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50"
                                                                >
                                                                    {approving ? 'Salvando...' : 'Aprovar & Criar Sinônimo'}
                                                                </button>
                                                                <button
                                                                    onClick={() => setAnalyzingId(null)}
                                                                    className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-blue-600 text-sm">
                                                            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                                            Analisando contexto...
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 w-48">
                                            {analyzingId !== item.query && (
                                                <button
                                                    onClick={() => handleAnalyze(item.query)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded hover:bg-blue-100 border border-blue-200"
                                                >
                                                    ✨ Analisar com IA
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {searches.length === 0 && !loading && (
                        <div className="text-center py-12 text-gray-500">Nenhuma busca falha registrada.</div>
                    )}
                </div>
            </main>
        </div>
    );
}
