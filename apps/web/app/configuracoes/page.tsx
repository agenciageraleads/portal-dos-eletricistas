'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfiguracoesPage() {
    const router = useRouter();

    useEffect(() => {
        // Por enquanto, configurações e dados do perfil estão unificados
        // Redirecionamos para o perfil para evitar 404
        router.push('/perfil');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-pulse text-gray-500">Carregando configurações...</div>
        </div>
    );
}
