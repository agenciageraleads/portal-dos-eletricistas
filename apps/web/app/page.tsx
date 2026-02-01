'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useInstallPrompt } from './contexts/InstallContext';
import Link from 'next/link';
import {
    FileText,
    ShoppingCart,
    Calculator,
    Users,
    Zap,
    MessageCircle,
    PackageSearch,
    ChevronRight,
    Trophy,
    LogOut,
    User,
    ShieldCheck,
    Bell,
    Search
} from 'lucide-react';
import { OnboardingModal } from './components/OnboardingModal';
import JornadaModal from './components/JornadaModal';
import BottomNav from './components/BottomNav';
import UserMenu from './components/UserMenu';

export default function Home() {
    const { user, logout } = useAuth();
    const { triggerInstall, isIOS, isInstalled, showInstallPrompt } = useInstallPrompt();
    const [hasSharedWhatsapp, setHasSharedWhatsapp] = useState(false);

    useEffect(() => {
        const syncShareFlag = () => {
            setHasSharedWhatsapp(localStorage.getItem('hasSharedWhatsapp') === 'true');
        };
        syncShareFlag();
        window.addEventListener('storage', syncShareFlag);
        window.addEventListener('jornada-progress-update', syncShareFlag as EventListener);
        return () => {
            window.removeEventListener('storage', syncShareFlag);
            window.removeEventListener('jornada-progress-update', syncShareFlag as EventListener);
        };
    }, []);

    // Gov.br style often uses lists or simpler cards for "Frequent Services"
    const quickAccess = [
        {
            title: 'Novo Orçamento',
            description: 'Criar proposta',
            icon: <FileText size={20} className="text-blue-600" />,
            href: '/orcamento/novo'
        },
        {
            title: 'Meus Orçamentos',
            description: 'Ver histórico',
            icon: <ShoppingCart size={20} className="text-emerald-600" />,
            href: '/orcamentos'
        },
        {
            title: 'Catálogo',
            description: 'Consultar preços',
            icon: <PackageSearch size={20} className="text-cyan-600" />,
            href: '/catalogo'
        },
        {
            title: 'Calculadoras',
            description: 'Ferramentas',
            icon: <Calculator size={20} className="text-orange-600" />,
            href: '/ferramentas'
        }
    ];

    const jornadaTasks = useMemo(() => {
        if (!user) return [];
        const canShowInstall = !isInstalled && (showInstallPrompt || isIOS);
        return [
            {
                id: 'profile',
                title: 'Finalize seu Perfil',
                description: 'Adicione sua Bio e Telefone para passar confiança.',
                isCompleted: !!(user.bio && user.phone),
                action: '/perfil'
            },
            {
                id: 'pix',
                title: 'Cadastre sua Chave Pix',
                description: 'Necessário para receber pagamentos futuros.',
                isCompleted: !!user.pix_key,
                action: '/perfil'
            },
            {
                id: 'budget',
                title: 'Faça seu Primeiro Orçamento',
                description: 'Crie uma proposta profissional agora.',
                isCompleted: (user._count?.budgets || 0) > 0,
                action: '/orcamento'
            },
            {
                id: 'share',
                title: 'Envie via WhatsApp',
                description: 'Compartilhe um orçamento com um cliente.',
                isCompleted: hasSharedWhatsapp,
                action: '/orcamentos'
            },
            ...(canShowInstall ? [{
                id: 'install_app',
                title: 'Salvar na Tela Inicial',
                description: 'Acesse mais rápido o Portal no seu celular.',
                isCompleted: isInstalled,
                action: '#install-trigger'
            }] : []),
            {
                id: 'invite',
                title: 'Convide 5 Parceiros',
                description: 'Construa sua rede (Em Breve).',
                isCompleted: false
            }
        ];
    }, [user, isInstalled, hasSharedWhatsapp, showInstallPrompt, isIOS]);

    const jornadaProgress = useMemo(() => {
        if (!jornadaTasks.length) return 0;
        const completedCount = jornadaTasks.filter(t => t.isCompleted).length;
        return Math.round((completedCount / jornadaTasks.length) * 100);
    }, [jornadaTasks]);

    const nextTask = useMemo(() => {
        return jornadaTasks.find(t => !t.isCompleted);
    }, [jornadaTasks]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
            {/* 1. TOP HEADER (Gov.br style: Logo Left, Actions Right) */}
            <header className="bg-white py-3 px-4 shadow-sm sticky top-0 z-20">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center text-blue-600">
                            {/* Keep it simple or use the App Icon */}
                            <Zap size={28} fill="currentColor" />
                        </div>
                        <span className="font-bold text-lg text-blue-900 tracking-tight">
                            Portal<span className="text-blue-600">Elétricos</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <Link href="/inbox" className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            <Bell size={22} />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </Link>

                        {/* Admin Panel Access */}
                        {user?.role === 'ADMIN' && (
                            <Link href="/admin" className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Painel Administrativo">
                                <ShieldCheck size={22} />
                            </Link>
                        )}

                        {/* User UserMenu (Dropdown) */}
                        <UserMenu user={user} logout={logout} />
                    </div>
                </div>
            </header>

            {/* 2. BLUE BANNER (Greeting & Account Level) */}
            <div className="bg-blue-600 text-white pt-6 pb-12 px-4 rounded-b-[2rem] shadow-md mb-[-2rem] relative z-0">
                <div className="max-w-md mx-auto">
                    {user ? (
                        <>
                            <h2 className="text-2xl font-bold mb-1">
                                Olá, {user.name.split(' ')[0]}
                            </h2>
                            <div className="flex items-center gap-2 opacity-90">
                                <span className="text-sm font-medium bg-blue-700/50 px-2 py-0.5 rounded text-blue-100 border border-blue-500/30">
                                    Conta Profissional
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-2">
                            <h2 className="text-2xl font-bold mb-2">
                                Bem-vindo ao Portal!
                            </h2>
                            <p className="text-blue-100 text-sm mb-4">
                                A ferramenta completa para eletricistas profissionais.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Link href="/login" className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-full font-semibold text-sm transition-colors shadow-sm border border-blue-500/30">
                                    Entrar
                                </Link>
                                <Link href="/register" className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors shadow-sm">
                                    Cadastrar Grátis
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <main className="flex-1 max-w-md mx-auto px-4 w-full relative z-10">



                {/* 4. CONTENT SECTIONS */}

                {user && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy size={16} className="text-yellow-500" />
                                <h3 className="font-semibold text-gray-700 text-sm">Sua Jornada</h3>
                            </div>
                            <button
                                id="jornada-trigger"
                                className="text-xs font-bold text-blue-600 hover:underline"
                            >
                                Ver detalhes
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">
                                    <span>Progresso</span>
                                    <span>{jornadaProgress}%</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400 transition-all duration-500 ease-out"
                                        style={{ width: `${jornadaProgress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg border border-blue-100">
                                    <Trophy size={18} className="text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Próxima Missão</p>
                                    {nextTask ? (
                                        <>
                                            <p className="font-semibold text-gray-800 text-sm">{nextTask.title}</p>
                                            <p className="text-xs text-gray-600 mt-1">{nextTask.description}</p>
                                            {nextTask.action && (
                                                nextTask.action === '#install-trigger' ? (
                                                    <button
                                                        onClick={triggerInstall}
                                                        className="mt-3 inline-flex items-center text-sm font-bold text-blue-600 hover:underline"
                                                    >
                                                        Salvar na tela inicial <ChevronRight size={16} />
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href={nextTask.action}
                                                        className="mt-3 inline-flex items-center text-sm font-bold text-blue-600 hover:underline"
                                                    >
                                                        Vamos lá <ChevronRight size={16} />
                                                    </Link>
                                                )
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm font-semibold text-gray-800">Parabéns! Você concluiu todas as missões.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Access List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-700 text-sm">Acesso Rápido</h3>
                    </div>
                    <div>
                        {quickAccess.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                                        <p className="text-xs text-gray-500">{item.description}</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-300" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Gamification / PWA INSTALL CARD - Hidden as requested
                {!isInstalled && (
                    <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-6 text-white shadow-xl mb-8 relative overflow-hidden border border-white/10">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">Missão Diária</span>
                            </div>

                            <h3 className="text-2xl font-bold mb-2 leading-tight">Instale o App e ganhe acesso offline!</h3>
                            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                                Adicione o Portal à sua tela inicial para acessar orçamentos e ferramentas mesmo sem internet.
                            </p>

                            <button
                                onClick={triggerInstall}
                                className="w-full bg-white text-blue-900 font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Zap size={20} className="text-blue-600" />
                                {isIOS ? 'Como Instalar no iPhone' : 'Instalar Aplicativo Agora'}
                            </button>
                        </div>
                    </div>
                )} */}

                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4 px-1">
                        <h3 className="font-bold text-gray-800 text-lg">Outros Serviços</h3>
                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase tracking-wide border border-gray-200">Em Breve 🚧</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 flex flex-col items-center gap-3 text-center grayscale opacity-70">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Users size={24} className="text-gray-400" />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-gray-500 block">Comunidade</span>
                                <span className="text-[10px] text-gray-400">Networking</span>
                            </div>
                        </div>
                        <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 flex flex-col items-center gap-3 text-center grayscale opacity-70">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <MessageCircle size={24} className="text-gray-400" />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-gray-500 block">Suporte VIP</span>
                                <span className="text-[10px] text-gray-400">Consultoria</span>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* Modals */}
            <OnboardingModal />
            <JornadaModal />

            {/* 5. BOTTOM NAVIGATION */}
            <BottomNav />
        </div>
    );
}
