'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../../lib/api';
import { Spinner } from '../../components/Spinner';

interface CommissionSummary {
    totalIndications: number;
    totalRevenue: number;
    totalCommission: number;
    commissionRate: number;
    commissionAvailable: number;
    integrated: boolean;
    message?: string;
}

interface Indication {
    id: string;
    orderNumber: number;
    date: string;
    value: number;
    commission: number;
    clientName: string;
    status: string;
}

export default function CommissionsDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [summary, setSummary] = useState<CommissionSummary | null>(null);
    const [indications, setIndications] = useState<Indication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Modal Resgate
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [pixKey, setPixKey] = useState('');
    const [pixType, setPixType] = useState('cpf');
    const [withdrawValue, setWithdrawValue] = useState('');

    // Telefone do financeiro da Portal Distribuidora (Editável no .env ou fallback)
    const financeiroWhatsapp = process.env.NEXT_PUBLIC_FINANCEIRO_WHATSAPP || '5531999999999';

    useEffect(() => {
        if (authLoading) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [summaryRes, indicationsRes] = await Promise.all([
                    apiClient.get('/commissions/summary'),
                    apiClient.get('/commissions/indications')
                ]);
                
                setSummary(summaryRes.data);
                setIndications(indicationsRes.data || []);
                
                // Preenche dados padrão no formulário de resgate
                if (user?.pix_key) {
                    setPixKey(user.pix_key);
                }
                if (summaryRes.data) {
                    setWithdrawValue(summaryRes.data.commissionAvailable.toString());
                }
            } catch (err: any) {
                console.error('Erro ao buscar dados financeiros:', err);
                setError('Falha ao conectar com o painel financeiro do Sankhya. Verifique sua conexão.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, authLoading]);

    // Lida com o envio da solicitação Pix pelo WhatsApp
    const handleWithdrawSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!pixKey.trim()) {
            alert('Por favor, insira uma chave Pix válida.');
            return;
        }

        const value = parseFloat(withdrawValue);
        if (isNaN(value) || value <= 0 || (summary && value > summary.commissionAvailable)) {
            alert(`Por favor, insira um valor válido para resgate (máximo R$ ${summary?.commissionAvailable}).`);
            return;
        }

        // Formatação da mensagem para o WhatsApp do Financeiro da Portal
        const messageText = `Olá, equipe financeira da Portal Distribuidora! 

Sou o eletricista parceiro *${user?.name}*. Gostaria de solicitar o resgate de minha comissão indicada no Portal dos Eletricistas.

*Dados do Resgate:*
- *Valor solicitado:* R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- *Chave PIX:* ${pixKey.trim()} (${pixType.toUpperCase()})

Aguardo o comprovante de depósito. Muito obrigado!`;

        // URL para abrir o WhatsApp
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${financeiroWhatsapp.replace(/\D/g, '')}&text=${encodeURIComponent(messageText)}`;
        
        // Abre em uma nova aba do navegador ou aplicativo WhatsApp no celular
        window.open(whatsappUrl, '_blank');
        
        // Fecha o modal
        setShowWithdrawModal(false);
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center py-20">
                <Spinner />
                <p className="text-slate-400 text-sm mt-4 animate-pulse">Carregando painel financeiro do Sankhya...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-8 rounded-3xl text-center max-w-lg shadow-lg">
                    <p className="text-xl font-black">⚠️ Conexão Sankhya Indisponível</p>
                    <p className="text-sm text-red-300 mt-3">{error}</p>
                </div>
            </div>
        );
    }

    const isIntegrated = summary?.integrated ?? false;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
            {/* Header do Painel */}
            <div className="bg-slate-900 border-b border-slate-800 py-6 px-4 mb-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                        💼 Minhas Comissões & Indicações
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Consulte seu saldo faturado no Sankhya e solicite resgates Pix direto ao financeiro.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4">
                {!isIntegrated ? (
                    /* ALERTA DE INTEGRAÇÃO PENDENTE */
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center shadow-xl max-w-2xl mx-auto my-12">
                        <span className="text-5xl">🔑</span>
                        <h2 className="text-xl font-black mt-4 text-amber-400">Integração Sankhya pendente</h2>
                        <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                            {summary?.message || 'Você ainda não possui um código de vendedor técnico associado à sua conta do Portal.'}
                        </p>
                        <div className="mt-6 flex justify-center">
                            <a
                                href={`https://api.whatsapp.com/send?phone=${financeiroWhatsapp}&text=Olá! Sou o eletricista ${user?.name} e preciso vincular meu CODVENDTEC do Sankhya à minha conta do Portal.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl text-sm font-bold shadow-lg transition-all"
                            >
                                Falar com Financeiro
                            </a>
                        </div>
                    </div>
                ) : (
                    /* PAINEL FINANCEIRO ATIVO */
                    <>
                        {/* CARDS DE KPIS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {/* Card 1: Saldo Disponível */}
                            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 p-6 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
                                <div>
                                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Saldo Disponível</span>
                                    <h3 className="text-3xl font-black text-slate-100 mt-2">
                                        R$ {summary?.commissionAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setShowWithdrawModal(true)}
                                    disabled={!summary || summary.commissionAvailable <= 0}
                                    className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-extrabold text-sm rounded-2xl transition-all shadow-lg hover:shadow-amber-500/10 active:scale-95"
                                >
                                    Solicitar Pix via WhatsApp
                                </button>
                            </div>

                            {/* Card 2: Total Indicado */}
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Volume Faturado</span>
                                <h3 className="text-2xl font-black text-slate-200 mt-2">
                                    R$ {summary?.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </h3>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                    Total faturado pela Portal através de indicações suas.
                                </p>
                            </div>

                            {/* Card 3: Indicações Ativas */}
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Indicações Totais</span>
                                <h3 className="text-2xl font-black text-slate-200 mt-2">
                                    {summary?.totalIndications} {summary?.totalIndications === 1 ? 'Venda' : 'Vendas'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                    Quantidade de pedidos faturados com seu código de parceiro.
                                </p>
                            </div>

                            {/* Card 4: Taxa de Comissão */}
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Minha Taxa</span>
                                <h3 className="text-2xl font-black text-slate-200 mt-2">
                                    {((summary?.commissionRate || 0) * 100).toFixed(1)}%
                                </h3>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                    Percentual de comissão padrão aplicado a todas as indicações faturadas.
                                </p>
                            </div>
                        </div>

                        {/* LISTA DETALHADA DE INDICAÇÕES */}
                        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="px-6 py-5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                                <h2 className="font-bold text-sm text-slate-300 uppercase tracking-wider">
                                    Detalhamento de Indicações (Sankhya)
                                </h2>
                                <span className="text-xs font-semibold px-3 py-1 bg-slate-950 border border-slate-800 text-slate-400 rounded-full">
                                    Sincronizado
                                </span>
                            </div>

                            {indications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-slate-400 font-bold">Nenhuma indicação listada no momento</p>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Assim que suas indicações forem faturadas e integradas no Sankhya, elas aparecerão aqui!
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider">
                                                <th className="py-4 px-6">Nota / ID</th>
                                                <th className="py-4 px-6">Cliente (LGPD)</th>
                                                <th className="py-4 px-6">Data Faturado</th>
                                                <th className="py-4 px-6">Valor Venda</th>
                                                <th className="py-4 px-6 text-right">Minha Comissão</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 text-slate-200">
                                            {indications.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                                                    <td className="py-4 px-6 font-mono font-bold text-xs text-slate-400">
                                                        #{item.orderNumber || item.id.substring(0, 8)}
                                                    </td>
                                                    <td className="py-4 px-6 font-semibold">
                                                        {item.clientName}
                                                    </td>
                                                    <td className="py-4 px-6 text-slate-400">
                                                        {new Date(item.date).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td className="py-4 px-6 font-bold text-slate-400">
                                                        R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="py-4 px-6 font-black text-amber-400 text-right">
                                                        + R$ {item.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* MODAL DE RESGATE PIX */}
            {showWithdrawModal && summary && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-extrabold text-lg text-amber-400">Solicitar Comissão (Pix)</h3>
                            <button
                                onClick={() => setShowWithdrawModal(false)}
                                className="bg-slate-950 p-2 rounded-full border border-slate-800 hover:bg-slate-800 text-slate-400"
                            >
                                <span className="text-xl leading-none">×</span>
                            </button>
                        </div>

                        <form onSubmit={handleWithdrawSubmit} className="space-y-5">
                            {/* Valor do Resgate */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                                    Valor do Saque (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={summary.commissionAvailable}
                                    value={withdrawValue}
                                    onChange={(e) => setWithdrawValue(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-2xl py-3 px-4 text-lg font-black text-slate-200 outline-none transition-all shadow-inner"
                                    required
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Saldo disponível para saque: R$ {summary.commissionAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            {/* Tipo de Chave Pix */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                                    Tipo de Chave Pix
                                </label>
                                <select
                                    value={pixType}
                                    onChange={(e) => setPixType(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl py-3 px-4 text-sm font-semibold outline-none text-slate-300 transition-all"
                                >
                                    <option value="cpf">CPF / CNPJ</option>
                                    <option value="celular">Celular</option>
                                    <option value="email">E-mail</option>
                                    <option value="aleatoria">Chave Aleatória (EVP)</option>
                                </select>
                            </div>

                            {/* Chave Pix */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                                    Chave Pix
                                </label>
                                <input
                                    type="text"
                                    placeholder="Insira sua chave Pix aqui..."
                                    value={pixKey}
                                    onChange={(e) => setPixKey(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-2xl py-3 px-4 text-sm outline-none text-slate-200 transition-all"
                                    required
                                />
                            </div>

                            {/* Botões do Modal */}
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowWithdrawModal(false)}
                                    className="flex-1 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 font-bold text-sm rounded-2xl transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-lg active:scale-95"
                                >
                                    Enviar WhatsApp
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
