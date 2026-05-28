'use client';

import { useState, useEffect } from 'react';
import apiClient from '../../lib/api';
import PageHeader from '../components/PageHeader';
import { Spinner } from '../components/Spinner';

interface RankingUser {
    position: number;
    codVendTec: number;
    name: string;
    avatarUrl: string;
    city: string;
    state: string;
    totalOrders: number;
    totalRevenue: number;
}

export default function RankingPage() {
    const [period, setPeriod] = useState<'semana' | 'mes' | 'ano'>('mes');
    const [ranking, setRanking] = useState<RankingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRanking = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get(`/rankings/public?period=${period}`);
                setRanking(response.data || []);
            } catch (err: any) {
                console.error('Erro ao buscar ranking:', err);
                setError('Não foi possível carregar o ranking de parceiros. Tente novamente mais tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchRanking();
    }, [period]);

    // Separa os 3 líderes do restante do ranking
    const podium = ranking.slice(0, 3);
    
    // Organiza o pódio na ordem visual: 2º Lugar (Esquerda), 1º Lugar (Centro), 3º Lugar (Direita)
    const sortedPodium = [];
    if (podium[1]) sortedPodium.push(podium[1]); // 2º colocado
    if (podium[0]) sortedPodium.push(podium[0]); // 1º colocado
    if (podium[2]) sortedPodium.push(podium[2]); // 3º colocado

    const listUsers = ranking.slice(3);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
            <div className="bg-slate-900 border-b border-slate-800 py-6 px-4 mb-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                            ⚡ Liga dos Embaixadores
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Ranking dos eletricistas parceiros que mais indicaram a Portal Distribuidora.
                        </p>
                    </div>

                    {/* Selector de Período */}
                    <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-inner w-full md:w-auto">
                        <button
                            onClick={() => setPeriod('semana')}
                            className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                                period === 'semana'
                                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Esta Semana
                        </button>
                        <button
                            onClick={() => setPeriod('mes')}
                            className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                                period === 'mes'
                                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Este Mês
                        </button>
                        <button
                            onClick={() => setPeriod('ano')}
                            className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                                period === 'ano'
                                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Últimos 12M
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Spinner />
                        <p className="text-slate-400 text-sm mt-4 animate-pulse">Sincronizando faturamento no Sankhya...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-6 rounded-2xl text-center shadow-lg my-12">
                        <p className="text-lg font-bold">⚠️ Ops! Algo deu errado</p>
                        <p className="text-sm text-red-300 mt-2">{error}</p>
                    </div>
                ) : ranking.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center shadow-xl my-12">
                        <p className="text-2xl font-black text-slate-400">⚡ Nenhum faturamento registrado</p>
                        <p className="text-sm text-slate-500 mt-3">
                            Ainda não há indicações processadas para este período. Comece a indicar e apareça no topo!
                        </p>
                    </div>
                ) : (
                    <>
                        {/* PÓDIO DOS 3 PRIMEIROS */}
                        <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-16 mt-6 max-w-4xl mx-auto">
                            {sortedPodium.map((user) => {
                                const isFirst = user.position === 1;
                                const isSecond = user.position === 2;
                                const isThird = user.position === 3;

                                return (
                                    <div
                                        key={user.codVendTec}
                                        className={`w-full md:w-1/3 flex flex-col items-center justify-end rounded-3xl border relative transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                                            isFirst
                                                ? 'bg-gradient-to-b from-amber-500/20 to-slate-900/60 border-amber-400/50 shadow-amber-500/5 h-[340px] md:h-[380px] order-1 md:order-2'
                                                : isSecond
                                                ? 'bg-slate-900/40 border-slate-700 h-[280px] md:h-[320px] order-2 md:order-1'
                                                : 'bg-slate-900/40 border-amber-800/30 h-[260px] md:h-[290px] order-3'
                                        } p-6 shadow-xl`}
                                    >
                                        {/* Medalha / Medal Badge */}
                                        <div
                                            className={`absolute -top-6 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg ${
                                                isFirst
                                                    ? 'bg-gradient-to-br from-amber-400 to-yellow-300 text-slate-950 scale-110 border border-amber-300'
                                                    : isSecond
                                                    ? 'bg-gradient-to-br from-slate-300 to-slate-100 text-slate-950 border border-slate-200'
                                                    : 'bg-gradient-to-br from-amber-800 to-amber-600 text-white border border-amber-700'
                                            }`}
                                        >
                                            {user.position === 1 ? '🥇' : user.position === 2 ? '🥈' : '🥉'}
                                        </div>

                                        {/* Avatar do Usuário */}
                                        <div
                                            className={`w-20 h-20 rounded-full overflow-hidden border-2 mb-4 relative ${
                                                isFirst
                                                    ? 'border-amber-400 shadow-xl shadow-amber-500/10'
                                                    : isSecond
                                                    ? 'border-slate-300'
                                                    : 'border-amber-700'
                                            }`}
                                        >
                                            <img
                                                src={user.avatarUrl}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src =
                                                        'https://cdn-icons-png.flaticon.com/512/2910/2910768.png';
                                                }}
                                            />
                                        </div>

                                        {/* Informações Cadastrais */}
                                        <h3 className="font-extrabold text-lg text-slate-100 text-center line-clamp-1">
                                            {user.name}
                                        </h3>
                                        <p className="text-slate-400 text-xs mt-0.5 font-semibold">
                                            {user.city ? `${user.city} - ${user.state}` : user.state || 'Portal Distribuidora'}
                                        </p>

                                        {/* Indicadores / Metas */}
                                        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl w-full py-2.5 px-4 mt-5 text-center shadow-inner">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                                Volume Indicado
                                            </p>
                                            <p className={`text-lg font-black mt-0.5 ${isFirst ? 'text-amber-400' : 'text-slate-200'}`}>
                                                R$ {user.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1">
                                                <strong>{user.totalOrders}</strong> {user.totalOrders === 1 ? 'indicação' : 'indicações'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* LISTA GERAL (4º AO 50º LUGAR) */}
                        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800">
                                <h2 className="font-bold text-sm text-slate-300 uppercase tracking-wider">
                                    Classificação Geral
                                </h2>
                            </div>

                            <div className="divide-y divide-slate-800/60">
                                {listUsers.map((user) => (
                                    <div
                                        key={user.codVendTec}
                                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/20 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Posição */}
                                            <span className="w-6 font-black text-slate-500 text-sm text-center">
                                                {user.position}º
                                            </span>

                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src =
                                                            'https://cdn-icons-png.flaticon.com/512/2910/2910768.png';
                                                    }}
                                                />
                                            </div>

                                            {/* Nome e Cidade */}
                                            <div>
                                                <p className="font-bold text-slate-200 text-sm line-clamp-1">{user.name}</p>
                                                <p className="text-slate-500 text-xs">
                                                    {user.city ? `${user.city} - ${user.state}` : user.state || 'Parceiro'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Faturamento e Contadores */}
                                        <div className="text-right">
                                            <p className="font-black text-slate-200 text-sm">
                                                R$ {user.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-slate-500 text-[10px]">
                                                {user.totalOrders} {user.totalOrders === 1 ? 'indicação' : 'indicações'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* REGRAS E PREMIAÇÃO */}
                        <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 shadow-lg">
                            <span className="text-4xl shrink-0">🏆</span>
                            <div>
                                <h3 className="font-bold text-amber-400 text-lg">Indique e Ganhe Prêmios!</h3>
                                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                                    Os melhores colocados no ranking semanal e mensal recebem premiações exclusivas e cashbacks em compras diretamente na Portal Distribuidora. Certifique-se de que os seus clientes citem o seu código de vendedor nas compras para pontuar!
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
