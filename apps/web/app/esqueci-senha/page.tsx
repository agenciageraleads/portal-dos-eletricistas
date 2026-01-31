'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setIsSuccess(true);
            } else {
                setMessage(data.message || 'Erro ao enviar código. Tente novamente.');
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
                    href="/login"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
                >
                    <ArrowLeft size={20} />
                    Voltar para Login
                </Link>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Mail size={32} className="text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Esqueci minha senha</h1>
                        <p className="text-gray-600 text-sm">
                            Digite seu CPF/CNPJ ou email para receber um código de recuperação
                        </p>
                    </div>

                    {!isSuccess ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-2">
                                    CPF/CNPJ ou Email
                                </label>
                                <input
                                    id="identifier"
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="Digite seu CPF, CNPJ ou email"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </div>

                            {message && (
                                <div className={`p-4 rounded-lg text-sm ${message.includes('enviado')
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !identifier}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar Código'
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6 text-center">
                            <div className="bg-green-50 p-4 rounded-xl text-green-700 border border-green-200 text-sm">
                                {message || 'Código enviado com sucesso para seu e-mail cadastrado.'}
                            </div>
                            <p className="text-gray-600 text-sm">
                                Não esqueça de verificar sua caixa de <b>spam</b> ou <b>lixo eletrônico</b>.
                            </p>
                            <Link
                                href="/redefinir-senha"
                                className="block w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center shadow-lg shadow-blue-200 font-bold"
                            >
                                Já tenho o código
                            </Link>

                            <button
                                onClick={() => setIsSuccess(false)}
                                className="text-blue-600 text-sm font-medium hover:underline"
                            >
                                Tentar outro e-mail/CPF
                            </button>
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Lembrou sua senha?{' '}
                        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Fazer login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
