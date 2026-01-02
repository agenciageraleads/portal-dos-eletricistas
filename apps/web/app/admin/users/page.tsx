'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import api from '@/lib/api';
import { ChevronLeft, Shield, Users } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'USER' | 'ADMIN';
    logo_url?: string;
    createdAt: string;
    _count: {
        budgets: number;
    };
}

export default function AdminUsersPage() {
    const { user: currentUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!currentUser || currentUser.role !== 'ADMIN')) {
            router.push('/');
            return;
        }

        if (currentUser?.role === 'ADMIN') {
            fetchUsers();
        }
    }, [currentUser, authLoading, router]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            setLoading(false);
        }
    };

    const toggleRole = async (userId: string, currentRole: 'USER' | 'ADMIN') => {
        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        const action = newRole === 'ADMIN' ? 'promover a Administrador' : 'rebaixar a Usuário';

        if (!confirm(`Deseja realmente ${action} este usuário?`)) return;

        try {
            await api.patch(`/users/${userId}/role`, { role: newRole });
            fetchUsers(); // Reload list
        } catch (error) {
            console.error('Erro ao alterar papel:', error);
            alert('Erro ao alterar permissões do usuário.');
        }
    };

    if (authLoading || loading) {
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
                        <ChevronLeft size={24} />
                    </Link>
                    <Shield size={24} className="text-blue-600" />
                    <h1 className="text-xl font-bold text-gray-800">Gerenciar Usuários</h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Usuário
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Contato
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Orçamentos
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Papel
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.logo_url ? (
                                                    <img
                                                        src={user.logo_url.startsWith('http') ? user.logo_url : `${process.env.NEXT_PUBLIC_API_URL}${user.logo_url}`}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <Users size={20} className="text-blue-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">{user.email}</p>
                                            {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900">{user._count.budgets}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.role === 'ADMIN' ? '👑 Admin' : 'Usuário'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleRole(user.id, user.role)}
                                                className={`text-sm font-medium ${user.role === 'ADMIN'
                                                        ? 'text-orange-600 hover:text-orange-700'
                                                        : 'text-blue-600 hover:text-blue-700'
                                                    }`}
                                                disabled={user.id === currentUser?.id}
                                            >
                                                {user.role === 'ADMIN' ? 'Rebaixar' : 'Promover a Admin'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {users.length === 0 && (
                    <div className="text-center py-12">
                        <Users size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Nenhum usuário encontrado</h3>
                    </div>
                )}
            </main>
        </div>
    );
}
