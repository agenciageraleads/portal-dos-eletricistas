'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useInstallPrompt } from './contexts/InstallContext';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    FileText,
    ShoppingCart,
    Calculator,
    Users,
    Zap,
    MessageCircle,
    PackageSearch,
    ChevronRight,
    Trophy,
    Bell,
    Heart,
    MessageSquare,
    Share2,
    Plus,
    MapPin,
    Search,
    Filter,
    Calendar,
    Eye,
    Unlock,
    Lock,
    CheckCircle,
    Loader2,
    Sparkles
} from 'lucide-react';
import { OnboardingModal } from './components/OnboardingModal';
import JornadaModal from './components/JornadaModal';
import BottomNav from './components/BottomNav';
import UserMenu from './components/UserMenu';
import CreateServiceModal from './components/CreateServiceModal';
import CreatePostModal from './components/CreatePostModal';
import api from '@/lib/api';
import { getImageUrl, formatCurrency } from '@/lib/utils';

// Interfaces locais
interface PostComment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        name: string;
        logo_url: string | null;
    };
}

interface PostItem {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
    createdAt: string;
    likesCount: number;
    isLiked: boolean;
    user: {
        id: string;
        name: string;
        logo_url: string | null;
    };
    comments: PostComment[];
}

interface ServiceListing {
    id: string;
    title: string;
    description: string;
    price: string | null;
    city: string | null;
    state: string | null;
    date: string;
    whatsapp: string | null;
    type: string;
    installation_type?: string | null;
    needs_infra?: boolean | null;
    contract_type?: string | null;
    urgency?: string | null;
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
    is_ambassador?: boolean;
    ambassador_rank?: number | null;
    rank?: number | null;
}

