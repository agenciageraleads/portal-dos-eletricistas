'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, MapPin, Phone, Star, MessageCircle, Calendar, ShieldCheck, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '../../components/BottomNav';

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
    total_orders: number | null;
    view_count: number | null;
    cadastro_finalizado: boolean;
    createdAt: string;
}

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchProfile();
        }
    }, [params.id]);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get(`/users/profile/public/${params.id}`);
            setProfile(data);
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Soft Profile View (Not Found or Inactive)
    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 relative">
                        <UserIcon size={48} />
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-yellow-400 rounded-full border-4 border-white"></div>
                    </div>

                    <h2 className="text-xl font-black text-gray-800 mb-2">Perfil em Construção</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                        Este profissional ainda está preparando o perfil, mas já faz parte da nossa comunidade.
                    </p>

                    <div className="space-y-3">
                        <Link
                            href="/services"
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200"
                        >
                            Criar Pedido de Orçamento
                        </Link>
                        <button
                            onClick={() => router.back()}
                            className="block w-full bg-white border-2 border-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Voltar
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-xs text-center text-gray-400 font-medium">
                            Portal do Eletricista © {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
            {/* Cover / Header */}
            <div className="bg-blue-600 h-32 relative">
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            {/* Profile Info Card */}
            <div className="px-4 -mt-16 flex-1 max-w-2xl mx-auto w-full">
                <div className="bg-white rounded-2xl shadow-xl p-6 relative">
                    {/* Photo */}
                    <div className="absolute -top-12 left-6">
                        <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg border-4 border-white overflow-hidden">
                            {profile.logo_url ? (
                                <img
                                    src={profile.logo_url.startsWith('http') ? profile.logo_url : `${process.env.NEXT_PUBLIC_API_URL || ''}${profile.logo_url}`}
                                    alt={profile.name}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 rounded-xl">
                                    <UserIcon size={40} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="mt-12">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 leading-tight">
                                    {profile.business_name || profile.name}
                                </h1>
                                {profile.business_name && (
                                    <p className="text-sm text-gray-500 font-medium">{profile.name}</p>
                                )}
                            </div>
                            {profile.cadastro_finalizado && (
                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                                    <ShieldCheck size={12} /> Verificado
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                            {profile.city && (
                                <span className="flex items-center gap-1 font-bold">
                                    <MapPin size={16} className="text-blue-500" />
                                    {profile.city}/{profile.state}
                                </span>
                            )}
                            <span className="flex items-center gap-1 font-bold">
                                <Calendar size={16} className="text-blue-500" />
                                No Portal desde {new Date(profile.createdAt).getFullYear()}
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
                                    #{profile.commercial_index ? Math.round(Number(profile.commercial_index)) : '--'}
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
