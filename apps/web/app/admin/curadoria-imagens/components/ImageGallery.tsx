'use client';

import { useState } from 'react';
import { Check, X, ExternalLink, Camera } from 'lucide-react';
import api from '@/lib/api';

interface Candidate {
  id: string;
  url: string;
  source: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  sankhya_code: number;
  imageCandidates: Candidate[];
}

interface ImageGalleryProps {
  product: Product;
  onProcessed: () => void;
}

export default function ImageGallery({ product, onProcessed }: ImageGalleryProps) {
  const [loading, setLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!selectedUrl) return;
    
    setLoading(true);
    try {
      await api.post('/admin/image-curator/approve', {
        productId: product.id,
        imageUrl: selectedUrl,
      });
      onProcessed();
    } catch (error) {
      console.error('Erro ao aprovar imagem:', error);
      alert('Erro ao processar imagem. Verifique os logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleIgnore = async () => {
    if (!confirm('Deseja ignorar este produto? Ele não aparecerá mais nesta lista.')) return;
    
    setLoading(true);
    try {
      await api.post(`/admin/image-curator/ignore/${product.id}`);
      onProcessed();
    } catch (error) {
      console.error('Erro ao ignorar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row h-full transition-all hover:shadow-md">
      {/* Product Info */}
      <div className="p-5 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
        <div className="flex items-start justify-between mb-3">
            <span className="px-2 py-1 bg-brand-primary-light text-brand-primary text-[10px] font-black rounded uppercase tracking-wider">
                Cód: {product.sankhya_code}
            </span>
            <button 
              onClick={handleIgnore}
              disabled={loading}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Ignorar Produto"
            >
                <X size={18} />
            </button>
        </div>
        <h3 className="font-bold text-gray-800 text-base leading-tight mb-1">{product.name}</h3>
        <p className="text-xs font-bold text-brand-primary uppercase tracking-wide">{product.brand || 'Marca não informada'}</p>
        
        <div className="mt-auto pt-4">
            <button
                onClick={handleApprove}
                disabled={!selectedUrl || loading}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                    !selectedUrl || loading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-brand-success text-white hover:bg-emerald-600 active:scale-95 shadow-emerald-200'
                }`}
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                ) : (
                    <Check size={18} />
                )}
                Aprovar Selecionada
            </button>
        </div>
      </div>

      {/* Image Selection Grid */}
      <div className="p-5 flex-1 bg-white">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 h-full">
          {product.imageCandidates.length > 0 ? (
            product.imageCandidates.map((candidate) => (
              <div 
                key={candidate.id}
                onClick={() => setSelectedUrl(candidate.url)}
                className={`relative group cursor-pointer aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedUrl === candidate.url 
                  ? 'border-brand-success ring-4 ring-emerald-50' 
                  : 'border-gray-100 hover:border-brand-primary/30'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={candidate.url} 
                  alt="Candidato" 
                  className="w-full h-full object-contain p-2 bg-white"
                />
                <div className={`absolute top-2 right-2 p-1.5 rounded-lg shadow-sm backdrop-blur-md transition-all ${
                  selectedUrl === candidate.url ? 'bg-brand-success text-white' : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100'
                }`}>
                    <Check size={14} strokeWidth={3} />
                </div>
                <a 
                  href={candidate.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:text-brand-primary transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                    <ExternalLink size={14} />
                </a>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-gray-300 py-10 opacity-50">
                <Camera size={48} strokeWidth={1} />
                <p className="text-sm font-bold mt-2 uppercase tracking-widest">Aguardando busca...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
