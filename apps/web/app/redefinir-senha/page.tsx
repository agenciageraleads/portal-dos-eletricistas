'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setMessage('As senhas não coincidem');
            setLoading(false);
            return;
        }

        // Validate minimum length
        if (newPassword.length < 6) {
            setMessage('A senha deve ter no mínimo 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Senha alterada com sucesso! Redirecionando...');
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setMessage(data.message || 'Erro ao redefinir senha. Verifique o código.');
            }
        } catch (error) {
            setMessage('Erro ao conectar com o servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back Button */}
                <Link
                    href="/esqueci-senha"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
                >
                    <ArrowLeft size={20} />
                    Voltar
                </Link>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Lock size={32} className="text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Redefinir senha</h1>
                        <p className="text-gray-600 text-sm">
                            Digite o código de 6 dígitos que você recebeu e sua nova senha
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="token" className="block text-sm font-semibold text-gray-700 mb-2">
                                Código de Verificação
                            </label>
                            <input
                                id="token"
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-center text-2xl font-mono tracking-widest"
                            />
                            <p className="text-xs text-gray-500 mt-1 text-center">Digite o código de 6 dígitos</p>
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                Nova Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirmar Nova Senha
                            </label>
                            <input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Digite a senha novamente"
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {message && (
                            <div className={`p-4 rounded-lg text-sm ${message.includes('sucesso')
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !token || !newPassword || !confirmPassword}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Redefinindo...
                                </>
                            ) : (
                                'Redefinir Senha'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Não recebeu o código?{' '}
                        <Link href="/esqueci-senha" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Reenviar
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
