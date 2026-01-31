'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import Cookies from 'js-cookie';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    logo_url?: string;
    role?: string;
    bio?: string;
    pix_key?: string;
    city?: string;
    state?: string;
    isAvailableForWork?: boolean;
    _count?: {
        budgets: number;
    };
}

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => { },
    logout: () => { },
    refreshUser: async () => { },
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Verificar token e buscar dados do usuário do backend
        // IMPORTANTE: Não mostra dados em cache antes de validar com backend
        const cookieToken = Cookies.get('token');
        const localToken = localStorage.getItem('token');
        const token = cookieToken || localToken;

        console.log('[AuthContext] 🔑 Verificando autenticação, token presente:', !!token);

        if (token) {
            // Sincronizar token entre cookies e localStorage
            // Middleware só lê Cookies, então garantimos que ele esteja lá
            if (!cookieToken) Cookies.set('token', token, { expires: 7, path: '/' });
            if (!localToken) localStorage.setItem('token', token);

            // Configurar header para requisições
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Buscar dados FRESCOS do backend - NÃO usar cache primeiro
            console.log('[AuthContext] 🔄 Validando token com backend...');
            axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/auth/me`)
                .then(response => {
                    const freshUser = response.data;
                    console.log('[AuthContext] ✅ Token válido, usuário:', freshUser.name);
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                })
                .catch((error) => {
                    // Token inválido - limpar TUDO
                    console.log('[AuthContext] ❌ Token inválido, limpando sessão...', error?.response?.status);

                    // Só limpa se for erro de autenticação (401/403) ou se o backend confirmou invalidade
                    if (error?.response?.status === 401 || error?.response?.status === 403) {
                        Cookies.remove('token', { path: '/' });
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        delete axios.defaults.headers.common['Authorization'];
                        setUser(null);
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            console.log('[AuthContext] 🚫 Nenhum token encontrado');
            setLoading(false);
        }
    }, []);

    const refreshUser = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/auth/me`);
            const freshUser = response.data;
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
    };

    const login = (token: string, userData: User) => {
        Cookies.set('token', token, { expires: 7, path: '/' }); // 7 days
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);

        // Identify user in PostHog
        if (typeof window !== 'undefined') {
            posthog.identify(userData.id, {
                email: userData.email,
                name: userData.name,
                role: userData.role
            });
        }
    };

    const logout = () => {
        Cookies.remove('token', { path: '/' });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        if (typeof window !== 'undefined') posthog.reset();
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
