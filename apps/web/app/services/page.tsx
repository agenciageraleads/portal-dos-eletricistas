'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Updated import path
import api from '@/lib/api';
import BottomNav from '../components/BottomNav'; // Updated import path
import { Plus, MapPin, Calendar, User, Trash2, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
import Link from 'next/link';

// Component for creating service will be in same file for simplicity or imported
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
    type: 'REQUEST' | 'OFFER';
    userId: string;
    user: {
        name: string;
        logo_url: string | null;
    };
    createdAt: string;
}

export default function ServicesPage() {
    const { user } = useAuth();
    const [services, setServices] = useState<ServiceListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // 'CLIENT' = Quero Contratar (Show Offers/Profissionais)
    // 'PROFESSIONAL' = Quero Trabalhar (Show Requests/Clientes)
    const [viewMode, setViewMode] = useState<'CLIENT' | 'PROFESSIONAL'>('CLIENT');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const { data } = await api.get('/services');
            setServices(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error('Error fetching services', error);
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

    const getWhatsAppLink = (service: ServiceListing) => {
        const phone = service.whatsapp || '';
        if (!phone) return null;

        const cleanPhone = phone.replace(/\D/g, '');
        const message = `Olá ${service.user.name.split(' ')[0]}, vi seu anúncio "${service.title}" no Portal do Eletricista e tenho interesse.`;
        return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    };

    // Filter logic
    // If Client Mode -> Show OFFER (Profissionais se oferecendo)
    // If Professional Mode -> Show REQUEST (Clientes pedindo serviço)
    const filteredServices = services.filter(s => {
        if (viewMode === 'CLIENT') return s.type === 'OFFER';
        return s.type === 'REQUEST';
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
            {/* Header */}
            <header className="bg-white px-4 pt-4 pb-2 shadow-sm sticky top-0 z-10 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                    <Link href="/" className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Central de Oportunidades</h1>
                    <div className="w-10"></div>
                </div>

                {/* Mode Toggles - Semantic Switch */}
                <div className="flex items-center justify-center mb-4">
                    <div className="bg-gray-200 p-1 rounded-full flex relative w-full max-w-xs shadow-inner">
                        <div
                            className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out transform ${viewMode === 'CLIENT' ? 'translate-x-0' : 'translate-x-full'}`}
                        ></div>
                        <button
                            onClick={() => setViewMode('CLIENT')}
                            className={`flex-1 py-1 px-1 rounded-full text-xs sm:text-sm font-bold z-10 transition-colors relative leading-none flex flex-col items-center justify-center ${viewMode === 'CLIENT' ? 'text-blue-700' : 'text-gray-500'}`}
                        >
                            <span className="block">Contratar</span>
                            <span className="text-[9px] font-normal opacity-75">Profissionais</span>
                        </button>
                        <button
                            onClick={() => setViewMode('PROFESSIONAL')}
                            className={`flex-1 py-1 px-1 rounded-full text-xs sm:text-sm font-bold z-10 transition-colors relative leading-none flex flex-col items-center justify-center ${viewMode === 'PROFESSIONAL' ? 'text-green-700' : 'text-gray-500'}`}
                        >
                            <span className="block">Trabalhar</span>
                            <span className="text-[9px] font-normal opacity-75">Pegar Serviços</span>
                        </button>
                    </div>
                </div>

                <div className={`p-3 rounded-lg text-sm mb-2 transition-colors ${viewMode === 'CLIENT' ? 'bg-blue-50 text-blue-800' : 'bg-green-50 text-green-800'}`}>
                    <p className="font-medium text-center text-xs sm:text-sm">
                        {viewMode === 'CLIENT'
                            ? '📢 Veja profissionais disponíveis ou publique um pedido.'
                            : '⚡ Encontre serviços solicitados e ofereça sua mão de obra.'}
                    </p>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-4 py-4 max-w-md mx-auto w-full space-y-4">
                {isLoading ? (
                    <p className="text-center text-gray-600 mt-10 font-medium">Carregando oportunidades...</p>
                ) : filteredServices.length === 0 ? (
                    <div className="text-center mt-10 py-10 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-800 font-medium mb-1">Nada encontrado por enquanto.</p>
                        <p className="text-sm text-gray-600 mb-4 px-6">
                            {viewMode === 'CLIENT'
                                ? 'Nenhum profissional divulgou serviços recentemente.'
                                : 'Nenhum cliente solicitou serviços na sua região.'}
                        </p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className={`font-bold hover:underline text-sm ${viewMode === 'CLIENT' ? 'text-blue-600' : 'text-green-600'}`}
                        >
                            {viewMode === 'CLIENT' ? 'Seja o primeiro a divulgar' : 'Divulgar minha disponibilidade'}
                        </button>
                    </div>
                ) : (
                    filteredServices.map(service => (
                        <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 relative hover:shadow-md transition-shadow">
                            {/* Delete Button (Owner) */}
                            {user && user.id === service.userId && (
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-2"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}

                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm shrink-0 ${service.type === 'OFFER' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                    }`}>
                                    {service.user.logo_url ? (
                                        <img src={service.user.logo_url} alt={service.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={24} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 leading-tight truncate pr-6">{service.title}</h3>
                                    <p className="text-xs text-gray-600 font-medium mt-0.5">
                                        {service.type === 'OFFER' ? 'Profissional: ' : 'Cliente: '}
                                        {service.user.name.split(' ')[0]}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    {service.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-4">
                                {service.price && (
                                    <span className="font-bold text-green-800 bg-green-100 px-2 py-1 rounded border border-green-200">
                                        R$ {Number(service.price).toFixed(2)}
                                    </span>
                                )}
                                {service.city && (
                                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200 font-medium">
                                        <MapPin size={12} className="text-gray-400" /> {service.city}/{service.state}
                                    </span>
                                )}
                                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200 font-medium">
                                    <Calendar size={12} className="text-gray-400" /> {new Date(service.date).toLocaleDateString()}
                                </span>
                            </div>

                            {getWhatsAppLink(service) ? (
                                <a
                                    href={getWhatsAppLink(service)!}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${viewMode === 'CLIENT'
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
                                        : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200'
                                        }`}
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-5 h-5 invert-0 brightness-0 grayscale-0 filter hue-rotate-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />
                                    {viewMode === 'CLIENT' ? 'Chamar Profissional' : 'Aceitar Serviço'}
                                </a>
                            ) : (
                                <button disabled className="block w-full text-center py-3 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm cursor-not-allowed">
                                    Contato indisponível
                                </button>
                            )}
                        </div>
                    ))
                )}
            </main>

            {/* FAB to Create */}
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className={`fixed bottom-24 right-4 h-14 px-6 rounded-full shadow-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform z-20 font-bold text-white shadow-lg ${viewMode === 'CLIENT' ? 'bg-blue-600 shadow-blue-500/30' : 'bg-green-600 shadow-green-500/30'
                    }`}
            >
                <Plus size={24} />
                <span>{viewMode === 'CLIENT' ? 'Publicar Pedido' : 'Anunciar Serviço'}</span>
            </button>

            {isCreateModalOpen && (
                <CreateServiceModal
                    onClose={() => setIsCreateModalOpen(false)}
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
