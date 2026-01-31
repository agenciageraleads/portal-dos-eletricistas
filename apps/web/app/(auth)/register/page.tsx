'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Spinner } from '../../components/Spinner';
import { useToast } from '../../components/Toast';
import { isValidCPF } from '../../../api/src/common/validators/cpf-validator-utils'; // Suposição ou helper local
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
    const [step, setStep] = useState(1); // 1: CPF Check, 2: Full Info
    const [isPreRegistered, setIsPreRegistered] = useState(false);
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
        const rest = (count: number) => (cpfArr.slice(0, count - 12).map((_, i) => cpfArr[i]).reduce((soma, el, index) => soma + el * (count - index), 0) * 10) % 11 % 10;
        return rest(10) === cpfArr[9] && rest(11) === cpfArr[10];
    };

    const handleCheckCpf = async () => {
        const cleanCpf = cpf.replace(/\D/g, '');
        if (!isValidCPFLocal(cleanCpf)) {
            showToast('CPF inválido.', 'error');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/auth/check-registration/${cleanCpf}`);

            if (data.exists) {
                if (data.cadastro_finalizado) {
                    showToast('Este CPF já possui cadastro completo. Faça login.', 'info');
                    router.push('/login');
                    return;
                }

                if (data.pre_cadastrado) {
                    setIsPreRegistered(true);
                    setName(data.user.name || '');
                    setEmail(data.user.email || '');
                    setPhone(data.user.phone || '');
                    showToast('Encontramos seu pré-cadastro! 😊 Finalize as informações abaixo.', 'success');
                }
            }

            setStep(2);
        } catch (error) {
            console.error('Erro ao checar CPF:', error);
            setStep(2); // Continua mesmo se der erro na checagem
        } finally {
            setLoading(false);
        }
    };

    const { login } = useAuth(); // Hook de autenticação

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

            // 1. Registrar o usuário
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/auth/register`, {
                name,
                email,
                cpf_cnpj: cleanCpf,
                phone,
                password,
                termsAccepted: true
            });

            showToast('Cadastro realizado! Entrando...', 'success');

            // 2. Realizar Login Automático
            try {
                const { data: loginData } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/auth/login`, {
                    username: email, // O backend aceita email ou CPF no campo username
                    password
                });

                if (loginData.access_token && loginData.user) {
                    login(loginData.access_token, loginData.user);
                    router.push('/'); // Redirecionar para a Home logado
                } else {
                    // Fallback visual caso o login falhe (raro)
                    router.push('/login');
                }
            } catch (loginError) {
                console.error('[AUTO-LOGIN] Erro ao fazer login automático:', loginError);
                // Se falhar o auto-login, manda para login normal
                router.push('/login');
            }

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
                <h1 data-testid="register-title" className="text-2xl font-bold mb-2 text-center text-gray-800">Cadastro Eletricista</h1>
                <p data-testid="register-subtitle" className="text-gray-500 text-center text-sm mb-6">
                    {step === 1 ? 'Informe seu CPF para começar' : 'Complete seus dados de acesso'}
                </p>

                {step === 1 ? (
                    <div className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium ${cpfError ? 'text-red-600' : 'text-gray-700'}`}>CPF ou CNPJ</label>
                            <input
                                data-testid="cpf-input"
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
                                    const clean = v.replace(/\D/g, '');
                                    if (clean.length === 11) {
                                        setCpfError(isValidCPFLocal(clean) ? '' : 'CPF inválido');
                                    } else {
                                        setCpfError('');
                                    }
                                }}
                                className={`w-full p-3 border ${cpfError ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-xl mt-1 placeholder-gray-500 transition-colors`}
                                required
                                placeholder="000.000.000-00"
                                maxLength={18}
                            />
                            {cpfError && <p className="text-red-500 text-xs mt-1">{cpfError}</p>}
                        </div>
                        <button
                            data-testid="continue-button"
                            onClick={handleCheckCpf}
                            disabled={loading || !cpf || !!cpfError}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2"
                        >
                            {loading && <Spinner />}
                            Continuar
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isPreRegistered && (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                                <p className="text-blue-700 text-xs font-bold leading-tight">
                                    Encontramos seu cadastro 🙂 <br />
                                    <span className="font-normal">Falta só finalizar para liberar tudo.</span>
                                </p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input
                                data-testid="name-input"
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
                                data-testid="email-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                                required
                                placeholder="seu@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                            <input
                                data-testid="phone-input"
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
                            <label className="block text-sm font-medium text-gray-700">Escolha uma Senha</label>
                            <input
                                data-testid="password-input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="flex items-start gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setAcceptedTerms(!acceptedTerms)}
                                className={`
                                    w-5 h-5 mt-0.5 rounded border transition-all flex items-center justify-center shrink-0
                                    ${acceptedTerms ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300'}
                                `}
                            >
                                {acceptedTerms && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                            <label className="text-sm text-gray-600 leading-tight">
                                Li e concordo com os <Link href="/termos" target="_blank" className="text-blue-600 hover:underline font-medium">Termos de Uso</Link> e Política de Privacidade.
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                data-testid="back-button"
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-bold hover:bg-gray-200 transition"
                            >
                                Voltar
                            </button>
                            <button
                                data-testid="submit-button"
                                type="submit"
                                disabled={loading}
                                className="flex-[2] bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
                            >
                                {loading && <Spinner />}
                                {isPreRegistered ? 'Ativar Cadastro' : 'Finalizar Cadastro'}
                            </button>
                        </div>
                    </form>
                )}
                <div className="mt-4 text-center text-sm">
                    Já tem conta? <Link href="/login" className="text-blue-600 hover:underline">Faça Login</Link>
                </div>
            </div>
        </div>
    );
}
