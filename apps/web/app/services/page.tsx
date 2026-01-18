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

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const { data } = await api.get('/services');
            setServices(data);
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
        // Prefer specific whatsapp, otherwise user phone (not available in listing relation yet, so relying on specific first)
        // If not available, we can't link. 
        // For V1 we assume user inputs whatsapp in modal or we might need to expose user phone in listing.service.ts

        const phone = service.whatsapp || '';
        if (!phone) return null;

        const cleanPhone = phone.replace(/\D/g, '');
        const message = `Olá ${service.user.name.split(' ')[0]}, vi seu anúncio "${service.title}" no Portal do Eletricista e tenho interesse.`;
        return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
            {/* Header */}
            <header className="bg-white py-4 px-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
                <Link href="/" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-xl font-bold text-gray-800">Mural de Vagas</h1>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            {/* Content */}
            <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-4">
                {isLoading ? (
                    <p className="text-center text-gray-500 mt-10">Carregando vagas...</p>
                ) : services.length === 0 ? (
                    <div className="text-center mt-10">
                        <p className="text-gray-500 mb-4">Nenhuma vaga encontrada.</p>
                        <p className="text-sm text-gray-400">Seja o primeiro a publicar!</p>
                    </div>
                ) : (
                    services.map(service => (
                        <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative">
                            {/* Delete Button (Owner) */}
                            {user && user.id === service.userId && (
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}

                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden ${service.type === 'OFFER' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {service.user.logo_url ? (
                                        <img src={service.user.logo_url} alt={service.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={20} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-800 leading-tight">{service.title}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${service.type === 'OFFER'
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                                            }`}>
                                            {service.type === 'OFFER' ? 'Profissional' : 'Vaga'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">Postado por {service.user.name.split(' ')[0]}</p>
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-4">
                                {service.description}
                            </p>

                            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg">
                                {service.price && (
                                    <span className="font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                                        R$ {Number(service.price).toFixed(2)}
                                    </span>
                                )}
                                {service.city && (
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} /> {service.city}/{service.state}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} /> {new Date(service.date).toLocaleDateString()}
                                </span>
                            </div>

                            {getWhatsAppLink(service) ? (
                                <a
                                    href={getWhatsAppLink(service)!}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block w-full text-center py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold font-sm transition-colors shadow-lg shadow-green-100"
                                >
                                    Tenho Interesse (WhatsApp)
                                </a>
                            ) : (
                                <button disabled className="block w-full text-center py-2 bg-gray-200 text-gray-500 rounded-lg font-bold font-sm">
                                    Sem contato
                                </button>
                            )}
                        </div>
                    ))
                )}
            </main>

            {/* FAB to Create */}
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="fixed bottom-24 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform z-20"
            >
                <Plus size={28} />
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
