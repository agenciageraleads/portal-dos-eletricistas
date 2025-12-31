'use client';

import { ShoppingCart, Zap, Cable, Lightbulb, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types/product';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const formatPrice = (price: string) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(parseFloat(price));
    };

    const { items, addToCart, updateQuantity } = useCart();

    // Check if item is already in cart
    const cartItem = items.find(item => item.id === product.id);
    const quantity = cartItem?.quantity || 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-50 rounded-lg mb-4 flex items-center justify-center text-gray-400 relative overflow-hidden">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full object-contain"
                        onError={(e) => {
                            // Hide broken image and show fallback
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) {
                                (fallback as HTMLElement).style.display = 'flex';
                            }
                        }}
                    />
                ) : null}
                <div
                    className="flex flex-col items-center gap-2"
                    style={{ display: product.image_url ? 'none' : 'flex' }}
                >
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                        {/* Ícones Simbólicos baseados em palavra-chave */}
                        {product.name.toLowerCase().includes('disjuntor') ? <Zap size={32} /> :
                            product.name.toLowerCase().includes('fio') || product.name.toLowerCase().includes('cabo') ? <Cable size={32} /> :
                                product.name.toLowerCase().includes('lampada') || product.name.toLowerCase().includes('led') ? <Lightbulb size={32} /> :
                                    <Package size={32} />
                        }
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{product.category || 'Material'}</span>
                </div>
            </div>

            <div className="flex-1 relative">
                <div className="flex flex-wrap gap-2 mb-2 pr-6">
                    {/* Código Sankhya removido conforme solicitado */}
                </div>

                <div className="flex flex-wrap gap-2 mb-2 pr-6">
                    {/* Código Sankhya removido conforme solicitado */}
                </div>

                {/* Botão de Report removido (Feedback User: Atrapalhava o nome) */}

                <h3 className="font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] text-sm leading-snug">
                    {product.name}
                </h3>
                {product.brand && (
                    <p className="text-xs text-gray-500 mt-1 font-medium">Marca: {product.brand}</p>
                )}
            </div>

            <div className="mt-2 text-right">
                <div className="flex items-baseline justify-end gap-1">
                    <p className="text-xl font-bold text-gray-900 tracking-tight">{formatPrice(product.price)}</p>
                    <span className="text-xs text-gray-500 font-medium">/{product.unit?.toLowerCase() || 'un'}</span>
                </div>
            </div>

            <div className="mt-2 flex flex-col gap-2">

                {quantity > 0 ? (
                    <div className="flex items-center bg-gray-100 rounded-lg h-10 w-full">
                        <button
                            className="px-3 h-full text-gray-600 hover:bg-gray-200 rounded-l-lg font-bold flex items-center justify-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(product.id, quantity - 1);
                            }}
                        >
                            -
                        </button>
                        <input
                            type="number"
                            min="0"
                            className="w-12 h-full bg-transparent text-center font-medium text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={quantity}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) {
                                    updateQuantity(product.id, val);
                                } else if (e.target.value === '') {
                                    // Allow empty temporarily while typing
                                    updateQuantity(product.id, 0); // Logic might need adjustment for pure UX, but this updates cart immediately.
                                    // Better UX: local state? But useCart updates global state.
                                    // If we send 0, it removes item usually.
                                    // Let's stick to simple: if empty or NaN, ignore or set 0?
                                    // If user types '1' then '0', it becomes 10? No.
                                    // Direct control.
                                    updateQuantity(product.id, 0);
                                }
                            }}
                        />
                        <button
                            className="px-3 h-full text-blue-600 hover:bg-blue-100 rounded-r-lg font-bold flex items-center justify-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(product.id, quantity + 1);
                            }}
                        >
                            +
                        </button>
                    </div>
                ) : (
                    <button
                        className="bg-blue-600 text-white h-10 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md w-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                        }}
                    >
                        <ShoppingCart size={20} className="stroke-2" />
                        <span className="font-semibold text-sm">Adicionar</span>
                    </button>
                )}
            </div>
        </div >
    );
}
