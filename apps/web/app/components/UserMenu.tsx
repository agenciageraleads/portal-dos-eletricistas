'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, Settings, UserCircle, FileText, MessageSquare } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface UserMenuProps {
    user: any;
    logout: () => void;
}

export default function UserMenu({ user, logout }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const avatarUrl = getImageUrl(user?.logo_url);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 focus:outline-none"
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover border border-gray-200"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-brand-primary-light flex items-center justify-center text-brand-primary border border-teal-200">
                        <User size={20} />
                    </div>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300 origin-top-right">
                    <div className="p-5 border-b border-gray-50 bg-brand-primary-light/30">
                        <p className="text-sm font-black text-gray-900 truncate tracking-tight">{user.name}</p>
                        <p className="text-[10px] font-bold text-brand-primary truncate uppercase tracking-widest mt-1 opacity-70">{user.email}</p>
                    </div>

                    <div className="p-2">
                        <Link
                            href="/perfil"
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all active:scale-95 group"
                            onClick={() => setIsOpen(false)}
                        >
                            <UserCircle size={20} className="text-brand-primary group-hover:scale-110 transition-transform" />
                            <span className="font-bold">Meus Dados</span>
                        </Link>

                        <Link
                            href="/configuracoes"
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Settings size={18} className="text-gray-500" />
                            Configurações
                        </Link>

                        <Link
                            href="/termos"
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <FileText size={18} className="text-gray-500" />
                            Termos de Uso
                        </Link>

                        <Link
                            href="https://wa.me/5562982435286"
                            target="_blank"
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <MessageSquare size={18} className="text-green-600" />
                            Falar com Suporte
                        </Link>

                        <div className="h-px bg-gray-100 my-1"></div>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                logout();
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                        >
                            <LogOut size={18} />
                            Sair
                        </button>

                        <div className="pt-2 pb-1 text-center">
                            <span className="text-[10px] text-gray-400 font-mono">
                                v1.6.3
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
