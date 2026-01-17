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
import Link from 'next/link';

export default function CatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [orderBy, setOrderBy] = useState('popularity');
    const { user, logout } = useAuth();


    const CATEGORIES = [
        { id: 'Acabamento', label: 'Acabamento', icon: '🏠' },
        { id: 'Acessórios', label: 'Acessórios', icon: '📎' },
        { id: 'Automação', label: 'Automação', icon: '🤖' },
        { id: 'Cabos Diversos', label: 'Cabos Diversos', icon: '🔗' },
        { id: 'Cabos Energia', label: 'Fios e Cabos', icon: '⚡' },
        { id: 'Combate a Incêndio', label: 'Incêndio', icon: '🔥' },
        { id: 'Equipamentos', label: 'Equipamentos', icon: '⚙️' },
        { id: 'Ferragens', label: 'Ferragens', icon: '🔩' },
        { id: 'Ferramentas', label: 'Ferramentas', icon: '🔧' },
        { id: 'Iluminação Comercial', label: 'Ilum. Comercial', icon: '🏢' },
        { id: 'Iluminação Decorativa', label: 'Ilum. Decorativa', icon: '💡' },
        { id: 'Infraestrutura', label: 'Infraestrutura', icon: '🏗️' },
        { id: 'Média Tensão', label: 'Média Tensão', icon: '🔋' },
        { id: 'SPDA', label: 'SPDA', icon: '⛈️' },
        { id: 'Elétrica', label: 'Elétrica Geral', icon: '🔌' },
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
            if (category) params.category = category;

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
        fetchProducts(1, '', null, 'popularity', true);
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setPage(1);
        setSelectedCategory(null);
        setOrderBy('popularity'); // Reset sort on new search? Optional, but good default.
        fetchProducts(1, query, null, 'popularity', true);
    };

    const handleCategoryClick = (category: string) => {
        const newCategory = selectedCategory === category ? null : category;
        setSelectedCategory(newCategory);
        setPage(1);
        setSearchQuery(''); // Category clears search query
        fetchProducts(1, '', newCategory, orderBy, true);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, searchQuery, selectedCategory, orderBy, false);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newOrder = e.target.value;
        setOrderBy(newOrder);
        setPage(1);
        fetchProducts(1, searchQuery, selectedCategory, newOrder, true);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24"> {/* pb-24 space for floating cart */}
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={24} />
                        </Link>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-800">Catálogo de Produtos</h1>
                        </div>
                    </div>
                </div>
            </header >

            <main className="max-w-5xl mx-auto px-4 py-6">
                <ProductSearch onSearch={handleSearch} />

                {/* Categories Navigation - Hidden on Search */}
                {!searchQuery && (
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-3 justify-center">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className={`
                                        flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-colors border shadow-sm
                                        ${selectedCategory === cat.id
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200'
                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}
                                    `}
                                >
                                    <span className="text-xl">{cat.icon}</span>
                                    <span className="font-bold text-base">{cat.label}</span>
                                </button>
                            ))}
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
                            {searchQuery ? `Nenhum resultado para "${searchQuery}"` : 'Nenhum produto encontrado nesta categoria'}
                        </h3>
                        <p className="text-gray-500 max-w-sm">
                            Tente buscar com outras palavras ou verifique a ortografia.
                        </p>

                        {searchQuery && (
                            <button
                                onClick={async (e) => {
                                    const btn = e.currentTarget;
                                    btn.disabled = true;
                                    const originalText = btn.innerHTML;
                                    btn.innerHTML = 'Enviando...';
                                    try {
                                        await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/products/failed-search`, {
                                            params: { q: searchQuery }
                                        });
                                        btn.innerHTML = 'Obrigado! Vamos corrigir isso.';
                                        btn.classList.remove('bg-blue-600', 'text-white', 'hover:bg-blue-700');
                                        btn.classList.add('bg-green-100', 'text-green-700', 'border', 'border-green-200');
                                    } catch (err) {
                                        console.error(err);
                                        btn.innerHTML = 'Erro ao enviar. Tente novamente.';
                                        btn.disabled = false;
                                    }
                                }}
                                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                            >
                                Não achei o que procurava
                            </button>
                        )}

                        <button
                            onClick={() => handleSearch('')}
                            className="text-blue-600 font-medium hover:underline mt-2"
                        >
                            Limpar busca e ver tudo
                        </button>
                    </div>
                )}
            </main>

            <CartSummary />
        </div >
    );
}
