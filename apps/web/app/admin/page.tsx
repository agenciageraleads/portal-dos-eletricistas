'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, FileText, BarChart2, Package, Settings, ChevronRight, MessageSquare, Camera } from 'lucide-react';
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase tracking-[0.2em] font-bold text-[10px] text-gray-400">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent"></div>
                    Painel Administrativo
                </div>
            </div>
        );
    }

    const menuItems = [
        {
            title: 'Usuários',
            description: 'Gerenciar eletricistas, permissões e perfis.',
            icon: <Users size={24} className="text-brand-primary" />,
            href: '/admin/users',
            count: stats.totalUsers
        },
        {
            title: 'Orçamentos',
            description: 'Visualizar todos os orçamentos gerados na plataforma.',
            icon: <FileText size={24} className="text-brand-success" />,
            href: '/admin/budgets',
            count: stats.totalBudgets
        },
        {
            title: 'Produtos',
            description: 'Gerenciar catálogo, preços e especificações.',
            icon: <Package size={24} className="text-amber-500" />,
            href: '/admin/products',
            count: stats.activeProducts,
        },
        {
            title: 'Feedbacks',
            description: 'Visualizar sugestões e reportes de usuários.',
            icon: <MessageSquare size={24} className="text-brand-primary" />,
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
            icon: <BarChart2 size={24} className="text-brand-accent" />,
            href: '/admin/metrics',
            disabled: true,
            badge: 'Em breve'
        },
        {
            title: 'IA Lab',
            description: 'Ambiente de testes e treinamento da IA.',
            icon: <div className="text-xl">🧠</div>,
            href: '/admin/ai-lab',
            badge: 'BETA'
        },
        {
            title: 'Curadoria de Fotos',
            description: 'Aprovar fotos encontradas na web para produtos.',
            icon: <Camera size={24} className="text-brand-primary" />,
            href: '/admin/curadoria-imagens',
            badge: 'Novo'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield size={28} className="text-brand-primary" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Painel Administrativo</h1>
                            <p className="text-xs font-medium text-gray-500">Logado como {user?.name}</p>
                        </div>
                    </div>
                    <Link href="/" className="text-sm font-bold text-gray-400 hover:text-brand-primary transition-colors">
                        Sair do Painel
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-teal-50 rounded-xl">
                            <Users className="text-brand-primary" size={28} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Eletricistas</p>
                            <p className="text-3xl font-bold text-gray-900 tracking-tighter">{stats.totalUsers}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <FileText className="text-brand-success" size={28} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Orçamentos</p>
                            <p className="text-3xl font-bold text-gray-900 tracking-tighter">{stats.totalBudgets}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <Package className="text-amber-500" size={28} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Produtos</p>
                            <p className="text-3xl font-bold text-gray-900 tracking-tighter">{stats.activeProducts}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-teal-50 rounded-xl">
                            <MessageSquare className="text-brand-primary" size={28} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Feedbacks</p>
                            <p className="text-3xl font-bold text-gray-900 tracking-tighter">{stats.totalFeedbacks}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.disabled ? '#' : item.href}
                            className={`group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all ${item.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-gray-200/50 hover:border-brand-primary/20'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-xl transition-all ${item.disabled ? 'bg-gray-50' : 'bg-gray-50 group-hover:bg-brand-primary-light group-hover:scale-110'}`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                                        {item.badge && (
                                            <span className="px-2 py-0.5 bg-brand-primary-light text-brand-primary text-[10px] font-bold rounded uppercase">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                </div>
                            </div>
                            {!item.disabled && (
                                <ChevronRight size={20} className="text-gray-200 group-hover:text-brand-primary transition-colors" />
                            )}
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
