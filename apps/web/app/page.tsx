'use client';

import { useAuth } from './contexts/AuthContext';
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

export default function Home() {
    const { user, logout } = useAuth();

    // Gov.br style often uses lists or simpler cards for "Frequent Services"
    const quickAccess = [
        {
            title: 'Novo Orçamento',
            description: 'Criar proposta',
            icon: <FileText size={20} className="text-blue-600" />,
            href: '/orcamento'
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
                            Portal<span className="text-blue-600">Eletricista</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            <Bell size={22} />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* User Avatar (Redirects to Profile or just display) */}
                        <Link href="/perfil" className="block relative">
                            {user?.logo_url ? (
                                <img
                                    src={user.logo_url.startsWith('http') ? user.logo_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}${user.logo_url}`}
                                    alt="Profile"
                                    className="w-9 h-9 rounded-full object-cover border border-gray-200"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                                    <User size={20} />
                                </div>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            {/* 2. BLUE BANNER (Greeting & Account Level) */}
            <div className="bg-blue-600 text-white pt-6 pb-12 px-4 rounded-b-[2rem] shadow-md mb-[-2rem] relative z-0">
                <div className="max-w-md mx-auto">
                    <h2 className="text-2xl font-bold mb-1">
                        Olá, {user?.name.split(' ')[0] || 'Parceiro'}
                    </h2>
                    <div className="flex items-center gap-2 opacity-90">
                        <span className="text-sm font-medium bg-blue-700/50 px-2 py-0.5 rounded text-blue-100 border border-blue-500/30">
                            Conta Profissional
                        </span>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-md mx-auto px-4 w-full relative z-10">



                {/* 4. CONTENT SECTIONS */}

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

                {/* Gamification / Status Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white shadow-lg mb-6 relative overflow-hidden">
                    {/* Decorative circle */}
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Trophy size={18} className="text-yellow-400" />
                                <span className="font-bold text-yellow-400 text-sm uppercase tracking-wide">Nível Ouro</span>
                            </div>
                            <h3 className="font-bold text-lg mb-1">Sua Jornada</h3>
                            <p className="text-gray-400 text-xs max-w-[200px]">Complete missões para desbloquear benefícios exclusivos no portal.</p>
                        </div>
                        {/* Progress Circle Placeholder */}
                        <div className="w-12 h-12 rounded-full border-4 border-blue-500 flex items-center justify-center font-bold text-xs bg-gray-800">
                            75%
                        </div>
                    </div>

                    <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/10">
                        Ver Conquistas
                    </button>
                </div>

                {/* Other Services / Categories */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3 px-1">Outros Serviços</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="#" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 text-center hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                                <Users size={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Comunidade</span>
                        </Link>
                        <Link href="#" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 text-center hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center">
                                <MessageCircle size={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Dúvidas?</span>
                        </Link>
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
