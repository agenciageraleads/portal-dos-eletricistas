'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { X, Star, Loader2, Award, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AddReviewModalProps {
    targetUserId: string;
    targetUserName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddReviewModal({ targetUserId, targetUserName, onClose, onSuccess }: AddReviewModalProps) {
    const { user } = useAuth();
    const [rating, setRating] = useState<number>(5);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [authorName, setAuthorName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (rating < 1 || rating > 5) {
            setError('Por favor, selecione uma nota de 1 a 5 estrelas.');
            return;
        }

        if (!comment.trim()) {
            setError('Por favor, escreva um depoimento para validar seu colega.');
            return;
        }

        setLoading(true);

        try {
            await api.post(`/reviews/user/${targetUserId}`, {
                rating,
                comment: comment.trim(),
                isAnonymous: !user ? true : isAnonymous,
                authorName: authorName.trim() || undefined
            });
            onSuccess();
        } catch (err: any) {
            console.error('Erro ao salvar avaliação:', err);
            setError(err.response?.data?.message || 'Erro ao enviar sua avaliação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-250">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Award size={20} className="text-slate-950 fill-slate-950" />
                        <h3 className="font-extrabold text-base tracking-tight">Avaliar Profissional</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-black/10 rounded-full transition-colors text-slate-950"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <p className="text-sm text-gray-500 leading-normal">
                        Diga o que você acha do trabalho de <strong>{targetUserName}</strong>. Avaliações com perfil identificado aparecem primeiro e têm mais peso.
                    </p>

                    {error && (
                        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold animate-pulse">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Stars Picker */}
                    <div className="flex flex-col items-center py-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nota Geral</span>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(null)}
                                    className="transition-transform active:scale-95"
                                    disabled={loading}
                                >
                                    <Star
                                        size={36}
                                        className={`transition-all duration-150 ${
                                            star <= (hoverRating ?? rating)
                                                ? 'text-amber-500 fill-amber-500 scale-110 drop-shadow'
                                                : 'text-gray-300 hover:text-amber-400'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-amber-600 mt-2">
                            {rating === 5 ? 'Excelente!' : rating === 4 ? 'Muito bom' : rating === 3 ? 'Bom' : rating === 2 ? 'Regular' : 'Ruim'}
                        </span>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Depoimento / Recomendação *
                        </label>
                        <textarea
                            placeholder="Descreva as qualidades técnicas do colega (ex: pontual, organizado, domina NR10, montagem limpa de quadro)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            maxLength={500}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none text-sm transition-all resize-none"
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Identity & Anonymous Toggle */}
                    <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex flex-col gap-3">
                        <div className="flex items-start gap-2.5">
                            <input
                                id="is-anon"
                                type="checkbox"
                                checked={!user ? true : isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-2 focus:ring-amber-500"
                                disabled={loading || !user} // forced anonymous if no user logged in
                            />
                            <div className="flex-1">
                                <label htmlFor="is-anon" className="text-xs font-bold text-slate-800 cursor-pointer block">
                                    Enviar de forma Anônima
                                </label>
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                                    {!user
                                        ? 'Você está postando como visitante (sem login), por isso seu comentário será 100% anônimo para segurança.'
                                        : 'Seu comentário será publicado ocultando seu perfil. Eletricistas não verão rusgas.'}
                                </p>
                            </div>
                        </div>

                        {/* Custom Name Signature Input (Only for Anonymous / Visitors) */}
                        {(!user || isAnonymous) && (
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Como deseja assinar? (Opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder={!user ? 'Ex: Cliente Satisfeito' : 'Ex: Colega Eletricista'}
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    maxLength={40}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-xs bg-white transition-all"
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {user && !isAnonymous && (
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                                <UserCheck size={16} />
                                Avaliação identificada como <strong>{user.name.split(' ')[0]}</strong> (+Relevância)
                            </div>
                        )}
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
                            className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Enviar Nota'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
