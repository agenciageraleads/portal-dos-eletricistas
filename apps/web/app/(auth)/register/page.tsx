'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Spinner } from '../../components/Spinner';
import { useToast } from '../../components/Toast';
import { isValidCPF } from '../../../api/src/common/validators/cpf-validator-utils'; // Suposição ou helper local

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [cpfError, setCpfError] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    // Helper simples para validação local de CPF se o import falhar
    const isValidCPFLocal = (cpf: string) => {
        if (typeof cpf !== 'string') return false;
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
        const cpfArr = cpf.split('').map(el => +el);
        const rest = (count: number) => (cpfArr.slice(0, count - 12).reduce((soma, el, index) => soma + el * (count - index), 0) * 10) % 11 % 10;
        return rest(10) === cpfArr[9] && rest(11) === cpfArr[10];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!acceptedTerms) {
            showToast('Você precisa aceitar os Termos de Uso para criar uma conta.', 'warning');
            return;
        }

        // Validar CPF antes de enviar
        const cleanCpf = cpf.replace(/\D/g, '');
        if (cleanCpf.length === 11 && !isValidCPFLocal(cleanCpf)) {
            showToast('CPF inválido. Verifique o número digitado.', 'error');
            return;
        }

        setLoading(true);
        try {
            console.log('[REGISTER] Enviando dados:', { name, email, cpf_cnpj: cleanCpf, phone });

            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/auth/register`, {
                name,
                email,
                cpf_cnpj: cleanCpf,
                phone,
                password,
                termsAccepted: true
            });

            showToast('Cadastro realizado com sucesso! Redirecionando...', 'success');

            // Aguardar 2 segundos para usuário ver mensagem
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error: any) {
            console.error('[REGISTER] Erro:', error);

            // Mensagens de erro mais específicas
            let errorMessage = 'Erro ao cadastrar. Tente novamente.';

            if (error.response?.status === 429) {
                errorMessage = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
            } else if (error.response?.data?.message) {
                errorMessage = Array.isArray(error.response.data.message)
                    ? error.response.data.message[0]
                    : error.response.data.message;
            } else if (error.response?.status === 409) {
                errorMessage = 'CPF/CNPJ ou email já cadastrado. Tente fazer login.';
            } else if (error.response?.status === 400) {
                errorMessage = 'Dados inválidos. Verifique os campos e tente novamente.';
            } else if (!error.response) {
                errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
            }

            showToast(errorMessage, 'error');
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
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1 placeholder-gray-500"
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
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1 placeholder-gray-500"
                            required
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${cpfError ? 'text-red-600' : 'text-gray-700'}`}>CPF ou CNPJ</label>
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

                                // Validação real-time
                                const clean = v.replace(/\D/g, '');
                                if (clean.length === 11) {
                                    setCpfError(isValidCPFLocal(clean) ? '' : 'CPF inválido');
                                } else {
                                    setCpfError('');
                                }
                            }}
                            className={`w-full p-2 border ${cpfError ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg mt-1 placeholder-gray-500 transition-colors`}
                            required
                            placeholder="CPF ou CNPJ"
                            maxLength={18}
                        />
                        {cpfError && <p className="text-red-500 text-xs mt-1">{cpfError}</p>}
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
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1 placeholder-gray-500"
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
