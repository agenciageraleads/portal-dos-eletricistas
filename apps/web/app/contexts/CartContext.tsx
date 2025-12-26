'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../types/product';

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
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

    const addToCart = (product: Product) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
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
        const newItems: CartItem[] = budgetItems.map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            description: item.product.description,
            price: item.price.toString(),
            imageUrl: item.product.imageUrl,
            category: item.product.category,
            quantity: item.quantity,
            sankhya_code: item.product.sankhya_code,
            is_available: item.product.is_available
        }));
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
        <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, loadBudgetIntoCart, total, count }}>
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
