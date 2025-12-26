'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Save, User as UserIcon, Phone, FileText, Upload, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PerfilPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [pixKey, setPixKey] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        // Fetch current profile data
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/users/profile`);
                const profile = response.data;
                setName(profile.name || '');
                setPhone(profile.phone || '');
                setBio(profile.bio || '');
                setLogoUrl(profile.logo_url || '');
                setPixKey(profile.pix_key || '');
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
            }
        };

        fetchProfile();
    }, [user, router]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('logo', file);

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/users/upload-logo`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            setLogoUrl(response.data.logo_url);
            alert('Logo atualizada com sucesso!');
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            alert('Erro ao fazer upload da logo. Tente novamente.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/users/profile`,
                { name, phone, bio, pix_key: pixKey }
            );
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            alert('Erro ao atualizar perfil. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800">Meu Perfil</h1>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto p-4 pb-24">
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                    {/* Logo Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div
                            className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 bg-gray-100 flex items-center justify-center cursor-pointer hover:border-blue-300 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {logoUrl ? (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}${logoUrl}`}
                                    alt="Logo"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Upload size={40} className="text-gray-400" />
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    {logoUrl ? 'Alterar Logo' : 'Adicionar Logo'}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <UserIcon size={18} />
                            Nome
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                            placeholder="Seu nome ou nome da empresa"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Phone size={18} />
                            Telefone
                        </label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                            placeholder="(11) 99999-9999"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FileText size={18} />
                            Sobre você / Empresa
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-500"
                            placeholder="Descreva seus serviços, especialidades, experiência..."
                        />
                    </div>

                    {/* Pix Key */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <CreditCard size={18} />
                            Chave PIX
                        </label>
                        <input
                            type="text"
                            value={pixKey}
                            onChange={(e) => setPixKey(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                            placeholder="CPF, CNPJ, Email ou Telefone"
                        />
                        <p className="text-xs text-gray-500 mt-1">Será exibida nos orçamentos para facilitar pagamentos</p>
                    </div>
                </div>
            </main>

            {/* Save Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
                    >
                        <Save size={24} />
                        {loading ? 'Salvando...' : 'Salvar Perfil'}
                    </button>
                </div>
            </div>
        </div>
    );
}
