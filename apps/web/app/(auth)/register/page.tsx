'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [cpf, setCpf] = useState(''); // Renomeando estado para clareza
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/auth/register`, {
                name,
                cpf_cnpj: cpf, // Envia como cpf_cnpj
                phone,
                password
            });
            alert('Cadastro realizado com sucesso! Faça login.');
            router.push('/login');
        } catch (error) {
            alert('Erro ao cadastrar. Tente novamente.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Cadastro Eletricista</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                            required
                            placeholder="Ex: João da Silva"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CPF ou CNPJ</label>
                        <input
                            type="text"
                            value={cpf}
                            onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '');
                                if (v.length <= 11) {
                                    v = v.replace(/(\d{3})(\d)/, '$1.$2');
                                    v = v.replace(/(\d{3})(\d)/, '$1.$2');
                                    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                                } else {
                                    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
                                    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                                    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
                                    v = v.replace(/(\d{4})(\d)/, '$1-$2');
                                }
                                setCpf(v);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                            required
                            placeholder="CPF ou CNPJ"
                            maxLength={18}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '');
                                v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
                                v = v.replace(/(\d)(\d{4})$/, '$1-$2');
                                setPhone(v);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                            required
                            placeholder="(11) 99999-9999"
                            maxLength={15}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                        Criar Conta
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Já tem conta? <Link href="/login" className="text-blue-600 hover:underline">Faça Login</Link>
                </div>
            </div>
        </div>
    );
}
