'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, Settings, UserCircle, FileText, MessageSquare } from 'lucide-react';

interface UserMenuProps {
    user: any;
    logout: () => void;
}

export default function UserMenu({ user, logout }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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
                {user.logo_url ? (
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
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <div className="p-1">
                        <Link
                            href="/perfil"
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <UserCircle size={18} className="text-blue-600" />
                            Meus Dados
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
                                v1.6.0
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
