'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Zap, Cable } from 'lucide-react';
import { BitolaCalculator } from './components/BitolaCalculator';
import { DisjuntorCalculator } from './components/DisjuntorCalculator';
import BottomNav from '../components/BottomNav';
import PageHeader from '../components/PageHeader';

export default function FerramentasPage() {
    const [activeTab, setActiveTab] = useState<'bitola' | 'disjuntor' | null>(null);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header>
                <PageHeader
                    title="Ferramentas & Cálculos"
                    icon={<Calculator size={20} />}
                />
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                {/* Content Logic: List or Active Tool */}
                {!activeTab ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                        {/* Cabos */}
                        <button
                            onClick={() => setActiveTab('bitola')}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-blue-500 hover:shadow-md transition-all text-left"
                        >
                            <div className="p-4 bg-blue-50 rounded-lg text-blue-600">
                                <Cable size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Calculadora de Cabos</h3>
                                <p className="text-sm text-gray-500">Dimensione a bitola correta baseada na potência e distância.</p>
                            </div>
                        </button>

                        {/* Disjuntor */}
                        <button
                            onClick={() => setActiveTab('disjuntor')}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-blue-500 hover:shadow-md transition-all text-left"
                        >
                            <div className="p-4 bg-blue-50 rounded-lg text-blue-600">
                                <Zap size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Dimensionar Disjuntor</h3>
                                <p className="text-sm text-gray-500">Encontre o disjuntor ideal para seus circuitos.</p>
                            </div>
                        </button>

                        {/* LED Link */}
                        <Link href="/ferramentas/calculadora-led" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-yellow-400 hover:shadow-md transition-all">
                            <div className="p-4 bg-yellow-50 rounded-lg text-yellow-600">
                                <Zap size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Calculadora Fonte LED</h3>
                                <p className="text-sm text-gray-500">Dimensione fontes para fitas LED 12V e 24V.</p>
                            </div>
                        </Link>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-right-4">
                        <button
                            onClick={() => setActiveTab(null)}
                            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Voltar para Ferramentas
                        </button>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                            {activeTab === 'bitola' && <BitolaCalculator />}
                            {activeTab === 'disjuntor' && <DisjuntorCalculator />}
                        </div>
                    </div>
                )}

                <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
                    <p className="font-bold flex items-center gap-2 mb-1">
                        ⚠️ Nota Importante
                    </p>
                    <p>
                        Estes cálculos são estimativas baseadas na norma NBR 5410 para instalações típicas.
                        Sempre consulte um engenheiro eletricista para projetos complexos ou industriais.
                    </p>
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
