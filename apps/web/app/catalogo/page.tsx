'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Product } from '../types/product';
import { ProductCard } from '../components/ProductCard';
import { ProductSearch } from '../components/ProductSearch';
import { CartSummary } from '../components/CartSummary';
import { OnboardingModal } from '../components/OnboardingModal';
import { PackageSearch, User, FileText, TriangleAlert, LogOut, ShieldCheck, Calculator, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Suspense } from 'react';

function CatalogContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [orderBy, setOrderBy] = useState('popularity');
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const { user, logout } = useAuth();



    // Super Categories Grouping
    const SUPER_CATEGORIES = [
        { id: 'iluminacao', label: 'Iluminação', icon: '💡', queries: ['Iluminação Comercial', 'Iluminação Decorativa', 'Iluminação'] },
        { id: 'acessorios', label: 'Acessórios', icon: '🔌', queries: ['Acessórios', 'Ferragens', 'Elétrica', 'Equipamentos', 'Geral'] },
        { id: 'ferramentas', label: 'Ferramentas', icon: '🔧', queries: ['Ferramentas'] },
        { id: 'servicos', label: 'Serviços', icon: '🛠️', queries: ['SERVICE'] },
        { id: 'automacao', label: 'Automação', icon: '🤖', queries: ['Automação'] },
        { id: 'interruptores', label: 'Interruptores e Tomadas', icon: '🏠', queries: ['Acabamento'] },
        { id: 'fios', label: 'Fios e Cabos', icon: '⚡', queries: ['Cabos Diversos', 'Cabos Energia', 'Fios e Cabos'] },
        { id: 'infra', label: 'Infra', icon: '🏗️', queries: ['Infraestrutura'] },
    ];

    const fetchProducts = async (pageToFetch: number, query: string = '', category: string | null = null, order: string = 'popularity', reset: boolean = false) => {
        try {
            setLoading(true);
            const params: any = {
                page: pageToFetch,
                limit: 20,
                orderBy: order,
            };

            if (query) params.q = query;

            if (category) {
                if (category === 'SERVICE') {
                    params.type = 'SERVICE';
                } else {
                    params.category = category;
                }
            }

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/products`, { params });
            const newProducts = response.data.data;

            if (reset) {
                setProducts(newProducts);
            } else {
                setProducts(prev => [...prev, ...newProducts]);
            }

            setHasMore(newProducts.length === 20); // If < 20 returned, probably end of list
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const catParam = searchParams.get('cat');
        if (catParam) {
            setSelectedCategory(catParam);
            fetchProducts(1, searchQuery, catParam, 'popularity', true);
        } else if (initialQuery) {
            setSearchQuery(initialQuery);
            fetchProducts(1, initialQuery, null, 'popularity', true);
        } else {
            fetchProducts(1, searchQuery, null, 'popularity', true);
        }
    }, [initialQuery, searchParams]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setPage(1);
        setSelectedCategory(null);
        setOrderBy('popularity'); // Reset sort on new search? Optional, but good default.
        fetchProducts(1, query, null, 'popularity', true);
    };

    const handleCategoryClick = (superCatId: string, queries: string[]) => {
        // If clicking the same category, deselect it? Or just keep it?
        // Let's toggle off if clicked again.
        const isSame = selectedCategory === superCatId;
        const newCategory = isSame ? null : superCatId;

        setSelectedCategory(newCategory);
        setPage(1);
        setSearchQuery(''); // Category clears search query

        // Join queries for backend
        const categoryParam = isSame ? null : queries.join(',');
        fetchProducts(1, '', categoryParam, orderBy, true);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);

        // Reconstruct current category param based on selected ID
        let categoryParam = null;
        if (selectedCategory) {
            const cat = SUPER_CATEGORIES.find(c => c.id === selectedCategory);
            if (cat) categoryParam = cat.queries.join(',');
        }

        fetchProducts(nextPage, searchQuery, categoryParam, orderBy, false);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newOrder = e.target.value;
        setOrderBy(newOrder);
        setPage(1);
        // Reconstruct current category param based on selected ID
        let categoryParam = null;
        if (selectedCategory) {
            const cat = SUPER_CATEGORIES.find(c => c.id === selectedCategory);
            if (cat) categoryParam = cat.queries.join(',');
        }
        fetchProducts(1, searchQuery, categoryParam, newOrder, true);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24"> {/* pb-24 space for floating cart */}
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                            className="text-gray-500 hover:text-gray-700 p-1"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-800">Catálogo PortalElétricos</h1>
                        </div>
                    </div>
                </div>
            </header >

            <main className="max-w-5xl mx-auto px-4 py-6">
                <div className="sticky top-[73px] z-10 bg-gray-50/95 backdrop-blur-sm -mx-4 px-4 py-2 border-b border-gray-200/50 mb-6">
                    <ProductSearch onSearch={handleSearch} value={searchQuery} />
                </div>

                {/* Categories Navigation - Stories Style */}
                {/* Always show unless strictly searching text? User asked: "nao precisa desaparecer, mas nao precisa filtrar com a categoria, ficam somente nas pesquisas saca?"
                    Wait, "os intens nao precisam desaparecer, mas nao precisa filtrar com a categoria" -> I think they mean the excluded categories (SPDA etc) don't need to be in the filter list, but items exist in search.
                    So I should show the filter list even if searching? Or maybe hide it on search like before? 
                    Usually filters hide on text search to reduce clutter. 
                    Let's keep hiding on text search for implementation simplicity unless requested otherwise. 
                */}
                {!searchQuery && (
                    <div className="mb-8">
                        <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 snap-x no-scrollbar">
                            {SUPER_CATEGORIES.map((cat) => {
                                const isSelected = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategoryClick(cat.id, cat.queries)}
                                        className="snap-start shrink-0 flex flex-col items-center gap-2 min-w-[76px] group"
                                    >
                                        <div
                                            className={`
                                                w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-sm
                                                ${isSelected
                                                    ? 'bg-blue-600 text-white shadow-blue-200 shadow-lg border-2 border-blue-600 scale-105'
                                                    : 'bg-white text-gray-700 border border-gray-200 group-hover:border-blue-300'}
                                            `}
                                        >
                                            {cat.icon}
                                        </div>
                                        <span
                                            className={`
                                                text-[11px] font-bold text-center leading-tight max-w-[80px]
                                                ${isSelected ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'}
                                            `}
                                        >
                                            {cat.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <PackageSearch size={20} className="text-blue-600" />
                        {selectedCategory ? selectedCategory : (searchQuery ? `Busca: "${searchQuery}"` : 'Produtos em Destaque')}
                    </h2>
                    <div className="flex items-center gap-2">
                        <select
                            value={orderBy}
                            onChange={handleSortChange}
                            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="popularity">Mais Populares</option>
                            <option value="price_asc">Menor Preço</option>
                            <option value="price_desc">Maior Preço</option>
                            <option value="name_asc">A - Z</option>
                        </select>
                        <span className="text-xs bg-white px-2 py-1 rounded-full border border-gray-200 text-gray-500">
                            {products.length} itens
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {loading && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mt-4 animate-pulse">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-72 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                )}

                {!loading && hasMore && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={loadMore}
                            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-medium hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Carregar mais produtos...
                        </button>
                    </div>
                )}
                {!loading && products.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in fade-in">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center tex-4xl">
                            🤔
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                            {searchQuery ? `Nenhum resultado para "${searchQuery}"` : 'Nenhum serviço encontrado nesta categoria'}
                        </h3>
                        <p className="text-gray-500 max-w-sm">
                            Não encontrou o que precisa? Sugira um novo serviço para adicionarmos ao catálogo.
                        </p>

                        <div className="w-full max-w-xs space-y-3">
                            <button
                                onClick={() => {
                                    const productName = searchQuery || '';
                                    const category = selectedCategory || 'Geral';

                                    // Simple Prompt for MVP (as requested to be quick)
                                    // ideally a Modal, but let's do a quick inline form or just confirm
                                    // User said: "deve aparecer para o usuário acrescentar um serviço"
                                    // Let's make it automatic for now or a simple confirm

                                    if (confirm(`Deseja sugerir a adição de "${productName}"?`)) {
                                        axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/products/suggestions`, {
                                            name: productName,
                                            category: category,
                                            description: 'Sugestão via busca sem resultados',
                                            suggestedBy: user?.id
                                        }).then(() => alert('Obrigado! Sua sugestão foi registrada.')).catch(() => alert('Erro ao registrar sugestão.'));
                                    }
                                }}
                                className="w-full bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                            >
                                Sugerir "{searchQuery || 'Novo Serviço'}"
                            </button>

                            <button
                                onClick={() => handleSearch('')}
                                className="w-full text-blue-600 font-medium hover:underline"
                            >
                                Limpar busca e ver tudo
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <CartSummary />
        </div >
    );
}

export default function CatalogPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
            <CatalogContent />
        </Suspense>
    );
}
