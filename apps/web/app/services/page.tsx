'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '@/lib/api';
import BottomNav from '../components/BottomNav';
import { Plus, MapPin, Calendar, User, Trash2, ArrowLeft, Filter, Search, CheckCircle, Eye, Lock, Unlock } from 'lucide-react';
import Link from 'next/link';
import CreateServiceModal from '../components/CreateServiceModal';

interface ServiceListing {
    id: string;
    title: string;
    description: string;
    price: string | null;
    city: string | null;
    state: string | null;
    date: string;
    whatsapp: string | null;
    type: string; // 'CLIENT_SERVICE', 'PRO_SUBCONTRACT', 'PRO_HELPER_JOB', etc.
    userId: string;
    status: 'OPEN' | 'FILLED' | 'CANCELLED' | 'LIMIT_REACHED' | 'CLOSED_HIRED' | 'EXPIRED';
    maxLeads: number;
    leadsCount: number;
    alreadyUnlocked?: boolean;
    user: {
        name: string;
        logo_url: string | null;
    };
    createdAt: string;
}

interface Professional {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    logo_url: string | null;
    phone: string | null;
    isAvailableForWork: boolean;
    pre_cadastrado: boolean;
    cadastro_finalizado: boolean;
    commercial_index: number | null;
}

export default function ServicesPage() {
    const { user, refreshUser } = useAuth();

    // Data States
    const [services, setServices] = useState<ServiceListing[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);

    // UI States
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'BOARD' | 'PROFESSIONALS'>('BOARD');
    const [unlockingId, setUnlockingId] = useState<string | null>(null);

    // Filters
    const [cityFilter, setCityFilter] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (activeTab === 'BOARD') {
            fetchServices();
        } else {
            fetchProfessionals();
        }
    }, [activeTab, cityFilter, minPrice, maxPrice]);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            // params.append('type', 'REQUEST'); // Filter Only Requests
            if (cityFilter) params.append('city', cityFilter);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);

            const { data } = await api.get(`/services?${params.toString()}`);
            setServices(data);
        } catch (error) {
            console.error('Error fetching services', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProfessionals = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (cityFilter) params.append('city', cityFilter);

            const { data } = await api.get(`/users/available?${params.toString()}`);
            setProfessionals(data);
        } catch (error) {
            console.error('Error fetching professionals', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;
        try {
            await api.delete(`/services/${id}`);
            setServices(services.filter(s => s.id !== id));
        } catch (error) {
            alert('Erro ao excluir');
        }
    };

    const handleUnlockContact = async (service: ServiceListing) => {
        if (!user) {
            alert('Faça login para ver o contato.');
            return;
        }
        if (service.userId === user.id) return; // Own Service

        if (service.alreadyUnlocked && service.whatsapp) {
            window.open(`https://wa.me/55${service.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, vi seu pedido "${service.title}" no Portal.`)}`, '_blank');
            return;
        }

        if (confirm(`Deseja liberar o contato deste cliente? \n(Restam ${service.maxLeads - service.leadsCount} visualizações)`)) {
            setUnlockingId(service.id);
            try {
                const { data } = await api.post(`/services/${service.id}/contact`);

                // Update local state
                setServices(prev => prev.map(s => {
                    if (s.id === service.id) {
                        return {
                            ...s,
                            whatsapp: data.whatsapp,
                            alreadyUnlocked: true,
                            leadsCount: s.leadsCount + 1
                        };
                    }
                    return s;
                }));

                // Open WhatsApp immediately
                window.open(`https://wa.me/55${data.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, vi seu pedido "${service.title}" no Portal.`)}`, '_blank');

            } catch (error: any) {
                alert(error.response?.data?.message || 'Erro ao liberar contato.');
            } finally {
                setUnlockingId(null);
            }
        }
    }

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'PRO_SUBCONTRACT':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase">🤝 Repasse de Obra</span>;
            case 'PRO_HELPER_JOB':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase">👷 Vaga Ajudante</span>;
            case 'CLIENT_SERVICE':
            default:
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase">🏠 Cliente Residencial</span>;
        }
    };

    const getStatusBadge = (status: string, leadsCount: number, maxLeads: number) => {
        if (status === 'LIMIT_REACHED') {
            return <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg">Esgotado</div>;
        }
        if (status === 'CLOSED_HIRED') {
            return <div className="absolute top-0 right-0 bg-gray-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg">Finalizado</div>;
        }
        // Active Status with Counter
        return (
            <div className="absolute top-0 right-0 bg-blue-50 text-blue-600 border-l border-b border-blue-100 text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                <Eye size={10} /> {leadsCount}/{maxLeads} Visto(s)
            </div>
        );
    };

    const getWhatsAppLink = (number: string | null, message: string) => {
        if (!number) return null;
        const cleanPhone = number.replace(/\D/g, '');
        return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    };

    const [optimisticAvailable, setOptimisticAvailable] = useState<boolean | null>(null);

    const isAvailable = optimisticAvailable ?? user?.isAvailableForWork ?? false;

    const toggleAvailability = async () => {
        if (!user) return;

        // Se usuário não tiver cidade cadastrada, avisar
        if (!user.city && !user.isAvailableForWork) {
            if (!confirm('Você ainda não definiu sua cidade no perfil. Deseja ficar online mesmo assim? (Recomendamos editar seu perfil para aparecer nas buscas locais)')) {
                return;
            }
        }

        const newStatus = !user.isAvailableForWork;

        // Optimistic Update
        setOptimisticAvailable(newStatus);

        try {
            await api.patch('/users/profile', { isAvailableForWork: newStatus });
            await refreshUser();

            // If we are looking at the professional list, refresh it effectively
            if (activeTab === 'PROFESSIONALS') {
                fetchProfessionals();
            }
        } catch (e) {
            alert('Erro ao atualizar disponibilidade');
            setOptimisticAvailable(null); // Revert
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
            {/* Header */}
            <header className="bg-white pt-4 pb-0 shadow-sm sticky top-0 z-20">
                <div className="px-4 mb-3 flex items-center justify-between">
                    <Link href="/" className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={24} />
                    </Link>

                    {/* Toggle de Disponibilidade (Apenas Eletricistas) */}
                    {user?.role === 'ELETRICISTA' ? (
                        <button
                            onClick={toggleAvailability}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs transition-all shadow-sm border ${isAvailable
                                ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
                            {isAvailable ? 'Estou Disponível' : 'Ficar Disponível'}
                        </button>
                    ) : (
                        <h1 className="text-lg font-bold text-gray-900">Oportunidades</h1>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-4">
                    <button
                        onClick={() => setActiveTab('BOARD')}
                        className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'BOARD'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Mural de Pedidos
                    </button>
                    <button
                        onClick={() => setActiveTab('PROFESSIONALS')}
                        className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'PROFESSIONALS'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Encontrar Profissionais
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Filtrar ${activeTab === 'BOARD' ? 'vagas' : 'profissionais'} por cidade...`}
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                className="w-full bg-white text-sm py-2 pl-9 pr-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        {activeTab === 'BOARD' && (
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-300 text-gray-600'}`}
                            >
                                <Filter size={20} />
                            </button>
                        )}
                    </div>

                    {/* Extended Filters (Price) Only for Board */}
                    {showFilters && activeTab === 'BOARD' && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 animate-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Faixa de Preço</label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">R$</span>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-full pl-8 py-1.5 text-sm rounded border border-gray-300"
                                    />
                                </div>
                                <span className="text-gray-400">-</span>
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">R$</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full pl-8 py-1.5 text-sm rounded border border-gray-300"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {activeTab === 'PROFESSIONALS' && professionals.length > 0 && (
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border-b border-blue-100">
                        + de {professionals.length + 50} eletricistas já cadastrados no portal
                    </div>
                )}
            </header>

            {/* Content */}
            <main className="flex-1 px-4 py-4 max-w-5xl mx-auto w-full space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-medium text-gray-500">Buscando oportunidades...</p>
                    </div>
                ) : activeTab === 'BOARD' ? (
                    /* --- BOARD VIEW --- */
                    services.length === 0 ? (
                        <div className="text-center mt-10 py-12 px-6 bg-white rounded-xl border border-dashed border-gray-300">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Search size={32} />
                            </div>
                            <h3 className="text-gray-900 font-bold text-lg mb-1">Nenhum pedido encontrado</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Seja o primeiro a pedir um orçamento nesta região!
                            </p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="text-blue-600 font-bold text-sm hover:underline"
                            >
                                Criar novo pedido
                            </button>
                        </div>
                    ) : (
                        services.map(service => (
                            <div key={service.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 relative hover:shadow-md transition-shadow ${service.status === 'LIMIT_REACHED' ? 'opacity-70' : ''}`}>
                                {getStatusBadge(service.status, service.leadsCount, service.maxLeads)}

                                <div className="absolute overflow-hidden top-0 left-0 w-1 bg-blue-500 h-full rounded-l-xl"></div>

                                <div className="flex justify-between items-start mb-2 pr-20 pt-1">
                                    <div className="flex gap-2 mb-1">
                                        {getTypeBadge(service.type)}
                                    </div>
                                    {user && user.id === service.userId && (
                                        <button onClick={() => handleDelete(service.id)} className="text-gray-400 hover:text-red-500 p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>


                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm shrink-0 border bg-blue-100 text-blue-600 border-blue-200">
                                        {service.user.logo_url ? (
                                            <img src={service.user.logo_url} alt={service.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 text-sm sm:text-base">
                                            {service.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            {service.user.name.split(' ')[0]}
                                            <span className="w-1 h-1 rounded-full bg-gray-300 mx-1"></span>
                                            {new Date(service.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                    {service.description}
                                </p>

                                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
                                    <div className="flex flex-col gap-1">
                                        {service.price ? (
                                            <span className="font-bold text-gray-900 text-lg">
                                                R$ {Number(service.price).toFixed(2)}
                                            </span>
                                        ) : (
                                            <span className="text-sm font-medium text-gray-400 italic">Discutir Orçamento</span>
                                        )}
                                        {service.city && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <MapPin size={10} /> {service.city}/{service.state}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    {service.userId === user?.id ? (
                                        <span className="text-xs text-gray-400 font-medium px-2 py-1 bg-gray-100 rounded">Seu Anúncio</span>
                                    ) : (
                                        service.alreadyUnlocked || service.whatsapp ? (
                                            <button
                                                onClick={() => handleUnlockContact(service)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center gap-1.5"
                                            >
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-4 h-4 brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />
                                                Chamar no WhatsApp
                                            </button>
                                        ) : service.status === 'OPEN' ? (
                                            <button
                                                onClick={() => handleUnlockContact(service)}
                                                disabled={unlockingId === service.id}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                            >
                                                {unlockingId === service.id ? (
                                                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                                ) : <Unlock size={16} />}
                                                Liberar Contato ({service.maxLeads - service.leadsCount} restam)
                                            </button>
                                        ) : (
                                            <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg font-bold text-sm cursor-not-allowed flex items-center gap-1">
                                                <Lock size={14} /> Indisponível
                                            </button>
                                        )
                                    )}

                                </div>
                            </div>
                        ))
                    )
                ) : (
                    /* --- PROFESSIONALS VIEW --- */
                    professionals.length === 0 ? (
                        <div className="text-center mt-10 py-12 px-6 bg-white rounded-xl border border-dashed border-gray-300">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                                <User size={32} />
                            </div>
                            <h3 className="text-gray-900 font-bold text-lg mb-1">Nenhum profissional disponível</h3>
                            <p className="text-sm text-gray-500 mb-0">
                                No momento, nenhum eletricista está online nesta região.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {professionals.map(prof => (
                                <div key={prof.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-3 hover:border-blue-300 transition-all">
                                    <Link href={`/perfil/${prof.id}`} className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden">
                                                {prof.logo_url ? (
                                                    <img src={prof.logo_url.startsWith('http') ? prof.logo_url : `${process.env.NEXT_PUBLIC_API_URL || ''}${prof.logo_url}`} alt={prof.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-lg">
                                                        {prof.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${prof.isAvailableForWork ? 'bg-green-500' : 'bg-gray-300'}`} title={prof.isAvailableForWork ? 'Online' : 'Inativo'}></div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{prof.name}</h3>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                {prof.cadastro_finalizado ? (
                                                    <><CheckCircle size={10} className="text-blue-500" /> Eletricista Verificado</>
                                                ) : (
                                                    <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Aguardando Ativação</span>
                                                )}
                                                {prof.commercial_index && Number(prof.commercial_index) > 0 && (
                                                    <span className="ml-2 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                                                        Rank #{Math.round(Number(prof.commercial_index))}
                                                    </span>
                                                )}
                                            </div>
                                            {prof.city && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <MapPin size={10} /> {prof.city}/{prof.state || ''}
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {prof.cadastro_finalizado && prof.phone ? (
                                        <a
                                            href={getWhatsAppLink(prof.phone, `Olá ${prof.name.split(' ')[0]}, encontrei seu perfil no Portal e gostaria de um orçamento.`)!}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-auto bg-green-600 hover:bg-green-700 text-white w-full py-2.5 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-4 h-4 brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />
                                            Chamar no WhatsApp
                                        </a>
                                    ) : (
                                        <button disabled className="mt-auto bg-gray-100 text-gray-400 w-full py-2.5 rounded-lg font-bold text-sm cursor-not-allowed">
                                            {prof.cadastro_finalizado ? 'Sem contato' : 'Aguardando ativação'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>

            {/* FAB to Create (Only on BOARD tab) */}
            {activeTab === 'BOARD' && (
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="fixed bottom-24 right-4 h-14 w-14 sm:w-auto sm:px-6 rounded-full shadow-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform z-20 font-bold text-white bg-blue-600 shadow-blue-600/30"
                >
                    <Plus size={24} />
                    <span className="hidden sm:inline">Pedir</span>
                </button>
            )}

            {isCreateModalOpen && (
                <CreateServiceModal
                    onClose={() => setIsCreateModalOpen(false)}
                    initialType="REQUEST"
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        fetchServices();
                    }}
                />
            )}

            <BottomNav />
        </div>
    );
}
