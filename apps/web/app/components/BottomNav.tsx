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
                            <div key={index} className="relative -top-5">
                                <Link
                                    href={item.href}
                                    className="flex flex-col items-center justify-center w-16 h-16 bg-blue-600 rounded-full shadow-lg border-4 border-gray-50 text-white transform hover:scale-105 transition-transform"
                                >
                                    <Zap size={28} fill="currentColor" />
                                </Link>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={`
                                flex flex-col items-center justify-center py-2 px-1 w-16 flex-1
                                ${item.isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}
                            `}
                        >
                            <Icon size={24} strokeWidth={item.isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium mt-1">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
