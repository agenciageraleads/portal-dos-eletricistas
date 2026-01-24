
import { useState, useEffect } from 'react';
import { X, Search, Check, Calculator, Plus } from 'lucide-react';
import api from '@/lib/api';

interface ServiceProduct {
    id: string;
    name: string;
    price: number;
    description?: string;
    category?: string;
    image_url?: string;
}

interface AddServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddService: (service: ServiceProduct) => void;
}

export default function AddServiceModal({ isOpen, onClose, onAddService }: AddServiceModalProps) {
    const [services, setServices] = useState<ServiceProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchServices();
        }
    }, [isOpen]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/products', {
                params: {
                    type: 'SERVICE',
                    limit: 100 // Fetch all/most services
                }
            });
            setServices(data.data);
        } catch (error) {
            console.error('Failed to fetch services', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] shadow-xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Calculator className="text-blue-600" />
                            Catálogo de Serviços Padrão
                        </h3>
                        <p className="text-sm text-gray-500">Mão de obra padronizada (Tabela Referenciada).</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar serviço (ex: Tomada, Chuveiro, Ponto de Luz)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Carregando serviços...</div>
                    ) : filteredServices.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">Nenhum serviço encontrado.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filteredServices.map(service => (
                                <div key={service.id} className="bg-white p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all flex flex-col gap-3 group">
                                    <div className="flex gap-3 items-start">
                                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 text-blue-500">
                                            {service.image_url && service.image_url.startsWith('http') ? (
                                                <img src={service.image_url} alt="" className="w-8 h-8 object-contain opacity-80" />
                                            ) : (
                                                <Calculator size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">{service.name}</h4>
                                            <p className="text-xs text-gray-500">{service.category}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                                        <span className="font-bold text-blue-700">R$ {service.price.toFixed(2).replace('.', ',')}</span>
                                        <button
                                            onClick={() => onAddService(service)}
                                            className="p-2 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-lg text-gray-600 transition-colors"
                                            title="Adicionar"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-white text-center">
                    <p className="text-xs text-gray-400">Os valores aqui são sugestões baseadas na tabela padrão. Você poderá editar quantidades na lista.</p>
                </div>
            </div>
        </div>
    );
}
