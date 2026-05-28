'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import { Zap, Sparkles, CheckCircle, Loader2, User, Phone, Mail, Lock, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { Spinner } from '../../../components/Spinner';

interface EventQuestion {
    id: string;
    label: string;
    type: 'select' | 'text';
    options?: string[];
}

interface EventData {
    id: string;
    title: string;
    description: string | null;
    questions: EventQuestion[];
}

export default function EventCheckinPage() {
    const params = useParams();
    const router = useRouter();
    const { user, login } = useAuth();

    // Estados do Evento
    const [event, setEvent] = useState<EventData | null>(null);
    const [loadingEvent, setLoadingEvent] = useState(true);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    // Estado do Fluxo: 'CHECKIN' (se logado) ou 'REGISTER_STEP1' (CPF) ou 'REGISTER_STEP2' (Form)
    const [flowState, setFlowState] = useState<'CHECKIN' | 'REGISTER_STEP1' | 'REGISTER_STEP2'>('CHECKIN');

    // Estados do Formulário de Registro
    const [cpf, setCpf] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('GO'); // Default para o estado do evento
    const [password, setPassword] = useState('');
    const [submittingUser, setSubmittingUser] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Estado de Sucesso final
    const [successCheckin, setSuccessCheckin] = useState(false);
    const [countdown, setCountdown] = useState(4);

    // Carrega dados do evento
    useEffect(() => {
        if (params.id) {
            fetchEvent();
        }
    }, [params.id]);

    // Redirecionamento dinâmico baseado no status de login
    useEffect(() => {
        if (!loadingEvent && event) {
            if (!user) {
                setFlowState('REGISTER_STEP1');
            } else {
                setFlowState('CHECKIN');
            }
        }
    }, [user, loadingEvent, event]);

    const fetchEvent = async () => {
        setLoadingEvent(true);
        try {
            const { data } = await api.get(`/events/${params.id}`);
            setEvent(data);
        } catch (err) {
            console.error('Erro ao buscar evento:', err);
            // Cria um evento mockup local básico caso a API demore
            setEvent({
                id: 'sabado-eletricistas-2026',
                title: 'Grande Encontro dos Eletricistas',
                description: 'Lançamento oficial da comunidade e portfólio no Portal.',
                questions: [
                    {
                        id: 'especialidade',
                        label: 'Qual sua principal área de atuação?',
                        type: 'select',
                        options: ['Residencial', 'Comercial', 'Industrial', 'Predial/Condomínios', 'Subestações'],
                    }
                ]
            });
        } finally {
            setLoadingEvent(false);
        }
    };

    // Validação local simplificada
    const isValidCPFLocal = (doc: string) => {
        const clean = doc.replace(/\D/g, '');
        if (clean.length !== 11) return false;
        if (!!clean.match(/(\d)\1{10}/)) return false;
        const cpfArr = clean.split('').map(el => +el);
        const rest = (count: number) => (cpfArr.slice(0, count - 12).map((_, i) => cpfArr[i]).reduce((soma, el, index) => soma + el * (count - index), 0) * 10) % 11 % 10;
        return rest(10) === cpfArr[9] && rest(11) === cpfArr[10];
    };

    // Passo 1: Checar CPF
    const handleCheckCpf = async () => {
        setFormError(null);
        const cleanCpf = cpf.replace(/\D/g, '');
        if (!isValidCPFLocal(cleanCpf)) {
            setFormError('Por favor, informe um CPF válido.');
            return;
        }

        setSubmittingUser(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
            const { data } = await axios.get(`${baseUrl}/auth/check-registration/${cleanCpf}`);

            if (data.exists) {
                if (data.cadastro_finalizado) {
                    setFormError('CPF já cadastrado. Por favor, faça login para continuar.');
                    // Redireciona opcionalmente para login ou pede senha
                    setTimeout(() => router.push('/login'), 2500);
                    return;
                }
                if (data.pre_cadastrado) {
                    setName(data.user?.name || '');
                    setEmail(data.user?.email || '');
                    setPhone(data.user?.phone || '');
                }
            }
            setFlowState('REGISTER_STEP2');
        } catch (err) {
            console.error('Erro ao verificar CPF:', err);
            setFlowState('REGISTER_STEP2');
        } finally {
            setSubmittingUser(false);
        }
    };

    // Passo 2: Registro Simplificado e Auto-Login
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!name.trim() || !email.trim() || !phone.trim() || !city.trim() || !password.trim()) {
            setFormError('Todos os campos são obrigatórios.');
            return;
        }

        setSubmittingUser(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
            const cleanCpf = cpf.replace(/\D/g, '');

            // 1. Registra o Eletricista
            await axios.post(`${baseUrl}/auth/register`, {
                name: name.trim(),
                email: email.trim(),
                cpf_cnpj: cleanCpf,
                phone: phone.replace(/\D/g, ''),
                city: city.trim(),
                state,
                password,
                termsAccepted: true
            });

            // 2. Auto-Login
            const { data: loginData } = await axios.post(`${baseUrl}/auth/login`, {
                username: email.trim(),
                password
            });

            if (loginData.access_token && loginData.user) {
                login(loginData.access_token, loginData.user);
                // O useEffect do useAuth vai atualizar a sessão e colocar flowState em 'CHECKIN'
                setFlowState('CHECKIN');
            } else {
                router.push('/login');
            }
        } catch (err: any) {
            console.error('Erro ao registrar:', err);
            setFormError(err.response?.data?.message || 'Erro ao realizar cadastro. Tente outro e-mail.');
        } finally {
            setSubmittingUser(false);
        }
    };

    // Passo 3: Enviar Questionário e Check-in Presença
    const handleCheckinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!event) return;

        // Validação rápida se todas as perguntas do select foram respondidas
        for (const q of event.questions) {
            if (!answers[q.id]) {
                alert(`Por favor, responda à pergunta: "${q.label}"`);
                return;
            }
        }

        setSubmittingUser(true);
        try {
            await api.post(`/events/${event.id}/checkin`, { answers });
            
            // Sucesso! Ativa animação
            setSuccessCheckin(true);
            
            // Atualiza dados locais do usuário para refletir "Cadastro Finalizado" e "Disponível"
            await refreshUser();

            // Contador de redirecionamento
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        router.push('/');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err: any) {
            console.error('Erro no check-in:', err);
            alert(err.response?.data?.message || 'Erro ao confirmar presença. Tente novamente.');
        } finally {
            setSubmittingUser(false);
        }
    };

    if (loadingEvent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950 uppercase tracking-[0.2em] font-bold text-[10px] text-gray-400">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    Carregando Evento
                </div>
            </div>
        );
    }

    // TELA DE SUCESSO (Visual Festivo com Confetes Pure CSS)
    if (successCheckin) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                {/* Efeito de Confetes Nativos em CSS Keyframes */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce top-10 left-[20%] opacity-80" style={{ animationDelay: '0.1s', animationDuration: '2s' }}></div>
                    <div className="absolute w-3 h-3 bg-teal-400 rotate-45 top-32 left-[75%] opacity-70 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}></div>
                    <div className="absolute w-2 h-4 bg-rose-500 -rotate-12 top-16 left-[50%] opacity-90 animate-bounce" style={{ animationDelay: '0.9s', animationDuration: '2.8s' }}></div>
                    <div className="absolute w-3 h-1.5 bg-blue-400 top-44 left-[10%] opacity-85 animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2.5s' }}></div>
                    <div className="absolute w-2 h-2 bg-emerald-400 rounded-full top-80 left-[85%] opacity-90 animate-bounce" style={{ animationDelay: '0.7s', animationDuration: '3.1s' }}></div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full relative z-10 animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-24 h-24 bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-teal-500/20 animate-pulse">
                        <CheckCircle size={56} className="fill-teal-950" />
                    </div>

                    <span className="bg-teal-500/10 text-teal-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-teal-500/20">Presença Confirmada!</span>
                    <h2 className="text-2xl font-black text-white mt-4 tracking-tight">Seja Bem-vindo!</h2>
                    
                    <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                        Seu check-in foi registrado, sua conta está ativada e você já está **Online** nas buscas da comunidade!
                    </p>

                    <div className="mt-8 p-4 bg-slate-950 rounded-2xl border border-slate-850">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Redirecionando para o Portal</p>
                        <p className="text-3xl font-black text-amber-400 mt-1">{countdown}s</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-12">
            
            {/* Header decorativo do evento */}
            <div className="bg-gradient-to-b from-teal-900/40 to-transparent py-10 px-6 text-center border-b border-slate-900">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20 font-black animate-bounce">
                    <Zap size={24} fill="currentColor" />
                </div>
                <h1 className="text-xl font-black tracking-tight">{event?.title || 'Grande Encontro dos Eletricistas'}</h1>
                <p className="text-[11px] text-teal-400 font-bold uppercase tracking-widest mt-1">Portal do Eletricista • Check-in Presencial</p>
            </div>

            <div className="flex-1 flex items-start justify-center px-4 -mt-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full">
                    
                    {formError && (
                        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-200 text-xs font-bold mb-5">
                            ⚠️ {formError}
                        </div>
                    )}

                    {/* ================= PASSO 1: CHECAR CPF ================= */}
                    {flowState === 'REGISTER_STEP1' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-base font-extrabold text-white leading-tight">Olá, seja bem-vindo!</h3>
                                <p className="text-xs text-slate-400 mt-1 leading-normal">
                                    Para confirmar sua presença, informe seu CPF para verificarmos se já é cadastrado.
                                </p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Seu CPF</label>
                                <input
                                    type="text"
                                    value={cpf}
                                    onChange={(e) => {
                                        let v = e.target.value.replace(/\D/g, '');
                                        v = v.replace(/(\d{3})(\d)/, '$1.$2');
                                        v = v.replace(/(\d{3})(\d)/, '$1.$2');
                                        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                                        setCpf(v);
                                    }}
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                    className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-amber-500 text-sm transition-all placeholder-slate-700"
                                    disabled={submittingUser}
                                />
                            </div>

                            <button
                                onClick={handleCheckCpf}
                                disabled={submittingUser || cpf.replace(/\D/g, '').length !== 11}
                                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/5 flex items-center justify-center gap-1.5 active:scale-95 text-xs"
                            >
                                {submittingUser ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar Documento'}
                            </button>
                        </div>
                    )}

                    {/* ================= PASSO 2: CADASTRO RÁPIDO ================= */}
                    {flowState === 'REGISTER_STEP2' && (
                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div>
                                <h3 className="text-base font-extrabold text-white leading-tight">Crie sua Conta Grátis</h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    É rapidinho! Você terá acesso instantâneo ao nosso feed, mural de vagas e ferramentas.
                                </p>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Nome Completo</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                        <input
                                            type="text"
                                            placeholder="Seu nome completo"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full py-3 pl-9 pr-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500"
                                            required
                                            disabled={submittingUser}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">E-mail</label>
                                    <div className="relative">
                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                        <input
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full py-3 pl-9 pr-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500"
                                            required
                                            disabled={submittingUser}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">WhatsApp</label>
                                        <div className="relative">
                                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                            <input
                                                type="tel"
                                                placeholder="(00) 90000-0000"
                                                value={phone}
                                                onChange={(e) => {
                                                    let v = e.target.value.replace(/\D/g, '');
                                                    v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
                                                    v = v.replace(/(\d)(\d{4})$/, '$1-$2');
                                                    setPhone(v);
                                                }}
                                                className="w-full py-3 pl-9 pr-2 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500"
                                                required
                                                disabled={submittingUser}
                                                maxLength={15}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Cidade</label>
                                        <div className="relative">
                                            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                            <input
                                                type="text"
                                                placeholder="Sua cidade"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="w-full py-3 pl-9 pr-2 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500"
                                                required
                                                disabled={submittingUser}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Crie uma Senha</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                        <input
                                            type="password"
                                            placeholder="Mínimo 6 caracteres"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full py-3 pl-9 pr-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500"
                                            required
                                            minLength={6}
                                            disabled={submittingUser}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setFlowState('REGISTER_STEP1')}
                                    className="flex-1 py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 font-bold rounded-xl transition-all"
                                    disabled={submittingUser}
                                >
                                    Voltar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1 active:scale-95"
                                    disabled={submittingUser}
                                >
                                    {submittingUser ? <Loader2 size={16} className="animate-spin" /> : 'Criar e Entrar'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ================= PASSO 3: CHECK-IN & PESQUISA ================= */}
                    {flowState === 'CHECKIN' && event && (
                        <form onSubmit={handleCheckinSubmit} className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/20 mb-3 text-xs font-bold">
                                    <ShieldCheck size={18} />
                                    Conta Identificada como {user?.name.split(' ')[0]}
                                </div>
                                <h3 className="text-base font-extrabold text-white leading-tight">Quase Pronto!</h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Responda a estas {event.questions.length} perguntas rápidas de preferência para confirmar sua presença no evento:
                                </p>
                            </div>

                            <div className="space-y-3.5 text-xs">
                                {event.questions.map((q) => (
                                    <div key={q.id}>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1.5 leading-normal">{q.label} *</label>
                                        {q.type === 'select' && q.options ? (
                                            <select
                                                value={answers[q.id] || ''}
                                                onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500 text-slate-300"
                                                required
                                                disabled={submittingUser}
                                            >
                                                <option value="">Selecione uma opção</option>
                                                {q.options.map((opt) => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder="Digite sua resposta..."
                                                value={answers[q.id] || ''}
                                                onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500 text-slate-300"
                                                required
                                                disabled={submittingUser}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-1.5 active:scale-95 mt-4 text-xs"
                                disabled={submittingUser}
                            >
                                {submittingUser ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Confirmando...
                                    </>
                                ) : (
                                    <>
                                        Confirmar Presença
                                        <ArrowRight size={14} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                </div>
            </div>

            {/* Link para o suporte do evento */}
            <div className="mt-8 text-center text-xs text-slate-600">
                Precisa de ajuda? Fale com a equipe do Portal no balcão de entrada.
            </div>
        </div>
    );
}
