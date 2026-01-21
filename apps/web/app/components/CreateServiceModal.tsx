'use client';

import { useState } from 'react';
import { X, Loader2, Briefcase, HardHat } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '../contexts/AuthContext';

interface CreateServiceModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateServiceModal({ onClose, onSuccess }: CreateServiceModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [type, setType] = useState<'REQUEST' | 'OFFER'>('REQUEST'); // Default: Preciso de ajuda
    const [errors, setErrors] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        city: '',
        state: '',
        date: '',
        whatsapp: ''
    });

    const { user } = useAuth(); // Import useAuth to check login status

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors('');

        try {
            if (user) {
                // Logged in user -> Standard create
                await api.post('/services', {
                    ...formData,
                    type
                });
            } else {
                // Guest user -> Public create
                await api.post('/services/public', {
                    ...formData,
                    type
                });
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            setErrors('Erro ao criar anúncio. Verifique os dados.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 className="font-bold text-gray-800 text-lg">Novo Anúncio</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto">
                    {/* Type Selector */}
                    <div className="flex gap-4 mb-6">
                        <button
                            type="button"
                            onClick={() => setType('REQUEST')}
                            className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'REQUEST'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <Briefcase size={24} />
                            <span className="font-bold text-sm">Preciso de Ajuda</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('OFFER')}
                            className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'OFFER'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <HardHat size={24} />
                            <span className="font-bold text-sm">Sou Profissional</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título do Anúncio</label>
                            <input
                                required
                                type="text"
                                placeholder={type === 'REQUEST' ? "Ex: Preciso de Ajudante para hoje" : "Ex: Eletricista disponível para diária"}
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Detalhada</label>
                            <textarea
                                required
                                rows={3}
                                placeholder="Descreva o serviço, ferramentas necessárias ou suas especialidades..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                                <input
                                    type="number"
                                    placeholder="0,00"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Whatsapp</label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="(11) 99999-9999"
                                    value={formData.whatsapp}
                                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                <input
                                    required
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {errors && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                                {errors}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${type === 'REQUEST'
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                }`}
                        >
                            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Publicar Anúncio'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
