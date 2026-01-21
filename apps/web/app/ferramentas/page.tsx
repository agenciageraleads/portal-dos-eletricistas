'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Zap, Cable } from 'lucide-react';
import { BitolaCalculator } from './components/BitolaCalculator';
import { DisjuntorCalculator } from './components/DisjuntorCalculator';
import BottomNav from '../components/BottomNav';
import PageHeader from '../components/PageHeader';

export default function FerramentasPage() {
    const [activeTab, setActiveTab] = useState<'bitola' | 'disjuntor'>('bitola');

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header>
                <PageHeader
                    title="Ferramentas & Cálculos"
                    icon={<Calculator size={20} />}
                />
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex bg-white rounded-xl shadow-sm p-1 mb-6 border border-gray-100">
                    <button
                        onClick={() => setActiveTab('bitola')}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'bitola'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <Cable size={20} />
                        Cálculo de Cabo
                    </button>
                    <button
                        onClick={() => setActiveTab('disjuntor')}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'disjuntor'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <Zap size={20} />
                        Dimensionar Disjuntor
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                    {activeTab === 'bitola' && <BitolaCalculator />}
                    {activeTab === 'disjuntor' && <DisjuntorCalculator />}
                </div>

                <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">Outras Ferramentas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/ferramentas/calculadora-led" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-yellow-400 transition-all">
                        <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">Calculadora Fonte LED</h4>
                            <p className="text-sm text-gray-500">Dimensione fontes para fitas LED 12V e 24V.</p>
                        </div>
                    </Link>
                </div>

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
