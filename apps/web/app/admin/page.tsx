'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, FileText, BarChart2, Package, Settings, ChevronRight, MessageSquare } from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBudgets: 0,
        activeProducts: 0,
        totalFeedbacks: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'ADMIN')) {
            router.push('/');
            return;
        }

        if (user?.role === 'ADMIN') {
            fetchStats();
        }
    }, [user, authLoading, router]);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/stats');

            setStats({
                totalUsers: data.users.total,
                totalBudgets: data.budgets.total,
                activeProducts: data.products.active,
                totalFeedbacks: data.feedbacks.total
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            // Fallback to individual fetches if admin/stats fails (backward compatibility)
            try {
                const usersRes = await api.get('/users');
                const budgetsRes = await api.get('/budgets/admin/all');
                const productsRes = await api.get('/products');

                setStats({
                    totalUsers: usersRes.data.length,
                    totalBudgets: budgetsRes.data.length,
                    activeProducts: productsRes.data.length,
                    totalFeedbacks: 0
                });
            } catch (innerError) {
                console.error('Fallback fetch failed:', innerError);
            }
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const menuItems = [
        {
            title: 'Usuários',
            description: 'Gerenciar eletricistas, permissões e perfis.',
            icon: <Users size={24} className="text-blue-600" />,
            href: '/admin/users',
            count: stats.totalUsers
        },
        {
            title: 'Orçamentos',
            description: 'Visualizar todos os orçamentos gerados na plataforma.',
            icon: <FileText size={24} className="text-green-600" />,
            href: '/admin/budgets',
            count: stats.totalBudgets
        },
        {
            title: 'Produtos',
            description: 'Gerenciar catálogo, preços e especificações.',
            icon: <Package size={24} className="text-orange-600" />,
            href: '/admin/products',
            count: stats.activeProducts,
        },
        {
            title: 'Feedbacks',
            description: 'Visualizar sugestões e reportes de usuários.',
            icon: <MessageSquare size={24} className="text-pink-600" />,
            href: '/admin/feedbacks',
            count: stats.totalFeedbacks,
            badge: stats.totalFeedbacks > 0 ? 'Novo' : undefined
        },
        {
            title: 'Buscas Falhas',
            description: 'Termos que os usuários buscaram e não encontraram.',
            icon: <div className="text-xl">🔍</div>,
            href: '/admin/failed-searches',
        },
        {
            title: 'Métricas',
            description: 'Análise de conversão e uso da plataforma.',
            icon: <BarChart2 size={24} className="text-purple-600" />,
            href: '/admin/metrics',
            disabled: true,
            badge: 'Em breve'
        },
        {
            title: 'AI Lab',
            description: 'Ambiente de testes e treinamento da IA.',
            icon: <div className="text-xl">🧠</div>,
            href: '/admin/ai-lab',
            badge: 'BETA'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield size={28} className="text-blue-600" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Painel Administrativo</h1>
                            <p className="text-sm text-gray-500">Bem-vindo, {user?.name}</p>
                        </div>
                    </div>
                    <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                        Voltar ao Portal
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Users className="text-blue-600" size={28} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total de Eletricistas</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <FileText className="text-green-600" size={28} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total de Orçamentos</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalBudgets}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <Package className="text-orange-600" size={28} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Produtos no Catálogo</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.activeProducts}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-pink-50 rounded-xl">
                            <MessageSquare className="text-pink-600" size={28} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Feedbacks</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalFeedbacks}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.disabled ? '#' : item.href}
                            className={`group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all ${item.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md hover:border-blue-200'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl transition-colors ${item.disabled ? 'bg-gray-50' : 'bg-gray-50 group-hover:bg-blue-50'}`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                                        {item.badge && (
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                </div>
                            </div>
                            {!item.disabled && (
                                <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                            )}
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
