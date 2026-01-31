'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Save, User as UserIcon, Phone, FileText, Upload, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ImageCropModal from '../components/ImageCropModal';

export default function PerfilPage() {
    const { user, refreshUser, loading: authLoading } = useAuth(); // Destructure refreshUser
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [name, setName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [pixKey, setPixKey] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Crop modal states
    const [showCropModal, setShowCropModal] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState('');

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        // Fetch current profile data
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/profile');
                const profile = response.data;
                setName(profile.name || '');
                setBusinessName(profile.business_name || '');
                setPhone(profile.phone || '');
                setBio(profile.bio || '');
                setLogoUrl(profile.logo_url || '');
                setPixKey(profile.pix_key || '');
                setCity(profile.city || '');
                setState(profile.state || '');
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
                // Non-blocking error
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user, router]); // Keep user in dep array, but verify if loop occurs. Should be fine.

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Read file and show crop modal
        const reader = new FileReader();
        reader.onload = () => {
            setTempImageSrc(reader.result as string);
            setShowCropModal(true);
        };
        reader.readAsDataURL(file);

        // Reset input so same file can be selected again if needed
        e.target.value = '';
    };

    const handleCropSave = async (croppedBlob: Blob) => {
        setUploading(true);
        setShowCropModal(false);

        const formData = new FormData();
        // Use JPG for safer compatibility, though backend handles both
        formData.append('logo', croppedBlob, 'logo.jpg');

        try {
            const response = await api.post('/users/upload-logo', formData);
            setLogoUrl(response.data.logo_url);

            // CRITICAL: Refresh Auth Context to update Header immediately
            await refreshUser();

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
            // Clean empty strings to undefined to avoid sending invalid data
            const payload = {
                name: name || undefined,
                business_name: businessName || undefined,
                phone: phone || undefined,
                bio: bio || undefined,
                pix_key: pixKey || undefined,
                city: city || undefined,
                state: state || undefined
            };

            await api.patch(
                '/users/profile',
                payload
            );

            // Update context details too
            await refreshUser();

            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            alert('Erro ao atualizar perfil. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

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
                                    src={logoUrl.startsWith('http') ? logoUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}${logoUrl}`}
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
                            /* Relaxed accept to let OS handle conversion (HEIC etc) */
                            onChange={handleFileSelect}
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
                            Seu Nome
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                            placeholder="Seu nome completo"
                        />
                    </div>

                    {/* Business Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FileText size={18} />
                            Nome da Empresa / Nome Fantasia
                        </label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                            placeholder="Ex: J Silva Instalações Elétricas"
                        />
                        <p className="text-xs text-gray-500 mt-1">Este nome aparecerá com destaque nos seus orçamentos.</p>
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

                    {/* Location */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <span className="font-bold">📍</span>
                                Cidade
                            </label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                                placeholder="Sua cidade"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                Estado
                            </label>
                            <select
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="">UF</option>
                                <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option>
                                <option value="AM">AM</option><option value="BA">BA</option><option value="CE">CE</option>
                                <option value="DF">DF</option><option value="ES">ES</option><option value="GO">GO</option>
                                <option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option>
                                <option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option>
                                <option value="PR">PR</option><option value="PE">PE</option><option value="PI">PI</option>
                                <option value="RJ">RJ</option><option value="RN">RN</option><option value="RS">RS</option>
                                <option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option>
                                <option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
                            </select>
                        </div>
                    </div>
                </div>
            </main>

            {/* Save Button */}
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-20 pb-safe">
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-lg"
                    >
                        <Save size={24} />
                        {loading ? 'Salvando...' : 'Salvar Perfil'}
                    </button>
                </div>
            </div>

            {/* Crop Modal */}
            {showCropModal && (
                <ImageCropModal
                    imageSrc={tempImageSrc}
                    onSave={handleCropSave}
                    onCancel={() => setShowCropModal(false)}
                />
            )}
        </div>
    );
}
