'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import api from '@/lib/api';
import { ChevronLeft, Shield, Users, Key, Copy, X, Edit2 } from 'lucide-react';

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
    const [resetToken, setResetToken] = useState<string | null>(null);
    const [resetLink, setResetLink] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [togglingRole, setTogglingRole] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ name: string; email: string; phone?: string }>({ name: '', email: '' });

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

    const handleSaveUser = async (userId: string) => {
        try {
            await api.patch(`/users/${userId}`, editForm);
            setEditingUser(null);
            fetchUsers();
            alert('Usuário atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            alert('Erro ao atualizar usuário.');
        }
    };

    const toggleRole = async (userId: string, currentRole: 'USER' | 'ADMIN') => {
        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        const action = newRole === 'ADMIN' ? 'promover a Administrador' : 'rebaixar a Usuário';

        if (!confirm(`Deseja realmente ${action} este usuário?`)) return;

        setTogglingRole(userId);
        try {
            await api.patch(`/users/${userId}/role`, { role: newRole });
            await fetchUsers(); // Reload list
        } catch (error) {
            console.error('Erro ao alterar papel:', error);
            alert('Erro ao alterar permissões do usuário.');
        } finally {
            setTogglingRole(null);
        }
    };

    const handleResetPassword = async (userId: string) => {
        if (!confirm('Gerar código de redefinição de senha para este usuário?')) return;

        try {
            const { data } = await api.post(`/users/${userId}/reset-token`);
            setResetToken(data.token);
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            setResetLink(`${origin}/redefinir-senha`);
        } catch (error) {
            console.error('Erro ao gerar token:', error);
            alert('Erro ao gerar código de redefinição.');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copiado para a área de transferência!');
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
                                                        src={user.logo_url.startsWith('http') ? user.logo_url : `${process.env.NEXT_PUBLIC_API_URL || ''}${user.logo_url}`}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <Users size={20} className="text-blue-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    {editingUser === user.id ? (
                                                        <input
                                                            type="text"
                                                            value={editForm.name}
                                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                            className="px-2 py-1 text-sm border rounded w-full"
                                                        />
                                                    ) : (
                                                        <p className="font-medium text-gray-900">{user.name}</p>
                                                    )}
                                                    <p className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingUser === user.id ? (
                                                <div className="space-y-1">
                                                    <input
                                                        type="email"
                                                        value={editForm.email}
                                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                        className="px-2 py-1 text-sm border rounded w-full"
                                                        placeholder="Email"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editForm.phone || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                        className="px-2 py-1 text-sm border rounded w-full"
                                                        placeholder="Telefone"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-sm text-gray-900">{user.email}</p>
                                                    {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                                                </>
                                            )}
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
                                            {editingUser === user.id ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleSaveUser(user.id)}
                                                        className="text-green-600 hover:text-green-700 font-bold text-sm"
                                                    >
                                                        Salvar
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingUser(null)}
                                                        className="text-gray-400 hover:text-gray-600 text-sm"
                                                    >
                                                        Sair
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setEditingUser(user.id);
                                                            setEditForm({ name: user.name, email: user.email, phone: user.phone });
                                                        }}
                                                        className="text-gray-400 hover:text-blue-600"
                                                        title="Editar Usuário"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleRole(user.id, user.role);
                                                        }}
                                                        className={`text-sm font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${user.role === 'ADMIN'
                                                            ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                            }`}
                                                        disabled={user.id === currentUser?.id || togglingRole === user.id}
                                                    >
                                                        {togglingRole === user.id ? (
                                                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : null}
                                                        {user.role === 'ADMIN' ? 'Rebaixar' : 'Promover'}
                                                    </button>

                                                    <button
                                                        onClick={() => handleResetPassword(user.id)}
                                                        className="ml-3 text-gray-400 hover:text-blue-600"
                                                        title="Redefinir Senha"
                                                    >
                                                        <Key size={18} />
                                                    </button>
                                                </div>
                                            )}
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

            {/* Reset Token Modal */}
            {
                resetToken && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Código Gerado 🔐</h3>
                                <button onClick={() => setResetToken(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 mb-6">
                                Envie este código e o link para o usuário redefinir a senha:
                            </p>

                            <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                                <p className="text-xs text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Código</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-mono font-bold text-blue-600 tracking-widest">{resetToken}</span>
                                    <button onClick={() => copyToClipboard(resetToken)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                        <Copy size={20} />
                                    </button>
                                </div>
                            </div>

                            {resetLink && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Link de Redefinição</p>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm text-gray-600 truncate">{resetLink}</span>
                                        <button onClick={() => copyToClipboard(resetLink)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setResetToken(null)}
                                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                                >
                                    Concluído
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
