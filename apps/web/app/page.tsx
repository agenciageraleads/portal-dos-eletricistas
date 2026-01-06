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
    ShieldCheck
} from 'lucide-react';
import { OnboardingModal } from './components/OnboardingModal';
import JornadaModal from './components/JornadaModal';

export default function Home() {
    const { user, logout } = useAuth();

    const menuItems = [
        {
            title: 'Orçamento Rápido',
            description: 'Mão de obra e itens manuais',
            icon: <FileText size={28} className="text-white" />,
            bg: 'bg-blue-600',
            href: '/orcamento',
            color: 'text-blue-600'
        },
        {
            title: 'Catálogo',
            description: 'Orçamento com produtos',
            icon: <PackageSearch size={28} className="text-white" />,
            bg: 'bg-cyan-600',
            href: '/catalogo',
            color: 'text-cyan-600'
        },
        {
            title: 'Meus Orçamentos',
            description: 'Gerenciar propostas',
            icon: <ShoppingCart size={28} className="text-white" />,
            bg: 'bg-emerald-600',
            href: '/orcamentos',
            color: 'text-emerald-600'
        },
        {
            title: 'Ferramentas',
            description: 'Calculadoras',
            icon: <Calculator size={28} className="text-white" />,
            bg: 'bg-orange-600',
            href: '/ferramentas',
            color: 'text-orange-600'
        },
        {
            title: 'Comunidade',
            description: 'Em Breve',
            icon: <Users size={28} className="text-white" />,
            bg: 'bg-purple-400',
            href: '#',
            color: 'text-purple-400',
            badge: 'Em Breve'
        },
        {
            title: 'IA Eletricista',
            description: 'Em Breve',
            icon: <MessageCircle size={28} className="text-white" />,
            bg: 'bg-pink-400',
            href: '#',
            color: 'text-pink-400',
            badge: 'Em Breve'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800 leading-tight">Portal do Eletricista</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                {user.role === 'ADMIN' && (
                                    <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group" title="Painel Admin">
                                        <ShieldCheck size={22} className="text-blue-600" />
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                    </Link>
                                )}
                                <Link href="/perfil" className="flex items-center gap-2 hover:bg-gray-100 pl-1 pr-2 py-1 rounded-full transition-all border border-transparent hover:border-gray-200">
                                    {user.logo_url ? (
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                                            <img
                                                src={user.logo_url.startsWith('http') ? user.logo_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}${user.logo_url}`}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                            <User size={18} className="text-gray-500" />
                                        </div>
                                    )}
                                </Link>
                                <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Sair">
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="px-5 py-1.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-md text-xs">
                                Entrar
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-md mx-auto px-4 py-6 w-full">
                {/* Welcome Section */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        Olá, {user?.name.split(' ')[0] || 'Eletricista'}! 👋
                    </h2>
                    <p className="text-sm text-gray-600">Seu escritório digital.</p>
                </div>

                {/* App Grid */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={`
                                flex flex-col items-center gap-2 p-2 rounded-xl transition-transform active:scale-95
                                ${item.badge ? 'opacity-80' : 'hover:bg-gray-100'}
                            `}
                        >
                            <div className={`
                                w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-1
                                ${item.bg} text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                            `}>
                                {item.icon}
                            </div>
                            <div className="text-center">
                                <span className="block text-xs font-bold text-gray-800 leading-tight">
                                    {item.title}
                                </span>
                                {item.badge && (
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Gamification Banner (Placeholder for Modal Trigger if closed) */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between relative overflow-hidden group cursor-pointer" id="jornada-trigger">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                            <Trophy size={32} className="text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Sua Jornada Profissional</h3>
                            <p className="text-gray-300 text-sm">Complete seu perfil e desbloqueie conquistas.</p>
                        </div>
                    </div>
                    <div className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg transform group-hover:scale-105 transition-transform">
                        Ver Progresso
                    </div>
                </div>

            </main>

            {/* Footer / Copyright */}
            <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <p className="text-gray-400 text-sm">
                        &copy; 2026 Portal do Eletricista. Feito por eletricistas, para eletricistas.
                    </p>
                </div>
            </footer>

            {/* Modals */}
            <OnboardingModal />
            <JornadaModal />
        </div>
    );
}
