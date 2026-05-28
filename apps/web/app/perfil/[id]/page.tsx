'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, MapPin, Phone, Star, MessageCircle, Calendar, ShieldCheck, User as UserIcon, Award, User, Sparkles, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '../../components/BottomNav';
import { useAuth } from '../../contexts/AuthContext';
import { getImageUrl } from '@/lib/utils';
import AddReviewModal from '../../components/AddReviewModal';

interface PublicProfile {
    id: string;
    name: string;
    business_name: string | null;
    city: string | null;
    state: string | null;
    bio: string | null;
    logo_url: string | null;
    phone: string | null;
    commercial_index: number | null;
    is_ambassador?: boolean;
    ambassador_rank?: number | null;
    rank?: number | null;
    total_orders: number | null;
    view_count: number | null;
    specialties?: string | null;
    specialties_public?: boolean | null;
    experience_years?: number | null;
    experience_public?: boolean | null;
    certifications?: string | null;
    certifications_public?: boolean | null;
    cadastro_finalizado: boolean;
    createdAt: string;
}

interface ReviewItem {
    id: string;
    rating: number;
    comment: string;
    isAnonymous: boolean;
    authorName: string | null;
    createdAt: string;
    author?: {
        name: string;
        logo_url: string | null;
    } | null;
}

interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}

