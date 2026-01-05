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

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/');
            return;
        }

        const fetchSearches = async () => {
            try {
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

        if (user) {
            fetchSearches();
        }
    }, [user, router, page]);

    if (loading || !user || user.role !== 'ADMIN') {
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
                        <p className="text-sm text-gray-500">O que os usuários não encontraram ({totalItems})</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Termo Buscado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Data
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {searches.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                                    <Search size={18} />
                                                </div>
                                                <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                                    "{item.query}"
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(item.createdAt).toLocaleString('pt-BR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {searches.length === 0 && (
                        <div className="text-center py-12">
                            <Search size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Nenhuma busca falha registrada</h3>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-4">
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
            </main>
        </div>
    );
}
