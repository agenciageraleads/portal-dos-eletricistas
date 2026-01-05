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
            title: 'Fazer Orçamento Simplificado',
            description: 'Apenas mão de obra ou itens manuais.',
            icon: <FileText size={32} className="text-white" />,
            bg: 'bg-blue-600',
            href: '/orcamento', // Redirects to blank budget
            color: 'text-blue-600'
        },
        {
            title: 'Orçamento + Catálogo',
            description: 'Adicione produtos direto do nosso catálogo.',
            icon: <PackageSearch size={32} className="text-white" />,
            bg: 'bg-cyan-600',
            href: '/catalogo',
            color: 'text-cyan-600'
        },
        {
            title: 'Meus Orçamentos',
            description: 'Gerencie e envie propostas para clientes.',
            icon: <ShoppingCart size={32} className="text-white" />, // Using ShoppingCart/FileText metaphor
            bg: 'bg-emerald-600',
            href: '/orcamentos',
            color: 'text-emerald-600'
        },
        {
            title: 'Comunidade Elétrica',
            description: 'Troque experiências com outros profissionais.',
            icon: <Users size={32} className="text-white" />,
            bg: 'bg-purple-600',
            href: '#',
            color: 'text-purple-600',
            badge: 'Em Breve'
        },
        {
            title: 'Ferramentas Úteis',
            description: 'Calculadoras de bitola, disjuntores e mais.',
            icon: <Calculator size={32} className="text-white" />,
            bg: 'bg-orange-600',
            href: '/ferramentas',
            color: 'text-orange-600'
        },
        {
            title: 'Eletricista GPT',
            description: 'Tire dúvidas técnicas com nossa IA.',
            icon: <MessageCircle size={32} className="text-white" />,
            bg: 'bg-pink-600',
            href: '#',
            color: 'text-pink-600',
            badge: 'Em Breve'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 leading-tight">Portal do Eletricista</h1>
                            <p className="text-xs text-gray-500 font-medium">Seu escritório digital</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                {user.role === 'ADMIN' && (
                                    <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group" title="Painel Admin">
                                        <ShieldCheck size={24} className="text-blue-600" />
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                    </Link>
                                )}
                                <Link href="/perfil" className="flex items-center gap-3 hover:bg-gray-100 pl-1 pr-3 py-1 rounded-full transition-all border border-transparent hover:border-gray-200">
                                    {user.logo_url ? (
                                        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                                            <img
                                                src={user.logo_url.startsWith('http') ? user.logo_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}${user.logo_url}`}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                            <User size={20} className="text-gray-500" />
                                        </div>
                                    )}
                                    <div className="hidden sm:block text-left">
                                        <p className="text-sm font-bold text-gray-800 leading-none">{user.name.split(' ')[0]}</p>
                                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                                            {user.role === 'ADMIN' ? 'Administrador' : 'Profissional'}
                                        </p>
                                    </div>
                                </Link>
                                <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Sair">
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg text-sm">
                                Entrar
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Olá, {user?.name.split(' ')[0] || 'Eletricista'}! 👋
                    </h2>
                    <p className="text-gray-600">O que você deseja fazer hoje?</p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={`
                                group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 
                                transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block
                                ${item.badge ? 'opacity-90' : ''}
                            `}
                        >
                            <div className={`
                                absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full 
                                opacity-5 transition-transform group-hover:scale-150 ${item.bg.replace('bg-', 'bg-')}
                            `}></div>

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className={`p-3 rounded-xl shadow-md ${item.bg} transition-transform group-hover:scale-110 duration-300`}>
                                    {item.icon}
                                </div>
                                {item.badge && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-gray-200">
                                        {item.badge}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors relative z-10">
                                {item.title}
                            </h3>
                            <p className="text-sm text-gray-500 relative z-10">
                                {item.description}
                            </p>

                            {!item.badge && (
                                <div className={`
                                    absolute bottom-4 right-4 opacity-0 transform translate-x-4 
                                    group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300
                                    ${item.color}
                                `}>
                                    <ChevronRight size={24} />
                                </div>
                            )}
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
