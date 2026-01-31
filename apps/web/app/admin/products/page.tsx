'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Search, Edit2, Check, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface Product {
    id: string;
    sankhya_code: number;
    name: string;
    description: string | null;
    price: string;
    unit: string;
    is_available: boolean;
    image_url?: string;
}

export default function AdminProductsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ name: string; description: string; price: string }>({ name: '', description: '', price: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/');
            return;
        }
        if (user) fetchProducts();
    }, [user, router, page, searchQuery]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/products?page=${page}&q=${searchQuery}&limit=20`);
            setProducts(data.data);
            setTotalPages(data.meta.last_page);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setEditForm({
            name: product.name,
            description: product.description || '',
            price: product.price
        });
    };

    const handleSave = async (id: string) => {
        setSaving(true);
        try {
            await api.patch(`/products/admin/${id}`, {
                name: editForm.name,
                description: editForm.description,
                price: parseFloat(editForm.price)
            });
            setEditingId(null);
            fetchProducts();
            alert('Produto atualizado!');
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar produto');
        } finally {
            setSaving(false);
        }
    };

    const toggleAvailability = async (product: Product) => {
        if (!confirm(`Deseja ${product.is_available ? 'desativar' : 'ativar'} este produto?`)) return;
        try {
            await api.patch(`/products/admin/${product.id}`, {
                is_available: !product.is_available
            });
            fetchProducts();
        } catch (error) {
            console.error(error);
            alert('Erro ao alterar disponibilidade');
        }
    };

    if (!user || user.role !== 'ADMIN') return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Gerenciar Produtos</h1>
                            <p className="text-sm text-gray-500">Edite nomes, descrições e preços</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou código..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Produto</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Código</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Preço (R$)</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={20} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="max-w-xs overflow-hidden">
                                                    {editingId === product.id ? (
                                                        <div className="space-y-1">
                                                            <input
                                                                type="text"
                                                                value={editForm.name}
                                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                                className="w-full px-2 py-1 text-sm border rounded"
                                                                placeholder="Nome"
                                                            />
                                                            <textarea
                                                                value={editForm.description}
                                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                                className="w-full px-2 py-1 text-xs border rounded"
                                                                placeholder="Descrição..."
                                                            />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                                            <p className="text-xs text-gray-500">{product.unit}</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {product.sankhya_code}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === product.id ? (
                                                <input
                                                    type="number"
                                                    value={editForm.price}
                                                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                                    className="w-24 px-2 py-1 text-sm border rounded"
                                                    step="0.01"
                                                />
                                            ) : (
                                                <span className="font-medium text-gray-900">
                                                    {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleAvailability(product)}
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                {product.is_available ? 'Ativo' : 'Inativo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === product.id ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleSave(product.id)}
                                                        disabled={saving}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                    >
                                                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Editar Produto"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
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
