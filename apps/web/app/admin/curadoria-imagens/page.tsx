'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Camera, ChevronLeft, RefreshCw, LayoutGrid, List, Search } from 'lucide-react';
import api from '@/lib/api';
import ImageGallery from './components/ImageGallery';

export default function CuradoriaImagensPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>({ total: 0 });
    const [refreshing, setRefreshing] = useState(false);

    const fetchQueue = useCallback(async (pageNum: number = 1) => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/image-curator/queue', {
                params: { page: pageNum, limit: 10 }
            });
            setQueue(data.data);
            setMeta(data.meta);
        } catch (error) {
            console.error('Erro ao buscar fila de curadoria:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'ADMIN')) {
            router.push('/');
            return;
        }

        if (user?.role === 'ADMIN') {
            fetchQueue(page);
        }
    }, [user, authLoading, router, page, fetchQueue]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            // Poderíamos chamar um endpoint para "trigger" do cron se quiséssemos
            await fetchQueue(1);
            setPage(1);
        } finally {
            setRefreshing(false);
        }
    };

    const handleItemProcessed = () => {
        // Recarregar a fila se necessário ou apenas remover localmente
        fetchQueue(page);
    };

    if (authLoading || (loading && queue.length === 0)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase tracking-[0.2em] font-bold text-[10px] text-gray-400">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent"></div>
                    Carregando fila de curadoria...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-800">
                            <ChevronLeft size={24} />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                                <Camera size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800 tracking-tight">Curadoria de Imagens</h1>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {meta.total} produtos aguardando revisão
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleRefresh}
                        className={`p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-500 hover:text-brand-primary transition-all active:scale-95 ${refreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Header Actions & Filters (TBD) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar por marca ou nome..." 
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium text-sm"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <button className="p-2 bg-gray-50 text-brand-primary rounded-lg shadow-inner"><LayoutGrid size={18} /></button>
                        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-all"><List size={18} /></button>
                    </div>
                </div>

                {queue.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        {queue.map((product) => (
                            <ImageGallery 
                                key={product.id} 
                                product={product} 
                                onProcessed={handleItemProcessed} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                            <Camera size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">Tudo Limpo!</h2>
                        <p className="text-gray-500 max-w-sm mb-8">Não há produtos pendentes de curadoria no momento. A IA buscará novos candidatos em breve.</p>
                        <button 
                            onClick={handleRefresh}
                            className="px-8 py-3 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-teal-100 hover:bg-teal-600 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <RefreshCw size={18} />
                            Verificar Novamente
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {meta.last_page > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-4">
                        <button 
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-6 py-2 bg-white border border-gray-100 rounded-xl font-bold text-xs text-gray-500 hover:text-brand-primary disabled:opacity-30 transition-all"
                        >
                            Anterior
                        </button>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Página {page} de {meta.last_page}
                        </span>
                        <button 
                            disabled={page >= meta.last_page}
                            onClick={() => setPage(p => p + 1)}
                            className="px-6 py-2 bg-white border border-gray-100 rounded-xl font-bold text-xs text-gray-500 hover:text-brand-primary disabled:opacity-30 transition-all"
                        >
                            Próxima
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
