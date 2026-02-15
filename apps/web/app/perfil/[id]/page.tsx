'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, MapPin, Phone, Star, MessageCircle, Calendar, ShieldCheck, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '../../components/BottomNav';
import { useAuth } from '../../contexts/AuthContext';
import { getImageUrl } from '@/lib/utils';

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

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchProfile();
        }
    }, [params.id, user?.role]);

    const fetchProfile = async () => {
        try {
            const primaryEndpoint = user?.role === 'ELETRICISTA'
                ? `/users/profile/peer/${params.id}`
                : `/users/profile/public/${params.id}`;
            const { data } = await api.get(primaryEndpoint);
            setProfile(data);
        } catch (error) {
            try {
                const { data } = await api.get(`/users/profile/public/${params.id}`);
                setProfile(data);
            } catch (fallbackError) {
                console.error('Erro ao buscar perfil:', fallbackError);
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
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent"></div>
                    Carregando Perfil
                </div>
            </div>
        );
    }

    // Soft Profile View (Not Found or Inactive)
    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary to-brand-accent"></div>

                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 relative">
                        <UserIcon size={48} />
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-yellow-400 rounded-full border-4 border-white shadow-sm"></div>
                    </div>

                    <h2 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">Canteiro de Obras</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                        Este profissional ainda está preparando o perfil, mas já faz parte da nossa comunidade.
                    </p>

                    <div className="space-y-3">
                        <Link
                            href="/services"
                            className="block w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-teal-900/10 active:scale-95"
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

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-[10px] text-center text-gray-300 font-bold uppercase tracking-widest">
                            Portal do Eletricista • {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const canViewPrivate = user?.role === 'ELETRICISTA';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
            {/* Cover / Header */}
            <div className="bg-brand-primary h-40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all active:scale-90 z-10"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            {/* Profile Info Card */}
            <div className="px-4 -mt-16 flex-1 max-w-2xl mx-auto w-full">
                <div className="bg-white rounded-3xl shadow-2xl p-6 relative border border-white/50 backdrop-blur-xl">
                    {/* Photo */}
                    <div className="absolute -top-16 left-6">
                        <div className="w-32 h-32 rounded-[2rem] bg-white p-1 shadow-2xl border-4 border-white overflow-hidden transition-transform hover:scale-105">
                            {profile.logo_url ? (
                                <img
                                    src={getImageUrl(profile.logo_url) || undefined}
                                    alt={profile.name}
                                    className="w-full h-full object-cover rounded-[1.5rem]"
                                />
                            ) : (
                                <div className="w-full h-full bg-brand-primary-light flex items-center justify-center text-brand-primary rounded-[1.5rem]">
                                    <UserIcon size={48} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="mt-16">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tight">
                                    {profile.business_name || profile.name}
                                </h1>
                                {profile.business_name && (
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">{profile.name}</p>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {profile.is_ambassador && (
                                    <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">
                                        Embaixador
                                    </div>
                                )}
                                {profile.cadastro_finalizado && (
                                    <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-200">
                                        <ShieldCheck size={12} /> Verificado
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-6 text-sm">
                            {profile.city && (
                                <span className="flex items-center gap-1.5 font-bold text-gray-600">
                                    <MapPin size={18} className="text-brand-primary" />
                                    {profile.city}/{profile.state}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 font-bold text-gray-600">
                                <Calendar size={18} className="text-brand-primary" />
                                Ativo desde {new Date(profile.createdAt).getFullYear()}
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-6">
                        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-center">
                            <p className="text-[9px] uppercase font-bold text-gray-400">Projetos</p>
                            <p className="text-lg font-black text-gray-800">{profile.total_orders || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-center">
                            <p className="text-[9px] uppercase font-bold text-gray-400">Visitas</p>
                            <p className="text-lg font-black text-gray-800">{profile.view_count || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-center">
                            <p className="text-[9px] uppercase font-bold text-gray-400">Rank</p>
                            <div className="flex items-center justify-center gap-0.5">
                                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                <p className="text-lg font-black text-gray-800">
                                    #{profile.rank || '--'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Sobre o Profissional</h3>
                        <p className="text-gray-600 leading-relaxed text-sm italic">
                            {profile.bio || "Este profissional ainda não preencheu sua descrição, mas você pode entrar em contato para saber mais sobre seus serviços!"}
                        </p>
                    </div>

                    {/* Professional Details */}
                    <div className="mt-6 space-y-3">
                        {(profile.specialties && (profile.specialties_public || canViewPrivate)) && (
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-400 font-bold">Especialidades</p>
                                <p className="text-sm text-gray-700 font-semibold">{profile.specialties}</p>
                            </div>
                        )}
                        {(profile.experience_years !== null && profile.experience_years !== undefined && (profile.experience_public || canViewPrivate)) && (
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-400 font-bold">Experiência</p>
                                <p className="text-sm text-gray-700 font-semibold">{profile.experience_years} anos</p>
                            </div>
                        )}
                        {(profile.certifications && (profile.certifications_public || canViewPrivate)) && (
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-400 font-bold">Certificações</p>
                                <p className="text-sm text-gray-700 font-semibold">{profile.certifications}</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-8 space-y-3">
                        {profile.phone && (
                            <a
                                href={getWhatsAppLink(profile.phone, profile.name)!}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-3 transition-all transform active:scale-95"
                            >
                                <MessageCircle size={24} />
                                Chamar no WhatsApp
                            </a>
                        )}
                        <button
                            disabled
                            className="w-full bg-gray-100 text-gray-400 py-4 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                            Ver Portfólio (Em breve)
                        </button>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
