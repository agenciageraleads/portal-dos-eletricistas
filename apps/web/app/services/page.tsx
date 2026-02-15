'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '@/lib/api';
import BottomNav from '../components/BottomNav';
import { Plus, MapPin, Calendar, User, Trash2, ArrowLeft, Filter, Search, CheckCircle, Eye, Lock, Unlock } from 'lucide-react';
import Link from 'next/link';
import CreateServiceModal from '../components/CreateServiceModal';
import { getImageUrl } from '@/lib/utils';

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
    installation_type?: string | null;
    needs_infra?: boolean | null;
    contract_type?: string | null;
    urgency?: string | null;
    userId: string;
    status: 'OPEN' | 'FILLED' | 'CANCELLED' | 'LIMIT_REACHED' | 'CLOSED_HIRED' | 'EXPIRED';
    maxLeads: number;
    leadsCount: number;
    alreadyUnlocked?: boolean;
    images?: string[] | null;
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
    is_ambassador?: boolean;
    ambassador_rank?: number | null;
    rank?: number | null;
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
    const [selectedService, setSelectedService] = useState<ServiceListing | null>(null);

    // Filters
    const [cityFilter, setCityFilter] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');
    const [installationTypeFilter, setInstallationTypeFilter] = useState('');
    const [needsInfraFilter, setNeedsInfraFilter] = useState('');
    const [contractTypeFilter, setContractTypeFilter] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('');
    const [professionalNameFilter, setProfessionalNameFilter] = useState('');

    useEffect(() => {
        if (activeTab === 'BOARD') {
            fetchServices();
        } else {
            fetchProfessionals();
        }
    }, [activeTab, cityFilter, minPrice, maxPrice, searchFilter, installationTypeFilter, needsInfraFilter, contractTypeFilter, urgencyFilter, professionalNameFilter]);

    useEffect(() => {
        if (activeTab === 'PROFESSIONALS') {
            setShowFilters(false);
            setCityFilter('');
        }
    }, [activeTab]);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            // params.append('type', 'REQUEST'); // Filter Only Requests
            if (cityFilter) params.append('city', cityFilter);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (searchFilter) params.append('search', searchFilter);
            if (installationTypeFilter) params.append('installationType', installationTypeFilter);
            if (needsInfraFilter) params.append('needsInfra', needsInfraFilter);
            if (contractTypeFilter) params.append('contractType', contractTypeFilter);
            if (urgencyFilter) params.append('urgency', urgencyFilter);

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
            if (professionalNameFilter) params.append('search', professionalNameFilter);

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
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary-light text-brand-primary border border-teal-200 uppercase">🤝 Repasse de Obra</span>;
            case 'PRO_HELPER_JOB':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase">👷 Vaga Ajudante</span>;
            case 'CLIENT_SERVICE':
            default:
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase">🏠 Cliente Residencial</span>;
        }
    };

    const getServiceContextTags = (type: string) => {
        const tags: string[] = [];
        if (type === 'PRO_SUBCONTRACT' || type === 'PRO_HELPER_JOB') tags.push('Postado por Profissional');
        if (type === 'PRO_HELPER_JOB') tags.push('Vaga');
        if (type === 'PRO_SUBCONTRACT') tags.push('Parceria');
        if (type === 'CLIENT_SERVICE') tags.push('Pedido de Cliente');
        return tags;
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
                            ? 'border-brand-primary text-brand-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Mural de Pedidos
                    </button>
                    <button
                        onClick={() => setActiveTab('PROFESSIONALS')}
                        className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'PROFESSIONALS'
                            ? 'border-brand-primary text-brand-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Encontrar Profissionais
                    </button>
                </div>

                {/* Filter Bar */}
                {activeTab === 'BOARD' && (
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Filtrar por cidade"
                                    value={cityFilter}
                                    onChange={(e) => setCityFilter(e.target.value)}
                                    className="w-full bg-white text-sm py-2.5 pl-9 pr-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-brand-primary-light focus:border-brand-primary transition-all"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2.5 rounded-xl border transition-all ${showFilters ? 'bg-brand-primary-light border-brand-primary text-brand-primary shadow-inner' : 'bg-white border-gray-300 text-gray-600'}`}
                            >
                                <Filter size={20} />
                            </button>
                        </div>

                        {/* Extended Filters */}
                        {showFilters && (
                            <div className="mt-3 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 animate-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Busca</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Quadro elétrico"
                                            value={searchFilter}
                                            onChange={(e) => setSearchFilter(e.target.value)}
                                            className="w-full py-2 px-3 text-sm rounded-lg border border-gray-200 outline-none focus:border-brand-primary"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Instalação</label>
                                            <select
                                                value={installationTypeFilter}
                                                onChange={(e) => setInstallationTypeFilter(e.target.value)}
                                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-200 bg-white outline-none focus:border-brand-primary"
                                            >
                                                <option value="">Todos</option>
                                                <option value="RESIDENCIAL">Residencial</option>
                                                <option value="COMERCIAL">Comercial</option>
                                                <option value="INDUSTRIAL">Industrial</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Infra</label>
                                            <select
                                                value={needsInfraFilter}
                                                onChange={(e) => setNeedsInfraFilter(e.target.value)}
                                                className="w-full py-2 px-3 text-sm rounded-lg border border-gray-200 bg-white outline-none focus:border-brand-primary"
                                            >
                                                <option value="">Todos</option>
                                                <option value="true">Sim</option>
                                                <option value="false">Não</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Contrato</label>
                                        <select
                                            value={contractTypeFilter}
                                            onChange={(e) => setContractTypeFilter(e.target.value)}
                                            className="w-full py-2 px-3 text-sm rounded-lg border border-gray-200 bg-white outline-none focus:border-brand-primary"
                                        >
                                            <option value="">Todos</option>
                                            <option value="DIARIA">Diária</option>
                                            <option value="EMPREITADA">Empreitada</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Urgência</label>
                                        <select
                                            value={urgencyFilter}
                                            onChange={(e) => setUrgencyFilter(e.target.value)}
                                            className="w-full py-2 px-3 text-sm rounded-lg border border-gray-200 bg-white outline-none focus:border-brand-primary"
                                        >
                                            <option value="">Todas</option>
                                            <option value="IMEDIATO">Imediato</option>
                                            <option value="ATE_7_DIAS">Até 7 dias</option>
                                            <option value="ATE_15_DIAS">Até 15 dias</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'PROFESSIONALS' && (
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar profissional por nome ou cidade"
                                value={professionalNameFilter}
                                onChange={(e) => setProfessionalNameFilter(e.target.value)}
                                className="w-full bg-white text-sm py-2.5 pl-9 pr-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-brand-primary-light focus:border-brand-primary transition-all"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'PROFESSIONALS' && professionals.length > 0 && (
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest border-b border-emerald-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        + {professionals.length + 10}84 profissionais verificados prontos para atender
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
                        services.map(service => {
                            const remaining = Math.max(service.maxLeads - service.leadsCount, 0);
                            const urgent = remaining <= 1;
                            const contextTags = getServiceContextTags(service.type);
                            const detailTags: string[] = [];
                            if (service.installation_type) {
                                const label = service.installation_type === 'RESIDENCIAL'
                                    ? 'Residencial'
                                    : service.installation_type === 'COMERCIAL'
                                        ? 'Comercial'
                                        : service.installation_type === 'INDUSTRIAL'
                                            ? 'Industrial'
                                            : service.installation_type;
                                detailTags.push(label);
                            }
                            if (service.contract_type) {
                                detailTags.push(service.contract_type === 'DIARIA' ? 'Diária' : 'Empreitada');
                            }
                            if (service.needs_infra !== null && service.needs_infra !== undefined) {
                                detailTags.push(service.needs_infra ? 'Com infra' : 'Sem infra');
                            }
                            if (service.urgency) {
                                const urgencyLabel = service.urgency === 'IMEDIATO'
                                    ? 'Urgente'
                                    : service.urgency === 'ATE_7_DIAS'
                                        ? 'Até 7 dias'
                                        : service.urgency === 'ATE_15_DIAS'
                                            ? 'Até 15 dias'
                                            : 'Sem urgência';
                                detailTags.push(urgencyLabel);
                            }
                            return (
                                <div key={service.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden hover:shadow-md transition-shadow ${service.status === 'LIMIT_REACHED' ? 'opacity-70' : ''}`}>
                                    {getStatusBadge(service.status, service.leadsCount, service.maxLeads)}

                                    <div className={`absolute top-0 left-0 w-1 h-full ${urgent ? 'bg-red-500' : 'bg-blue-500'}`}></div>

                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-wrap gap-2">
                                            {getTypeBadge(service.type)}
                                            {contextTags.map(tag => (
                                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase">
                                                    {tag}
                                                </span>
                                            ))}
                                            {detailTags.map(tag => (
                                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {urgent && (
                                                <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border border-red-100">
                                                    Urgente
                                                </span>
                                            )}
                                            {user && (user.id === service.userId || user.role === 'ADMIN') && (
                                                <button onClick={() => handleDelete(service.id)} className="text-gray-400 hover:text-red-500 p-1" title="Excluir anúncio">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedService(service)}
                                        className="flex items-start gap-3 mb-3 text-left w-full"
                                        type="button"
                                    >
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm shrink-0 border bg-blue-100 text-blue-600 border-blue-200">
                                            {service.user.logo_url ? (
                                                <img src={getImageUrl(service.user.logo_url) || undefined} alt={service.user.name} className="w-full h-full object-cover" />
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
                                                {service.city && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300 mx-1"></span>
                                                        {service.city}/{service.state}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </button>

                                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                        {service.description}
                                    </p>

                                    {service.images && service.images.length > 0 && (
                                        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                                            {service.images.slice(0, 3).map((img, idx) => (
                                                <div
                                                    key={`${service.id}-img-${idx}`}
                                                    className="w-16 h-16 rounded-lg bg-gray-200 shrink-0 bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${img})` }}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
                                        <div className="flex flex-col gap-1">
                                            {service.price ? (
                                                <span className="font-bold text-gray-900 text-lg">
                                                    R$ {Number(service.price).toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-sm font-medium text-gray-400 italic">Discutir Orçamento</span>
                                            )}
                                            <span className="text-[11px] text-gray-500">
                                                Restam {remaining}/{service.maxLeads} visualizações
                                            </span>
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
                                                    Liberar Contato
                                                </button>
                                            ) : (
                                                <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg font-bold text-sm cursor-not-allowed flex items-center gap-1">
                                                    <Lock size={14} /> Indisponível
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })
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
                            {professionals.map((prof, index) => (
                                <div
                                    key={prof.id}
                                    className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col gap-3 transition-all ${prof.is_ambassador
                                        ? 'border-yellow-400/70 hover:border-yellow-500 shadow-yellow-100'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <Link href={`/perfil/${prof.id}`} className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden">
                                                {prof.logo_url ? (
                                                    <img src={getImageUrl(prof.logo_url) || undefined} alt={prof.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-lg">
                                                        {prof.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${prof.isAvailableForWork ? 'bg-green-500' : 'bg-gray-300'}`} title={prof.isAvailableForWork ? 'Online' : 'Inativo'}></div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-gray-900">{prof.name}</h3>
                                                {prof.is_ambassador && (
                                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                                        Embaixador
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 flex-wrap">
                                                {prof.cadastro_finalizado ? (
                                                    <><CheckCircle size={10} className="text-blue-500" /> Eletricista Verificado</>
                                                ) : (
                                                    <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Aguardando Ativação</span>
                                                )}
                                                <span className="ml-2 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                                                    Rank #{prof.rank ?? index + 1}
                                                </span>
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
                    className="fixed bottom-24 right-4 h-14 w-14 sm:w-auto sm:px-6 rounded-full shadow-2xl flex items-center justify-center gap-2 hover:scale-105 transition-all z-20 font-bold text-white bg-brand-primary shadow-teal-600/40 active:scale-95"
                >
                    <Plus size={24} />
                    <span className="hidden sm:inline">Criar Pedido</span>
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

            {selectedService && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Detalhes do serviço</h3>
                            <button onClick={() => setSelectedService(null)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>
                        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {getTypeBadge(selectedService.type)}
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">{selectedService.title}</h2>
                                <p className="text-sm text-gray-500">
                                    {selectedService.user.name.split(' ')[0]} · {new Date(selectedService.createdAt).toLocaleDateString()}
                                    {selectedService.city && ` · ${selectedService.city}/${selectedService.state || ''}`}
                                </p>
                            </div>
                            <div className="text-sm text-gray-700 whitespace-pre-line">
                                {selectedService.description}
                            </div>
                            {selectedService.images && selectedService.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {selectedService.images.map((img, idx) => (
                                        <img
                                            key={`${selectedService.id}-detail-${idx}`}
                                            src={getImageUrl(img) || undefined}
                                            alt=""
                                            className="w-full h-24 object-cover rounded-lg border"
                                        />
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    {selectedService.price ? `R$ ${Number(selectedService.price).toFixed(2)}` : 'Valor a combinar'}
                                </div>
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
