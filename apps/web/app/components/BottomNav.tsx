'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Wrench,
    FileText,
    BrainCircuit,
    Grid,
    User,
    Zap,
    Bell,
    MessageSquare
} from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        {
            label: 'Orçamentos',
            href: '/orcamentos',
            icon: FileText,
            isActive: pathname.startsWith('/orcamentos')
        },
        {
            label: 'Serviços',
            href: '/services',
            icon: Grid,
            isActive: pathname.startsWith('/services')
        },
        {
            label: 'IA',
            href: '/ia',
            icon: BrainCircuit,
            isActive: false,
            isSpecial: true
        },
        {
            label: 'Ferramentas',
            href: '/ferramentas',
            icon: Wrench,
            isActive: pathname.startsWith('/ferramentas')
        },
        {
            label: 'Feedback',
            href: '/feedback',
            icon: MessageSquare,
            isActive: pathname.startsWith('/feedback')
        }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
            <div className="flex items-end justify-between px-2 max-w-md mx-auto">
                {navItems.map((item, index) => {
                    // @ts-ignore - isSpecial might not exist on all items type definition
                    const isSpecial = item.isSpecial;
                    const Icon = item.icon;

                    if (isSpecial) {
                        return (
                            <div key={index} className="relative -top-6">
                                <Link
                                    href={item.href}
                                    className="flex flex-col items-center justify-center w-16 h-16 bg-brand-primary rounded-[1.5rem] shadow-xl shadow-teal-900/20 border-4 border-white text-white transform hover:scale-110 active:scale-90 transition-all group"
                                >
                                    <div className="absolute inset-0 bg-white/10 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Zap size={28} fill="currentColor" className="relative" />
                                </Link>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={`
                                flex flex-col items-center justify-center py-3 px-1 w-16 flex-1 transition-all active:scale-90
                                ${item.isActive ? 'text-brand-primary' : 'text-gray-400 hover:text-gray-600'}
                            `}
                        >
                            <Icon size={24} strokeWidth={item.isActive ? 3 : 2} className={item.isActive ? 'scale-110 transition-transform' : ''} />
                            <span className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${item.isActive ? 'opacity-100' : 'opacity-60'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
