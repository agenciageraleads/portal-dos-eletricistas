'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, FileText, MessageSquare, Package, ArrowLeft } from 'lucide-react';
import axios from 'axios';

interface Stats {
    users: { total: number; recent: number; period: string };
    budgets: { total: number; recent: number; period: string };
    feedbacks: { total: number; recent: number; period: string };
    products: { total: number; active: number };
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('[AdminDashboard] User:', user); // DEBUG

        // Check if user is admin
        if (user && user.role !== 'ADMIN') {
            console.warn('[AdminDashboard] Access denied. Role:', user.role); // DEBUG
            router.push('/');
            return;
        }

        // Fetch stats
        const fetchStats = async () => {
            try {
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/admin/stats`);
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Carregando...</div>
            </div>
        );
    }

    if (user.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-gray-500 hover:text-gray-700">
                                <ArrowLeft size={24} />
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
                        </div>
                        <div className="text-sm text-gray-600">
                            Olá, <span className="font-semibold">{user.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Users Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="text-blue-600" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Usuários</h3>
                        <div className="text-3xl font-bold text-gray-800 mb-2">{stats?.users.total || 0}</div>
                        <div className="text-sm text-green-600">
                            +{stats?.users.recent || 0} últimos {stats?.users.period}
                        </div>
                    </div>

                    {/* Budgets Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FileText className="text-green-600" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Orçamentos</h3>
                        <div className="text-3xl font-bold text-gray-800 mb-2">{stats?.budgets.total || 0}</div>
                        <div className="text-sm text-green-600">
                            +{stats?.budgets.recent || 0} últimos {stats?.budgets.period}
                        </div>
                    </div>

                    {/* Feedbacks Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <MessageSquare className="text-yellow-600" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Feedbacks</h3>
                        <div className="text-3xl font-bold text-gray-800 mb-2">{stats?.feedbacks.total || 0}</div>
                        <div className="text-sm text-green-600">
                            +{stats?.feedbacks.recent || 0} últimos {stats?.feedbacks.period}
                        </div>
                    </div>

                    {/* Products Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Package className="text-purple-600" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Produtos</h3>
                        <div className="text-3xl font-bold text-gray-800 mb-2">{stats?.products.total || 0}</div>
                        <div className="text-sm text-gray-500">
                            Ativos no catálogo
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                        href="/admin/usuarios"
                        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Gerenciar Usuários</h3>
                                <p className="text-sm text-gray-500">Ver todos os eletricistas cadastrados</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/orcamentos"
                        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-green-300 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FileText className="text-green-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Ver Orçamentos</h3>
                                <p className="text-sm text-gray-500">Todos os orçamentos criados</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/feedbacks"
                        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-yellow-300 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <MessageSquare className="text-yellow-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Ver Feedbacks</h3>
                                <p className="text-sm text-gray-500">Sugestões e reportes de problemas</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
