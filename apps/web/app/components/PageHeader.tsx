'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
    title: string;
    icon?: React.ReactNode;
    subtitle?: string;
    showBack?: boolean;
    backPath?: string;
    rightAction?: React.ReactNode;
}

export default function PageHeader({
    title,
    icon,
    showBack = true,
    backPath = '/',
    rightAction
}: PageHeaderProps) {
    const router = useRouter();

    return (
        <header className="bg-white px-4 py-4 shadow-sm sticky top-0 z-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
                {showBack && (
                    <button
                        onClick={() => backPath ? router.push(backPath) : router.back()}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                )}

                <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    {icon && <span className="text-blue-600">{icon}</span>}
                    {title}
                </h1>
            </div>

            {rightAction && <div>{rightAction}</div>}
        </header>
    );
}
