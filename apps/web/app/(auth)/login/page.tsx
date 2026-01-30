'use client';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Spinner } from '../../components/Spinner';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/auth/login`, {
                username,
                password
            });
            login(data.access_token, data.user);
            router.push('/');
        } catch (error) {
            alert('Falha no login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 data-testid="login-title" className="text-2xl font-bold mb-6 text-center text-gray-800">Login Eletricista</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email ou CPF/CNPJ</label>
                        <input
                            data-testid="email-input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1 placeholder-gray-500"
                            required
                            placeholder="Digite seu email ou CPF"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha</label>
                        <input
                            data-testid="password-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1 placeholder-gray-500"
                            required
                        />
                        <div className="mt-1 text-right">
                            <Link href="/esqueci-senha" className="text-sm text-blue-600 hover:text-blue-700">
                                Esqueci minha senha
                            </Link>
                        </div>
                    </div>
                    <button
                        data-testid="login-button"
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                        {loading && <Spinner />}
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Não tem conta? <Link href="/register" className="text-blue-600 hover:underline">Cadastre-se</Link>
                </div>
                <div className="mt-2 text-center text-sm">
                    <Link href="/" className="text-gray-500 hover:gray-700">Voltar para Home</Link>
                </div>
            </div>
        </div>
    );
}