interface PortfolioPost {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
    createdAt: string;
}

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Novos Estados
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [stats, setStats] = useState<ReviewStats>({ averageRating: 0, totalReviews: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
    const [portfolio, setPortfolio] = useState<PortfolioPost[]>([]);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'PORTFOLIO' | 'REVIEWS'>('PORTFOLIO');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchProfileData();
        }
    }, [params.id, user?.role]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            // 1. Busca perfil
            const primaryEndpoint = user?.role === 'ELETRICISTA'
                ? `/users/profile/peer/${params.id}`
                : `/users/profile/public/${params.id}`;
            const { data: profileData } = await api.get(primaryEndpoint);
            setProfile(profileData);

            // 2. Busca avaliações
            const { data: reviewsData } = await api.get(`/reviews/user/${params.id}`);
            setReviews(reviewsData.reviews || []);
            setStats(reviewsData.stats || { averageRating: 0, totalReviews: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });

            // 3. Busca fotos do portfólio
            const { data: portfolioData } = await api.get(`/posts/user/${params.id}`);
            setPortfolio(portfolioData || []);

        } catch (error) {
            console.error('Erro ao buscar dados do perfil:', error);
            // Fallback público básico
            try {
                const { data: profileData } = await api.get(`/users/profile/public/${params.id}`);
                setProfile(profileData);
            } catch (fallbackError) {
                console.error('Falha crítica ao buscar perfil:', fallbackError);
                setProfile(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const getWhatsAppLink = (number: string | null, name: string) => {
        if (!number) return null;
        const cleanPhone = number.replace(/\D/g, '');
        const message = `Olá ${name.split(' ')[0]}, vi seu perfil no PortalElétricos e gostaria de um orçamento.`;
        return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase tracking-[0.2em] font-bold text-[10px] text-gray-400">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent"></div>
                    Carregando Perfil Premium
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-600 to-teal-400"></div>

                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 relative">
                        <UserIcon size={48} />
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-yellow-400 rounded-full border-4 border-white shadow-sm"></div>
                    </div>

                    <h2 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">Perfil em Obras</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                        Este profissional ainda está preparando o perfil, mas já faz parte da nossa comunidade.
                    </p>

                    <div className="space-y-3">
                        <Link
                            href="/"
                            className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-teal-900/10 active:scale-95"
                        >
                            Ver Mural de Pedidos
                        </Link>
                        <button
                            onClick={() => router.back()}
                            className="block w-full bg-gray-50 text-gray-400 font-bold py-4 rounded-xl hover:bg-gray-100 transition-all active:scale-95"
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const canViewPrivate = user?.role === 'ELETRICISTA';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
            
            {/* Cover Banner */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-800 h-44 relative overflow-hidden shadow-md">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all active:scale-90 z-10 border border-white/15"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            {/* Profile Content Card */}
            <div className="px-4 -mt-16 flex-1 max-w-2xl mx-auto w-full">
                <div className="bg-white rounded-3xl shadow-xl p-6 relative border border-white/50 backdrop-blur-xl">
                    
                    {/* Photo */}
                    <div className="absolute -top-16 left-6">
                        <div className="w-28 h-28 rounded-2xl bg-white p-1 shadow-xl border-4 border-white overflow-hidden transition-transform hover:scale-105">
                            {profile.logo_url ? (
                                <img
                                    src={getImageUrl(profile.logo_url) || undefined}
                                    alt={profile.name}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <div className="w-full h-full bg-teal-50 flex items-center justify-center text-teal-600 rounded-xl font-black text-4xl">
                                    {profile.name.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic Name and Stats */}
                    <div className="mt-14">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                            <div className="flex-1 min-w-[200px]">
                                <h1 className="text-2xl font-black text-gray-900 leading-tight tracking-tight">
                                    {profile.business_name || profile.name}
                                </h1>
                                {profile.business_name && (
                                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-1">{profile.name}</p>
                                )}

                                {/* Nota de Estrelas Estilo Google */}
                                <div className="flex items-center gap-1 mt-2.5">
                                    <div className="flex text-amber-500">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star 
                                                key={s} 
                                                size={15} 
                                                className={s <= Math.round(stats.averageRating) ? "fill-amber-500 text-amber-500" : "text-gray-200"} 
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs font-black text-slate-800 ml-1">{stats.averageRating || '0.0'}</span>
                                    <span className="text-[10px] text-gray-400 font-semibold">({stats.totalReviews} {stats.totalReviews === 1 ? 'avaliação' : 'avaliações'})</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                {profile.is_ambassador && (
                                    <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-amber-200">
                                        Embaixador
                                    </div>
                                )}
                                {profile.cadastro_finalizado && (
                                    <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 border border-emerald-200">
                                        <ShieldCheck size={11} /> Verificado
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-5 text-xs text-gray-500 border-t border-b border-gray-50 py-3">
                            {profile.city && (
                                <span className="flex items-center gap-1 font-bold text-gray-600">
                                    <MapPin size={14} className="text-teal-600" />
                                    {profile.city}/{profile.state}
                                </span>
                            )}
                            <span className="flex items-center gap-1 font-bold text-gray-600">
                                <Calendar size={14} className="text-teal-600" />
                                Membro desde {new Date(profile.createdAt).getFullYear()}
                            </span>
                        </div>
                    </div>

                    {/* Quick Stats Banner */}
                    <div className="grid grid-cols-3 gap-2 mt-4 bg-gray-50 border border-gray-100 p-3 rounded-2xl">
                        <div className="text-center">
                            <p className="text-[9px] uppercase font-black text-gray-400 tracking-wider">Obras</p>
                            <p className="text-base font-black text-slate-800">{profile.total_orders || 0}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] uppercase font-black text-gray-400 tracking-wider">Visitas</p>
                            <p className="text-base font-black text-slate-800">{profile.view_count || 0}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] uppercase font-black text-gray-400 tracking-wider">Rank Geral</p>
                            <div className="flex items-center justify-center gap-0.5">
                                <Trophy size={12} className="text-amber-500" />
                                <p className="text-base font-black text-slate-800">
                                    #{profile.rank || '--'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bio / About */}
                    <div className="mt-6">
                        <h3 className="text-xs uppercase font-black text-gray-400 tracking-widest mb-1.5">Sobre o Profissional</h3>
                        <p className="text-gray-600 leading-relaxed text-sm italic bg-gray-50/50 p-3.5 rounded-2xl border border-gray-50/50">
                            "{profile.bio || 'Este profissional ainda não preencheu sua descrição, mas você pode entrar em contato para saber mais sobre seus serviços!'}"
                        </p>
                    </div>

                    {/* Specialties & Badges */}
                    <div className="mt-4 space-y-2 text-xs">
                        {(profile.specialties && (profile.specialties_public || canViewPrivate)) && (
                            <div>
                                <span className="font-extrabold text-gray-400 block mb-0.5">Especialidades:</span>
                                <p className="text-slate-800 font-bold">{profile.specialties}</p>
                            </div>
                        )}
                        {(profile.experience_years !== null && profile.experience_years !== undefined && (profile.experience_public || canViewPrivate)) && (
                            <div>
                                <span className="font-extrabold text-gray-400 block mb-0.5">Experiência:</span>
                                <p className="text-slate-800 font-bold">{profile.experience_years} anos de atuação</p>
                            </div>
                        )}
                        {(profile.certifications && (profile.certifications_public || canViewPrivate)) && (
                            <div>
                                <span className="font-extrabold text-gray-400 block mb-0.5">Certificações:</span>
                                <p className="text-slate-800 font-bold">{profile.certifications}</p>
                            </div>
                        )}
                    </div>

                    {/* ---------------- TABS INTERATIVAS: PORTFÓLIO E AVALIAÇÕES ---------------- */}
                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <div className="flex border-b border-gray-100 p-1 bg-gray-50 rounded-2xl mb-4">
                            <button
                                onClick={() => setActiveTab('PORTFOLIO')}
                                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                                    activeTab === 'PORTFOLIO'
                                        ? 'bg-white text-teal-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                Portfólio ({portfolio.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('REVIEWS')}
                                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                                    activeTab === 'REVIEWS'
                                        ? 'bg-white text-teal-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                Avaliações ({reviews.length})
                            </button>
                        </div>

                        {/* RENDER ABA 1: PORTFÓLIO DE FOTOS */}
                        {activeTab === 'PORTFOLIO' && (
                            portfolio.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sem fotos no portfólio</p>
                                    <p className="text-[10px] text-gray-400 mt-1 leading-normal">Este eletricista ainda não postou nenhuma foto de obra.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {portfolio.map((post) => (
                                        <div 
                                            key={post.id}
                                            onClick={() => setSelectedImage(getImageUrl(post.imageUrl))}
                                            className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 border border-gray-100 transition-opacity"
                                            title={post.title}
                                        >
                                            <img
                                                src={getImageUrl(post.imageUrl) || undefined}
                                                alt={post.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {/* RENDER ABA 2: AVALIAÇÕES ESTILO GOOGLE MEU NEGÓCIO */}
                        {activeTab === 'REVIEWS' && (
                            <div className="space-y-6">
                                {/* Resumo de Avaliação */}
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
                                    <div className="text-center shrink-0 pr-4 border-r border-gray-200">
                                        <p className="text-4xl font-black text-slate-800">{stats.averageRating}</p>
                                        <div className="flex text-amber-500 justify-center mt-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star 
                                                    key={s} 
                                                    size={11} 
                                                    className={s <= Math.round(stats.averageRating) ? "fill-amber-500 text-amber-500" : "text-gray-200"} 
                                                />
                                            ))}
                                        </div>
                                        <p className="text-[9px] text-gray-400 font-extrabold uppercase mt-1">Nota Geral</p>
                                    </div>

                                    {/* Barras de Contagem */}
                                    <div className="flex-1 flex flex-col gap-1 text-[10px] font-bold text-gray-500">
                                        {[5, 4, 3, 2, 1].map((s) => {
                                            const count = stats.ratingDistribution[s as 1 | 2 | 3 | 4 | 5] || 0;
                                            const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                                            return (
                                                <div key={s} className="flex items-center gap-2">
                                                    <span className="w-2">{s}</span>
                                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }}></div>
                                                    </div>
                                                    <span className="w-4 text-right text-gray-400">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Botão para Avaliar */}
                                <button
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                                >
                                    <Sparkles size={14} className="fill-slate-950" />
                                    Avaliar Colega Eletricista
                                </button>

                                {/* Lista de Comentários */}
                                {reviews.length === 0 ? (
                                    <div className="text-center py-6 text-gray-400 text-xs font-bold bg-gray-50/50 rounded-2xl border border-gray-100 uppercase tracking-wider">
                                        Nenhuma avaliação registrada ainda
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {reviews.map((rev) => (
                                            <div 
                                                key={rev.id} 
                                                className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all ${
                                                    !rev.isAnonymous 
                                                        ? 'bg-amber-50/20 border-amber-200/50 shadow-sm' 
                                                        : 'bg-white border-gray-100'
                                                }`}
                                            >
                                                {/* Comentário Header */}
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className={`w-8 h-8 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 border ${!rev.isAnonymous ? 'border-amber-300' : 'border-gray-200'}`}>
                                                            {(!rev.isAnonymous && rev.author?.logo_url) ? (
                                                                <img src={getImageUrl(rev.author.logo_url) || undefined} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User size={14} className={!rev.isAnonymous ? "text-amber-600" : "text-gray-400"} />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1 flex-wrap">
                                                                <span className="font-extrabold text-xs text-slate-800 truncate">
                                                                    {rev.authorName || 'Anônimo'}
                                                                </span>
                                                                {!rev.isAnonymous && (
                                                                    <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider scale-90 border border-emerald-200">Identificado</span>
                                                                )}
                                                            </div>
                                                            <span className="text-[9px] font-bold text-gray-400 mt-0.5 block">{new Date(rev.createdAt).toLocaleDateString('pt-BR')}</span>
                                                        </div>
                                                    </div>

                                                    {/* Estrelas */}
                                                    <div className="flex text-amber-500 shrink-0">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star 
                                                                key={s} 
                                                                size={10} 
                                                                className={s <= rev.rating ? "fill-amber-500 text-amber-500" : "text-gray-200"} 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <p className="text-xs text-gray-600 leading-relaxed font-medium bg-gray-50/20 p-2 rounded-xl">
                                                    "{rev.comment}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* WhatsApp Action */}
                    <div className="mt-8 border-t border-gray-100 pt-6 space-y-3">
                        {profile.phone && (
                            <a
                                href={getWhatsAppLink(profile.phone, profile.name)!}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all transform active:scale-95 border border-emerald-600"
                            >
                                <MessageCircle size={20} />
                                Chamar no WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Modais flutuantes */}
            {isReviewModalOpen && (
                <AddReviewModal
                    targetUserId={profile.id}
                    targetUserName={profile.name}
                    onClose={() => setIsReviewModalOpen(false)}
                    onSuccess={() => {
                        setIsReviewModalOpen(false);
                        fetchProfileData();
                        alert('Avaliação publicada com sucesso! Obrigado por colaborar.');
                    }}
                />
            )}

            {/* Visualizador de Imagem ampliada */}
            {selectedImage && (
                <div 
                    onClick={() => setSelectedImage(null)}
                    className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
                >
                    <img 
                        src={selectedImage} 
                        alt="Trabalho Realizado" 
                        className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/10" 
                    />
                </div>
            )}

            <BottomNav />
        </div>
    );
}
