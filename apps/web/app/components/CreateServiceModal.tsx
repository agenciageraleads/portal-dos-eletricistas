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
    const [step, setStep] = useState(1);
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

    const { user } = useAuth();

    const triggerFeedback = (pattern: number | number[]) => {
        if (typeof window !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    };

    const nextStep = () => {
        if (step === 1 && (!formData.title || !formData.description)) {
            setErrors('Por favor, preencha o título e a descrição.');
            triggerFeedback(50);
            return;
        }
        setErrors('');
        setStep(step + 1);
        triggerFeedback(10);
    };

    const prevStep = () => {
        setStep(step - 1);
        triggerFeedback(10);
    };

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
                type: type,
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

            triggerFeedback([50, 30, 50]);
            onSuccess();
        } catch (error: any) {
            console.error('Erro ao publicar:', error);
            const msg = error.response?.data?.message || 'Erro ao publicar. Verifique os dados.';
            setErrors(msg);
            triggerFeedback([100, 50, 100]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header with Progress Bar */}
                <div className="relative pt-6 px-6 pb-4 border-b bg-brand-primary-light">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-bold text-gray-900 text-xl">Novo Pedido</h3>
                            <p className="text-xs text-gray-500 font-medium">Passo {step} de 3</p>
                        </div>
                        <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-primary transition-all duration-300 ease-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* STEP 1: BASIC INFO */}
                        {step === 1 && (
                            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                                {user?.role === 'ELETRICISTA' && (
                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo de Anúncio</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { id: 'CLIENT_SERVICE', label: 'Preciso de um Serviço', sub: 'Ex: Instalação na minha casa/loja', color: 'brand-primary' },
                                                { id: 'PRO_SUBCONTRACT', label: 'Repassar Obra', sub: 'Tenho um serviço e preciso de parceiro', color: 'brand-accent' },
                                                { id: 'PRO_HELPER_JOB', label: 'Contratar Ajudante', sub: 'Vaga para auxiliar ou eletricista Jr', color: 'brand-accent' }
                                            ].map((opt) => (
                                                <label
                                                    key={opt.id}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${type === opt.id
                                                            ? `bg-${opt.color}-light border-teal-500 shadow-sm`
                                                            : 'bg-white border-gray-100 hover:border-gray-200'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="serviceType"
                                                        checked={type === opt.id}
                                                        onChange={() => setType(opt.id)}
                                                        className="hidden"
                                                    />
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${type === opt.id ? 'border-teal-600' : 'border-gray-300'}`}>
                                                        {type === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />}
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-bold text-gray-900">{opt.label}</span>
                                                        <span className="block text-[11px] text-gray-500">{opt.sub}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Título do Pedido</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Ex: Instalação de Ar Condicionado"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary-light outline-none transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Descrição Detalhada</label>
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="Descreva o que precisa ser feito com o máximo de detalhes..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary-light outline-none transition-all text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: TECHNICAL DETAILS */}
                        {step === 2 && (
                            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Tipo de Instalação</label>
                                        <select
                                            value={formData.installationType}
                                            onChange={e => setFormData({ ...formData, installationType: e.target.value })}
                                            className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand-primary outline-none bg-white text-sm"
                                        >
                                            <option value="">Selecione o tipo</option>
                                            <option value="RESIDENCIAL">Residencial</option>
                                            <option value="COMERCIAL">Comercial</option>
                                            <option value="INDUSTRIAL">Industrial</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Precisa de Infraestrutura?</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['YES', 'NO'].map((val) => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, needsInfra: val })}
                                                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${formData.needsInfra === val
                                                            ? 'border-brand-primary bg-brand-primary-light text-brand-primary'
                                                            : 'border-gray-100 text-gray-500 hover:border-gray-200'
                                                        }`}
                                                >
                                                    {val === 'YES' ? 'Sim, precisa' : 'Não precisa'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Contrato</label>
                                            <select
                                                value={formData.contractType}
                                                onChange={e => setFormData({ ...formData, contractType: e.target.value })}
                                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand-primary outline-none bg-white text-sm"
                                            >
                                                <option value="">Selecione</option>
                                                <option value="DIARIA">Diária</option>
                                                <option value="EMPREITADA">Empreitada</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Urgência</label>
                                            <select
                                                value={formData.urgency}
                                                onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand-primary outline-none bg-white text-sm"
                                            >
                                                <option value="">Prazo</option>
                                                <option value="IMEDIATO">Imediato</option>
                                                <option value="ATE_7_DIAS">Até 7 dias</option>
                                                <option value="ATE_15_DIAS">Até 15 dias</option>
                                                <option value="FLEXIVEL">Flexível</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: LOCATION & CONTACT */}
                        {step === 3 && (
                            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Preço (R$)</label>
                                            <input
                                                type="number"
                                                placeholder="0,00"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand-primary outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">WhatsApp</label>
                                            <input
                                                required
                                                type="tel"
                                                placeholder="(00) 00000-0000"
                                                value={formData.whatsapp}
                                                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand-primary outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Cidade</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Sua cidade"
                                                value={formData.city}
                                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand-primary outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Data Prevista</label>
                                            <input
                                                required
                                                type="date"
                                                value={formData.date}
                                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand-primary outline-none text-sm bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {errors && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2 animate-in shake duration-300">
                                <X size={14} /> {errors}
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t bg-gray-50 flex gap-3">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex-1 py-4 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all active:scale-95"
                        >
                            Voltar
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="flex-[2] py-4 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-primary-hover shadow-lg shadow-teal-200 transition-all active:scale-95"
                        >
                            Próximo Passo
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-[2] py-4 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-primary-hover shadow-xl shadow-teal-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Publicar Anúncio'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

        </div >
    );
}
