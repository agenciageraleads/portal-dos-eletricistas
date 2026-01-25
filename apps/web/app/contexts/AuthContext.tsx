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
        // Check cookies first (middleware source of truth), fall back to localStorage
        const token = Cookies.get('token') || localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token) {
            // Ensure consistency between cookies and localStorage
            if (!Cookies.get('token')) Cookies.set('token', token, { expires: 7 }); // 7 days
            if (!localStorage.getItem('token')) localStorage.setItem('token', token);

            // Set header immediately
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // If we have stored user, set it first for instant UI
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            // Fetch fresh user data from backend
            axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/auth/me`)
                .then(response => {
                    // Update user with fresh data (including new role)
                    const freshUser = response.data;
                    console.log('[AuthContext] Fetched fresh user:', freshUser); // DEBUG
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                })
                .catch(() => {
                    // If token is invalid, clear everything
                    Cookies.remove('token');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    delete axios.defaults.headers.common['Authorization'];
                    setUser(null);
                })
                .finally(() => {
                    console.log('[AuthContext] Loading finished. User:', user); // DEBUG
                    setLoading(false);
                });
        } else {
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
        Cookies.set('token', token, { expires: 7 }); // 7 days
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
        Cookies.remove('token');
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
