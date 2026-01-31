'use client';

import { useState, useEffect } from 'react';
import { BrainCircuit, Lock, Share2, Users } from 'lucide-react';
import api from '@/lib/api';
import BottomNav from '../components/BottomNav';
import PageHeader from '../components/PageHeader';

export default function IAPage() {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const TARGET = 500;

    useEffect(() => {
        api.get('/users/count')
            .then(({ data }) => setCount(data.count || 0))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const progress = Math.min((count / TARGET) * 100, 100);

    const handleShare = () => {
        const text = encodeURIComponent(
            "⚡ Olá! Já conhece o Portal do Eletricista?\n\n" +
            "Ferramenta completa para orçamentos, catálogo e calculadoras.\n" +
            "Estão liberando uma IA exclusiva quando bater 500 cadastros!\n\n" +
            "Cadastre-se grátis agora: https://app.portaleletricos.com.br"
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            <PageHeader
                title="Eletricista GPT"
                icon={<BrainCircuit size={20} />}
                showBack={false}
            />

            <main className="max-w-md mx-auto p-6 flex flex-col items-center justify-center min-h-[70vh] text-center">

                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-yellow-100 rounded-full blur-3xl opacity-50"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner relative">
                            <BrainCircuit size={40} className="text-gray-400" />
                            <div className="absolute -right-2 -bottom-2 bg-yellow-400 text-yellow-900 p-1.5 rounded-lg shadow-sm border border-white">
                                <Lock size={16} />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            Em Standby
                        </h2>

                        <p className="text-gray-500 text-sm leading-relaxed mb-8">
                            O <strong>Eletricista GPT</strong> está passando por melhorias para ficar ainda mais inteligente. Vamos liberar o acesso gratuito para todos assim que nossa comunidade crescer!
                        </p>

                        {/* Progress Section */}
                        <div className="w-full mb-8">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Meta da Comunidade</span>
                                <div className="flex items-center gap-1 text-blue-900 font-bold">
                                    <Users size={14} />
                                    <span>{loading ? '...' : count}</span>
                                    <span className="text-gray-400 text-sm">/ {TARGET}</span>
                                </div>
                            </div>

                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out relative"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                Falta pouco! Convide seus colegas.
                            </p>
                        </div>

                        <button
                            onClick={handleShare}
                            className="w-full bg-[#25D366] hover:bg-[#20b85c] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Share2 size={20} />
                            Compartilhar no WhatsApp
                        </button>
                    </div>
                </div>

            </main>

            <BottomNav />
        </div>
    );
}
