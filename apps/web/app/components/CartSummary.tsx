'use client';

import { useCart } from '../contexts/CartContext';
import { ShoppingBag } from 'lucide-react';

export function CartSummary() {
    const { total, count } = useCart();

    if (count === 0) return null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50">
            <a href="/orcamento" className="block">
                <div className="bg-gray-900 text-white p-4 rounded-xl shadow-xl flex items-center justify-between max-w-5xl mx-auto cursor-pointer active:scale-95 transition-transform">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                            {count}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400">Total parcial</span>
                            <span className="font-bold text-lg">{formatPrice(total)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-blue-300">
                        <span className="font-medium text-sm">Ver Orçamento</span>
                        <ShoppingBag size={20} />
                    </div>
                </div>
            </a>
        </div>
    );
}
