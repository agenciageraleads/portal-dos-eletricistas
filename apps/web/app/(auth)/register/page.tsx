'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Spinner } from '../../components/Spinner';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!acceptedTerms) {
            alert('Você precisa aceitar os Termos de Uso para criar uma conta.');
            return;
        }

        setLoading(true);
        try {
            // Remove formatação do CPF/CNPJ antes de enviar
            const cleanCpf = cpf.replace(/\D/g, '');

            console.log('[REGISTER] Enviando dados:', { name, email, cpf_cnpj: cleanCpf, phone });

            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/auth/register`, {
                name,
                email,
                cpf_cnpj: cleanCpf,
                phone,
                password,
                termsAccepted: true
            });
            alert('Cadastro realizado com sucesso! Faça login.');
            router.push('/login');
        } catch (error: any) {
            console.error('[REGISTER] Erro:', error);

            // Mensagens de erro mais específicas
            let errorMessage = 'Erro ao cadastrar. Tente novamente.';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 409) {
                errorMessage = 'CPF/CNPJ ou email já cadastrado. Tente fazer login.';
            } else if (error.response?.status === 400) {
                errorMessage = 'Dados inválidos. Verifique os campos e tente novamente.';
            } else if (!error.response) {
                errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
            }

            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Cadastro Eletricista</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                            required
                            placeholder="Ex: João da Silva"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                            required
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CPF ou CNPJ</label>
                        <input
                            type="text"
                            value={cpf}
                            onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '');
                                if (v.length <= 11) {
                                    v = v.replace(/(\d{3})(\d)/, '$1.$2');
                                    v = v.replace(/(\d{3})(\d)/, '$1.$2');
                                    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                                } else {
                                    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
                                    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                                    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
                                    v = v.replace(/(\d{4})(\d)/, '$1-$2');
                                }
                                setCpf(v);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                            required
                            placeholder="CPF ou CNPJ"
                            maxLength={18}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '');
                                v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
                                v = v.replace(/(\d)(\d{4})$/, '$1-$2');
                                setPhone(v);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                            required
                            placeholder="(11) 99999-9999"
                            maxLength={15}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                            required
                        />
                    </div>

                    <div className="flex items-start space-x-2 pt-2">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                            Li e concordo com os <Link href="/termos/page" target="_blank" className="text-blue-600 hover:underline">Termos de Uso</Link> e Política de Privacidade.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 mt-4"
                    >
                        {loading && <Spinner />}
                        {loading ? 'Criando conta...' : 'Criar Conta'}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Já tem conta? <Link href="/login" className="text-blue-600 hover:underline">Faça Login</Link>
                </div>
            </div>
        </div>
    );
}