export default function Home() {
    const { user, logout, refreshUser } = useAuth();
    const { triggerInstall, isIOS, isInstalled } = useInstallPrompt();

    // Abas Principais: FEED (Explorar), BOARD (Mural de Vagas), PROS (Eletricistas)
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'FEED' | 'BOARD' | 'PROS'>('FEED');

    // Efeito para sincronizar aba pela URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'BOARD') {
            setActiveTab('BOARD');
        } else if (tab === 'PROS') {
            setActiveTab('PROS');
        } else {
            setActiveTab('FEED');
        }
    }, [searchParams]);

    // Modais
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

    // Estados de Dados
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [services, setServices] = useState<ServiceListing[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Feed Interativo
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [newCommentText, setNewCommentText] = useState('');
    const [commentSubmittingId, setCommentSubmittingId] = useState<string | null>(null);
    const [likedAnimationId, setLikedAnimationId] = useState<string | null>(null);

    // Filtros
    const [cityFilter, setCityFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [installationTypeFilter, setInstallationTypeFilter] = useState('');
    const [needsInfraFilter, setNeedsInfraFilter] = useState('');
    const [contractTypeFilter, setContractTypeFilter] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('');
    const [unlockingServiceId, setUnlockingServiceId] = useState<string | null>(null);

    // Disponibilidade do Usuário logado
    const [optimisticAvailable, setOptimisticAvailable] = useState<boolean | null>(null);
    const isAvailable = optimisticAvailable ?? user?.isAvailableForWork ?? false;

    // Sincronização de Abas e Busca
    useEffect(() => {
        fetchData();
    }, [activeTab, cityFilter, searchFilter, installationTypeFilter, needsInfraFilter, contractTypeFilter, urgencyFilter]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'FEED') {
                const { data } = await api.get('/posts');
                setPosts(data);
            } else if (activeTab === 'BOARD') {
                const params = new URLSearchParams();
                if (cityFilter) params.append('city', cityFilter);
                if (searchFilter) params.append('search', searchFilter);
                if (installationTypeFilter) params.append('installationType', installationTypeFilter);
                if (needsInfraFilter) params.append('needsInfra', needsInfraFilter);
                if (contractTypeFilter) params.append('contractType', contractTypeFilter);
                if (urgencyFilter) params.append('urgency', urgencyFilter);

                const { data } = await api.get(`/services?${params.toString()}`);
                setServices(data);
            } else if (activeTab === 'PROS') {
                const params = new URLSearchParams();
                if (cityFilter) params.append('city', cityFilter);
                if (searchFilter) params.append('search', searchFilter);

                const { data } = await api.get(`/users/available?${params.toString()}`);
                setProfessionals(data);
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Curtir Postagem
    const handleLikePost = async (postId: string) => {
        if (!user) {
            alert('Faça login para curtir o portfólio!');
            return;
        }

        // Feedback visual
        setLikedAnimationId(postId);
        setTimeout(() => setLikedAnimationId(null), 600);

        // Otimista
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    isLiked: !p.isLiked,
                    likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1
                };
            }
            return p;
        }));

        try {
            await api.post(`/posts/${postId}/like`);
        } catch (err) {
            console.error('Erro ao curtir post:', err);
            // Reverte em caso de erro
            fetchData();
        }
    };

    // Comentar Postagem
    const handleAddComment = async (postId: string) => {
        if (!user) {
            alert('Faça login para comentar!');
            return;
        }
        if (!newCommentText.trim()) return;

        setCommentSubmittingId(postId);
        try {
            const { data } = await api.post(`/posts/${postId}/comment`, { content: newCommentText.trim() });
            
            // Adiciona na UI local
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    return {
                        ...p,
                        comments: [...p.comments, data]
                    };
                }
                return p;
            }));
            setNewCommentText('');
        } catch (err) {
            console.error('Erro ao adicionar comentário:', err);
            alert('Erro ao enviar comentário.');
        } finally {
            setCommentSubmittingId(null);
        }
    };

    // Mudar Disponibilidade do Eletricista
    const toggleAvailability = async () => {
        if (!user) return;
        if (!user.city && !user.isAvailableForWork) {
            if (!confirm('Você ainda não definiu sua cidade no perfil. Deseja ficar online mesmo assim? (Recomendamos editar seu perfil para aparecer nas buscas)')) {
                return;
            }
        }

        const newStatus = !user.isAvailableForWork;
        setOptimisticAvailable(newStatus);

        try {
            await api.patch('/users/profile', { isAvailableForWork: newStatus });
            await refreshUser();
            if (activeTab === 'PROS') fetchData();
        } catch (e) {
            alert('Erro ao atualizar disponibilidade.');
            setOptimisticAvailable(null);
        }
    };

    // Liberar contato de vaga/serviço no Mural
    const handleUnlockContact = async (service: ServiceListing) => {
        if (!user) {
            alert('Faça login para liberar o contato.');
            return;
        }
        if (service.userId === user.id) return;

        if (service.alreadyUnlocked && service.whatsapp) {
            window.open(`https://wa.me/55${service.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, vi seu pedido "${service.title}" no Portal.`)}`, '_blank');
            return;
        }

        if (confirm(`Deseja liberar o contato deste cliente? \n(Restam ${service.maxLeads - service.leadsCount} visualizações)`)) {
            setUnlockingServiceId(service.id);
            try {
                const { data } = await api.post(`/services/${service.id}/contact`);

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

                window.open(`https://wa.me/55${data.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, vi seu pedido "${service.title}" no Portal.`)}`, '_blank');
            } catch (error: any) {
                alert(error.response?.data?.message || 'Erro ao liberar contato.');
            } finally {
                setUnlockingServiceId(null);
            }
        }
    };

    // Carrossel de Atalhos Rápidos (Mantendo ferramentas existentes)
    const quickAccess = useMemo(() => {
        const items = [
            {
                title: 'Orçamento',
                icon: <FileText size={18} className="text-teal-600" />,
                href: '/orcamento/novo'
            },
            {
                title: 'Histórico',
                icon: <ShoppingCart size={18} className="text-emerald-600" />,
                href: '/orcamentos'
            },
            {
                title: 'Catálogo',
                icon: <PackageSearch size={18} className="text-blue-600" />,
                href: '/catalogo'
            },
            {
                title: 'Calculadora',
                icon: <Calculator size={18} className="text-orange-500" />,
                href: '/ferramentas'
            }
        ];

        if (user) {
            items.push(
                {
                    title: 'Comissões',
                    icon: <Zap size={18} className="text-yellow-500" />,
                    href: '/dashboard/comissoes'
                },
                {
                    title: 'Ranking',
                    icon: <Trophy size={18} className="text-amber-500" />,
                    href: '/ranking'
                }
            );
        }

        return items;
    }, [user]);

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'PRO_SUBCONTRACT':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase">🤝 Repasse Obra</span>;
            case 'PRO_HELPER_JOB':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">👷 Vaga Ajudante</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 uppercase">🏠 Cliente</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
            
            {/* 1. TOP HEADER (Visual Premium) */}
            <header className="bg-white py-3 px-4 shadow-sm sticky top-0 z-30 border-b border-gray-100">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                            <Zap size={18} fill="currentColor" />
                        </div>
                        <span className="font-black text-lg text-gray-900 tracking-tight">
                            Portal<span className="text-blue-600">Elétricos</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notificações */}
                        <Link href="/inbox" className="relative p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </Link>

                        {/* Disponibilidade do Eletricista */}
                        {user?.role === 'ELETRICISTA' && (
                            <button
                                onClick={toggleAvailability}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] transition-all shadow-sm border ${
                                    isAvailable
                                        ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                                }`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
                                {isAvailable ? 'ONLINE' : 'OFFLINE'}
                            </button>
                        )}

                        <UserMenu user={user} logout={logout} />
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-md mx-auto w-full relative z-10 px-4 pt-4 space-y-4">
                
                {/* 2. QR CODE EVENT CHECK-IN BANNER (Grande Atração do Sábado! 🚀) */}
                <div className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-3xl p-5 border border-amber-400 shadow-xl shadow-amber-500/10 relative overflow-hidden text-slate-950">
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                    <div className="relative z-10 flex items-start gap-4">
                        <div className="p-3 bg-slate-950 text-amber-400 rounded-2xl shadow-lg shrink-0">
                            <Sparkles size={24} className="fill-amber-400" />
                        </div>
                        <div className="flex-1">
                            <span className="bg-slate-950 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-widest">Encontro Oficial</span>
                            <h3 className="text-base font-black mt-2 leading-snug">Está no Evento do Canal?</h3>
                            <p className="text-xs text-slate-900 mt-1 leading-normal">Escaneie o QR Code ou clique aqui para confirmar sua presença, responder à pesquisa rápida e ativar seu perfil!</p>
                            
                            <Link 
                                href="/evento/sabado-eletricistas-2026/checkin" 
                                className="mt-4 inline-flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 text-amber-400 px-5 py-2 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 border border-slate-800"
                            >
                                Confirmar Presença <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>



                {/* 4. REDE SOCIAL INTERATIVA: SUBDIVISÃO DISCRETA (Explorar Obras vs. Colegas Eletricistas) */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    {/* Abas discretas (Estilo pílulas sutis) apenas se não estiver na aba BOARD */}
                    {activeTab !== 'BOARD' && (
                        <div className="flex bg-gray-50/50 p-2 gap-2 justify-center border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab('FEED')}
                                className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
                                    activeTab === 'FEED'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
                                }`}
                            >
                                Explorar Obras
                            </button>
                            <button
                                onClick={() => setActiveTab('PROS')}
                                className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
                                    activeTab === 'PROS'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
                                }`}
                            >
                                Colegas Eletricistas
                            </button>
                        </div>
                    )}
                    {activeTab === 'BOARD' && (
                        <div className="bg-blue-50/50 p-3 border-b border-blue-100 flex items-center justify-between">
                            <span className="text-xs font-black text-blue-800 uppercase tracking-widest px-2">Mural de Serviços</span>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100/50 px-2.5 py-1 rounded-full">Trabalhos Disponíveis</span>
                        </div>
                    )}

                    {/* Filtros Internos por Aba */}
                    <div className="p-3 bg-gray-50/20 border-b border-gray-50 flex gap-2">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={
                                    activeTab === 'FEED' 
                                        ? "Buscar no feed..." 
                                        : activeTab === 'BOARD' 
                                            ? "Filtrar serviços por cidade..." 
                                            : "Buscar eletricistas por nome/cidade..."
                                }
                                value={activeTab === 'BOARD' ? cityFilter : searchFilter}
                                onChange={(e) => activeTab === 'BOARD' ? setCityFilter(e.target.value) : setSearchFilter(e.target.value)}
                                className="w-full bg-white text-xs py-2.5 pl-9 pr-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                        {activeTab === 'BOARD' && (
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2.5 rounded-2xl border transition-all ${
                                    showFilters 
                                        ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-inner' 
                                        : 'bg-white border-gray-200 text-gray-500'
                                }`}
                            >
                                <Filter size={16} />
                            </button>
                        )}
                    </div>

                    {/* Filtros Estendidos do Mural */}
                    {activeTab === 'BOARD' && showFilters && (
                        <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Tipo Vaga</label>
                                <select
                                    value={installationTypeFilter}
                                    onChange={(e) => setInstallationTypeFilter(e.target.value)}
                                    className="w-full p-2 bg-white border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Todos</option>
                                    <option value="RESIDENCIAL">Residencial</option>
                                    <option value="COMERCIAL">Comercial</option>
                                    <option value="INDUSTRIAL">Industrial</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Infraestrutura</label>
                                <select
                                    value={needsInfraFilter}
                                    onChange={(e) => setNeedsInfraFilter(e.target.value)}
                                    className="w-full p-2 bg-white border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Todos</option>
                                    <option value="true">Sim</option>
                                    <option value="false">Não</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* 5. LISTAS DINÂMICAS DE ABAS */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Sincronizando Rede Social...</p>
                        </div>
                    ) : activeTab === 'FEED' ? (
                        
                        /* ================ TAB 1: FEED DE PORTFÓLIO ================ */
                        posts.length === 0 ? (
                            <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 border border-gray-100">
                                    <Sparkles size={28} />
                                </div>
                                <h3 className="text-gray-900 font-black text-base mb-1">O feed está em branco!</h3>
                                <p className="text-xs text-gray-400 leading-normal mb-6">Seja o pioneiro e mostre a foto do seu QDC ou da sua instalação premium no evento!</p>
                                <button
                                    onClick={() => user ? setIsPostModalOpen(true) : alert('Faça login para cadastrar no feed!')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all active:scale-95"
                                >
                                    Publicar Meu Trabalho
                                </button>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <div key={post.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
                                    {/* Autor Header */}
                                    <div className="p-4 flex items-center justify-between">
                                        <Link href={`/perfil/${post.user.id}`} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-50 border border-gray-200">
                                                {post.user.logo_url ? (
                                                    <img src={getImageUrl(post.user.logo_url) || undefined} alt={post.user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-blue-600 text-sm bg-blue-50">
                                                        {post.user.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-sm text-slate-800 leading-none">{post.user.name.split(' ')[0]}</h4>
                                                <span className="text-[10px] font-bold text-gray-400 mt-1 block">Postou em {new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                const url = window.location.origin + `/perfil/${post.user.id}`;
                                                navigator.clipboard.writeText(url);
                                                alert('Link do portfólio copiado com sucesso!');
                                            }}
                                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                                            title="Compartilhar portfólio"
                                        >
                                            <Share2 size={16} />
                                        </button>
                                    </div>

                                    {/* Imagem do Serviço */}
                                    <div className="relative aspect-square w-full bg-gray-50 border-t border-b border-gray-50 overflow-hidden group">
                                        <img 
                                            src={getImageUrl(post.imageUrl) || undefined} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                        />
                                        {/* Curtida rápida com duplo clique visual */}
                                        <div 
                                            onDoubleClick={() => handleLikePost(post.id)}
                                            className="absolute inset-0 z-10 cursor-pointer"
                                        />
                                        {likedAnimationId === post.id && (
                                            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-ping">
                                                <Heart size={80} className="text-red-500 fill-red-500 drop-shadow" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Ações */}
                                    <div className="p-4 flex flex-col gap-3">
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => handleLikePost(post.id)}
                                                className="flex items-center gap-1.5 text-gray-600 hover:text-red-500 active:scale-90 transition-transform"
                                            >
                                                <Heart size={20} className={post.isLiked ? "text-red-500 fill-red-500" : ""} />
                                                <span className="text-xs font-bold text-slate-800">{post.likesCount} curtidas</span>
                                            </button>
                                            <button 
                                                onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                                                className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                                            >
                                                <MessageSquare size={20} />
                                                <span className="text-xs font-bold text-slate-800">{post.comments.length} comentários</span>
                                            </button>
                                        </div>

                                        {/* Título e Bio */}
                                        <div>
                                            <h3 className="font-extrabold text-sm text-slate-900 tracking-tight leading-snug">{post.title}</h3>
                                            {post.description && (
                                                <p className="text-xs text-gray-600 leading-normal mt-1 whitespace-pre-line italic">
                                                    "{post.description}"
                                                </p>
                                            )}
                                        </div>

                                        {/* Seção de Comentários */}
                                        {(activeCommentPostId === post.id || post.comments.length > 0) && (
                                            <div className="mt-2 pt-3 border-t border-gray-50 space-y-2">
                                                {post.comments.map((comm) => (
                                                    <div key={comm.id} className="text-xs flex items-start gap-2">
                                                        <span className="font-extrabold text-slate-800 shrink-0">{comm.user.name.split(' ')[0]}:</span>
                                                        <span className="text-gray-600 leading-relaxed">{comm.content}</span>
                                                    </div>
                                                ))}

                                                {/* Formulário para novo comentário */}
                                                {user && (
                                                    <div className="flex gap-2 pt-2 items-center">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Deixe um elogio ou dúvida..." 
                                                            value={activeCommentPostId === post.id ? newCommentText : ''}
                                                            onChange={(e) => {
                                                                setActiveCommentPostId(post.id);
                                                                setNewCommentText(e.target.value);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleAddComment(post.id);
                                                            }}
                                                            className="flex-1 text-xs py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white"
                                                            disabled={commentSubmittingId === post.id}
                                                        />
                                                        <button 
                                                            onClick={() => handleAddComment(post.id)}
                                                            disabled={commentSubmittingId === post.id || !newCommentText.trim()}
                                                            className="text-xs font-bold text-blue-600 px-3 hover:text-blue-700 disabled:opacity-40"
                                                        >
                                                            {commentSubmittingId === post.id ? '...' : 'Enviar'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )
                    ) : activeTab === 'BOARD' ? (
                        
                        /* ================ TAB 2: MURAL DE VAGAS ================ */
                        services.length === 0 ? (
                            <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Search size={28} />
                                </div>
                                <h3 className="text-gray-900 font-black text-base mb-1">Sem pedidos no momento</h3>
                                <p className="text-xs text-gray-400 mb-6">Todos os serviços foram atendidos! Deseja repassar um serviço para colegas?</p>
                                <button
                                    onClick={() => user ? setIsServiceModalOpen(true) : alert('Faça login para cadastrar no mural!')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl"
                                >
                                    Anunciar Serviço/Repasse
                                </button>
                            </div>
                        ) : (
                            services.map((service) => {
                                const remaining = Math.max(service.maxLeads - service.leadsCount, 0);
                                const isUrgent = remaining <= 1;

                                return (
                                    <div key={service.id} className="bg-white rounded-3xl border border-gray-100 p-5 relative overflow-hidden shadow-sm flex flex-col gap-3">
                                        
                                        {/* Status Header */}
                                        <div className="absolute top-0 right-0 bg-blue-50 text-blue-600 border-l border-b border-blue-100 text-[9px] font-black px-3 py-1 rounded-bl-2xl flex items-center gap-1">
                                            <Eye size={10} /> {service.leadsCount}/{service.maxLeads} Vistos
                                        </div>

                                        <div className="flex gap-2 items-center flex-wrap pt-2">
                                            {getTypeBadge(service.type)}
                                            {service.urgency === 'IMEDIATO' && (
                                                <span className="bg-red-50 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-red-100 animate-pulse">Urgente</span>
                                            )}
                                            {service.city && (
                                                <span className="bg-gray-100 text-gray-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-gray-200 flex items-center gap-0.5">
                                                    <MapPin size={8} /> {service.city}/{service.state || ''}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-extrabold text-sm text-slate-800 leading-snug tracking-tight mt-1">{service.title}</h3>
                                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{service.description}</p>

                                        {/* Footer do Card */}
                                        <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-1">
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 block uppercase">Orçamento</span>
                                                <span className="font-extrabold text-sm text-slate-900">
                                                    {service.price ? formatCurrency(service.price) : 'A combinar'}
                                                </span>
                                            </div>

                                            {service.userId === user?.id ? (
                                                <span className="text-[10px] text-gray-400 font-extrabold bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 uppercase tracking-wider">Seu Vaga</span>
                                            ) : (
                                                service.alreadyUnlocked || service.whatsapp ? (
                                                    <button
                                                        onClick={() => handleUnlockContact(service)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-1 active:scale-95"
                                                    >
                                                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-3.5 h-3.5 brightness-0 invert" />
                                                        WhatsApp
                                                    </button>
                                                ) : service.status === 'OPEN' ? (
                                                    <button
                                                        onClick={() => handleUnlockContact(service)}
                                                        disabled={unlockingServiceId === service.id}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-1 active:scale-95"
                                                    >
                                                        {unlockingServiceId === service.id ? (
                                                            <Loader2 size={12} className="animate-spin" />
                                                        ) : <Unlock size={12} />}
                                                        Liberar Vaga
                                                    </button>
                                                ) : (
                                                    <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded-xl font-bold text-xs cursor-not-allowed flex items-center gap-1">
                                                        <Lock size={12} /> Esgotado
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )
                    ) : (
                        
                        /* ================ TAB 3: LISTAGEM DE ELETRICISTAS ================ */
                        professionals.length === 0 ? (
                            <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Users size={28} />
                                </div>
                                <h3 className="text-gray-900 font-black text-base mb-1">Nenhum eletricista nesta região</h3>
                                <p className="text-xs text-gray-400">Seja o primeiro a se registrar como ativo e apareça na frente!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {professionals.map((prof) => (
                                    <div key={prof.id} className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex items-center justify-between gap-3 hover:border-blue-500 transition-colors">
                                        <Link href={`/perfil/${prof.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="relative shrink-0">
                                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-blue-50 border border-gray-100">
                                                    {prof.logo_url ? (
                                                        <img src={getImageUrl(prof.logo_url) || undefined} alt={prof.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center font-bold text-blue-600 text-base">
                                                            {prof.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${prof.isAvailableForWork ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <h4 className="font-extrabold text-sm text-slate-800 truncate">{prof.name}</h4>
                                                    {prof.is_ambassador && (
                                                        <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Embaixador</span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold text-blue-600 block mt-0.5">Rank #{prof.rank ?? '--'}</span>
                                                {prof.city && (
                                                    <span className="text-[10px] text-gray-400 block mt-0.5 flex items-center gap-0.5">
                                                        <MapPin size={8} /> {prof.city}/{prof.state || ''}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>

                                        <Link
                                            href={`/perfil/${prof.id}`}
                                            className="bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-500 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shrink-0 active:scale-95 border border-gray-100"
                                        >
                                            Ver Perfil
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </main>

            {/* 6. FAB FLUTUANTE CENTRAL DE POSTAGEM DE SÁBADO */}
            {user && (
                <div className="fixed bottom-24 right-4 flex flex-col gap-2 z-30">
                    <button
                        onClick={() => activeTab === 'FEED' ? setIsPostModalOpen(true) : setIsServiceModalOpen(true)}
                        className="h-14 w-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-white bg-blue-600 shadow-blue-600/30"
                        title={activeTab === 'FEED' ? 'Publicar portfólio' : 'Publicar pedido'}
                    >
                        <Plus size={24} />
                    </button>
                </div>
            )}

            {/* Modais do Sistema */}
            <OnboardingModal />
            <JornadaModal />

            {isPostModalOpen && (
                <CreatePostModal
                    onClose={() => setIsPostModalOpen(false)}
                    onSuccess={() => {
                        setIsPostModalOpen(false);
                        fetchData();
                    }}
                />
            )}

            {isServiceModalOpen && (
                <CreateServiceModal
                    onClose={() => setIsServiceModalOpen(false)}
                    initialType="PRO_SUBCONTRACT"
                    onSuccess={() => {
                        setIsServiceModalOpen(false);
                        fetchData();
                    }}
                />
            )}

            {/* 7. BOTTOM NAVIGATION */}
            <BottomNav />
        </div>
    );
}
