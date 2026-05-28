'use client';

import React, { useState, useRef } from 'react';
import api from '@/lib/api';
import { X, Image as ImageIcon, Loader2, Sparkles, Send } from 'lucide-react';

interface CreatePostModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreatePostModal({ onClose, onSuccess }: CreatePostModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Apenas arquivos de imagem são permitidos!');
            return;
        }

        setError(null);
        setImageFile(file);

        // Preview da imagem
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError('Por favor, informe um título para o seu trabalho.');
            return;
        }

        if (!imageFile) {
            setError('Por favor, envie uma foto do trabalho realizado.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('image', imageFile);

        try {
            await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onSuccess();
        } catch (err: any) {
            console.error('Erro ao postar trabalho:', err);
            setError(err.response?.data?.message || 'Erro ao publicar seu trabalho. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-250">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles size={20} className="text-yellow-300 fill-yellow-300" />
                        <h3 className="font-extrabold text-base tracking-tight">Publicar Trabalho Feito</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Image Upload Area */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Foto do Serviço Realizado *
                        </label>
                        <div
                            onClick={() => !loading && fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all ${
                                imagePreview
                                    ? 'border-teal-500 bg-teal-50/10'
                                    : 'border-gray-300 hover:border-teal-500 hover:bg-gray-50'
                            }`}
                        >
                            {imagePreview ? (
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-inner border border-gray-100 bg-gray-50">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                        Clique para alterar
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-3 shadow-sm">
                                        <ImageIcon size={24} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">Escolha uma foto da obra</span>
                                    <span className="text-xs text-gray-400 mt-1">Imagens de alta resolução destacam seu trabalho</span>
                                </>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={loading}
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Título da Postagem *
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Instalação de Painel de Led Embutido"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={80}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none text-sm transition-all"
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            O que foi feito? (Opcional)
                        </label>
                        <textarea
                            placeholder="Descreva as técnicas, ferramentas usadas ou detalhes da instalação que comprovem sua qualidade técnica..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={300}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none text-sm transition-all resize-none"
                            disabled={loading}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl transition-all active:scale-95"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Publicando...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Postar no Feed
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
