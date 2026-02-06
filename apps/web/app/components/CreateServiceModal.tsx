'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '../contexts/AuthContext';

interface CreateServiceModalProps {
    onClose: () => void;
    onSuccess: () => void;
    initialType?: 'REQUEST' | 'OFFER';
}

export default function CreateServiceModal({ onClose, onSuccess, initialType = 'REQUEST' }: CreateServiceModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [type, setType] = useState<string>('CLIENT_SERVICE');
    const [errors, setErrors] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        city: '',
        state: '',
        date: '',
        whatsapp: '',
        installationType: '',
        needsInfra: '',
        contractType: '',
        urgency: ''
    });

    const { user } = useAuth(); // Import useAuth to check login status

    // ... input masks ...

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors('');
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                price: formData.price ? parseFloat(formData.price) : null,
                city: formData.city,
                date: new Date(formData.date),
                whatsapp: formData.whatsapp,
                type: type, // Fixed to REQUEST
                installationType: formData.installationType || null,
                needsInfra: formData.needsInfra === '' ? null : formData.needsInfra === 'YES',
                contractType: formData.contractType || null,
                urgency: formData.urgency || null
            };

            if (user) {
                await api.post('/services', payload);
            } else {
                await api.post('/services/public', payload);
            }

            onSuccess();
        } catch (error: any) {
            console.error('Erro ao publicar:', error);
            const msg = error.response?.data?.message || 'Erro ao publicar. Verifique os dados.';
            setErrors(msg);
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
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Type Selection for Electricians */}
                        {user?.role === 'ELETRICISTA' && (
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Anúncio</label>
                                <div className="grid grid-cols-1 gap-2">
                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${type === 'CLIENT_SERVICE' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="serviceType"
                                            value="CLIENT_SERVICE"
                                            checked={type === 'CLIENT_SERVICE' || type === 'REQUEST'}
                                            onChange={() => setType('CLIENT_SERVICE')}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <div>
                                            <span className="block text-sm font-bold text-gray-800">Preciso de um Serviço</span>
                                            <span className="block text-xs text-gray-500">Ex: Instalação na minha casa/loja</span>
                                        </div>
                                    </label>

                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${type === 'PRO_SUBCONTRACT' ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="serviceType"
                                            value="PRO_SUBCONTRACT"
                                            checked={type === 'PRO_SUBCONTRACT'}
                                            onChange={() => setType('PRO_SUBCONTRACT')}
                                            className="w-4 h-4 text-purple-600"
                                        />
                                        <div>
                                            <span className="block text-sm font-bold text-gray-800">Repassar Obra / Parceria</span>
                                            <span className="block text-xs text-gray-500">Tenho um serviço e preciso de parceiro</span>
                                        </div>
                                    </label>

                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${type === 'PRO_HELPER_JOB' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="serviceType"
                                            value="PRO_HELPER_JOB"
                                            checked={type === 'PRO_HELPER_JOB'}
                                            onChange={() => setType('PRO_HELPER_JOB')}
                                            className="w-4 h-4 text-indigo-600"
                                        />
                                        <div>
                                            <span className="block text-sm font-bold text-gray-800">Contratar Ajudante</span>
                                            <span className="block text-xs text-gray-500">Vaga para auxiliar ou eletricista júnior</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Pedido</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Informe o título do pedido"
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
                                    placeholder="Descreva o serviço com detalhes importantes"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Instalação</label>
                                <select
                                    value={formData.installationType}
                                    onChange={e => setFormData({ ...formData, installationType: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="">Selecione o tipo</option>
                                    <option value="RESIDENCIAL">Residencial</option>
                                    <option value="COMERCIAL">Comercial</option>
                                    <option value="INDUSTRIAL">Industrial</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precisa de Infraestrutura?</label>
                                <select
                                    value={formData.needsInfra}
                                    onChange={e => setFormData({ ...formData, needsInfra: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="">Selecione</option>
                                    <option value="YES">Sim, precisa</option>
                                    <option value="NO">Não precisa</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contrato</label>
                                <select
                                    value={formData.contractType}
                                    onChange={e => setFormData({ ...formData, contractType: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="">Selecione o tipo</option>
                                    <option value="DIARIA">Diária</option>
                                    <option value="EMPREITADA">Empreitada</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Urgência / Prazo</label>
                                <select
                                    value={formData.urgency}
                                    onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="">Selecione a urgência</option>
                                    <option value="IMEDIATO">Imediato</option>
                                    <option value="ATE_7_DIAS">Até 7 dias</option>
                                    <option value="ATE_15_DIAS">Até 15 dias</option>
                                    <option value="FLEXIVEL">Sem urgência</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento (R$)</label>
                                <input
                                    type="number"
                                    placeholder="Informe o orçamento (opcional)"
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
                                    placeholder="Informe o WhatsApp para contato"
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
                                    placeholder="Informe a cidade do serviço"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data Prevista</label>
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
                            className="w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                        >
                            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Publicar Pedido'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
