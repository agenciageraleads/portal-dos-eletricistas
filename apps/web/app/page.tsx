'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Product } from './types/product';
import { ProductCard } from './components/ProductCard';
import { ProductSearch } from './components/ProductSearch';
import { CartSummary } from './components/CartSummary';
import { PackageSearch, User, FileText, TriangleAlert, LogOut } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

    const fetchProducts = async (pageToFetch: number, query: string = '', category: string | null = null, reset: boolean = false) => {
        try {
            setLoading(true);
            const params: any = {
                page: pageToFetch,
                limit: 20,
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
        fetchProducts(1, '', null, true);
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setPage(1);
        setSelectedCategory(null);
        fetchProducts(1, query, null, true); // Search clears category
    };

    const handleCategoryClick = (category: string) => {
        const newCategory = selectedCategory === category ? null : category;
        setSelectedCategory(newCategory);
        setPage(1);
        setSearchQuery(''); // Category clears search query
        fetchProducts(1, '', newCategory, true);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, searchQuery, selectedCategory, false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24"> {/* pb-24 space for floating cart */}
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            P
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Portal do Eletricista</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-yellow-200"
                            onClick={async () => {
                                const msg = prompt('Encontrou algum erro ou tem uma sugestão? Conte para nós:');
                                if (msg) {
                                    try {
                                        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/feedback`, {
                                            type: 'GENERAL',
                                            message: msg,
                                        });
                                        alert('Obrigado! Seu feedback é muito importante.');
                                    } catch (error) {
                                        console.error(error);
                                        alert('Erro ao enviar feedback.');
                                    }
                                }
                            }}
                            title="Reportar problema ou sugerir melhoria"
                        >
                            <TriangleAlert size={18} />
                            <span className="hidden sm:inline">Reportar</span>
                        </button>
                        {user ? (
                            <>
                                <Link href="/orcamentos" className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Meus Orçamentos">
                                    <FileText size={22} className="text-gray-600" />
                                </Link>
                                <Link href="/perfil" className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors">
                                    {user.logo_url ? (
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                                            <img
                                                src={user.logo_url.startsWith('http') ? user.logo_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}${user.logo_url}`}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <User size={22} className="text-gray-600" />
                                    )}
                                    <span className="hidden sm:inline text-gray-900 font-medium">{user.name}</span>
                                </Link>
                                <button
                                    onClick={() => logout()}
                                    className="flex items-center gap-2 hover:bg-red-50 px-3 py-2 rounded-full transition-colors text-red-600"
                                    title="Sair"
                                >
                                    <LogOut size={20} />
                                    <span className="hidden sm:inline font-medium">Sair</span>
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="text-blue-600 font-medium hover:underline">
                                Entrar
                            </Link>
                        )}
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
                    <span className="text-xs bg-white px-2 py-1 rounded-full border border-gray-200 text-gray-500">
                        Mostrando {products.length} itens
                    </span>
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
            </main>

            <CartSummary />
        </div >
    );
}
