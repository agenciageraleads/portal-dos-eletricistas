'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../types/product';

export interface CartItem {
    id: string; // ID único no carrinho (id do produto ou UUID para manual)
    productId?: string; // ID real no banco (apenas para produtos do catálogo)
    name: string;
    price: string;
    image_url?: string;
    quantity: number;
    brand?: string;
    sankhya_code?: number;
    unit?: string;
    isExternal?: boolean;
    suggestedSource?: string;
    type?: 'MATERIAL' | 'SERVICE';
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    addManualItem: (item: Partial<CartItem>) => void;
    updateQuantity: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    loadBudgetIntoCart: (budgetItems: any[]) => void;
    total: number;
    count: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Carregar do localStorage na inicialização (persistência básica)
    useEffect(() => {
        const saved = localStorage.getItem('portal_cart');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error('Erro ao ler carrinho', e);
            }
        }
    }, []);

    // Salvar no localStorage sempre que mudar
    useEffect(() => {
        localStorage.setItem('portal_cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Product, quantity: number = 1) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.productId === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prev, {
                id: product.id,
                productId: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                brand: product.brand,
                sankhya_code: product.sankhya_code,
                unit: product.unit,
                type: (product as any).type || 'MATERIAL',
                quantity: quantity
            }];
        });
    };

    const addManualItem = (manualItem: Partial<CartItem>) => {
        const id = `manual_${Math.random().toString(36).substring(2, 9)}`;
        setItems((prev) => [...prev, {
            id,
            name: manualItem.name || 'Item Personalizado',
            price: manualItem.price || '0',
            quantity: manualItem.quantity || 1,
            image_url: manualItem.image_url,
            isExternal: true,
            suggestedSource: manualItem.suggestedSource,
        }]);
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setItems((prev) =>
            prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
        );
    };

    const loadBudgetIntoCart = (budgetItems: any[]) => {
        const newItems: CartItem[] = budgetItems.map((item: any) => {
            if (item.is_external) {
                return {
                    id: item.id, // Use item ID since it's manual
                    name: item.custom_name,
                    price: item.price.toString(),
                    image_url: item.custom_photo_url,
                    quantity: item.quantity,
                    isExternal: true,
                    suggestedSource: item.suggested_source
                };
            }
            return {
                id: item.product?.id || item.productId,
                productId: item.product?.id || item.productId,
                name: item.product?.name || 'Produto Não Encontrado',
                description: item.product?.description || '',
                price: item.price.toString(),
                image_url: item.product?.image_url || item.product?.imageUrl,
                category: item.product?.category,
                quantity: item.quantity,
                sankhya_code: item.product?.sankhya_code,
                unit: item.product?.unit || 'UN',
                type: item.product?.type || 'MATERIAL',
            };
        });
        setItems(newItems);
    };

    const removeFromCart = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const total = items.reduce((acc, item) => {
        return acc + (parseFloat(item.price) * item.quantity);
    }, 0);

    const count = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, addManualItem, updateQuantity, removeFromCart, clearCart, loadBudgetIntoCart, total, count }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
