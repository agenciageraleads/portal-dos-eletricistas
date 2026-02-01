'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, Info, Calculator, Lightbulb } from 'lucide-react';

export default function LedCalculatorPage() {
    const [voltage, setVoltage] = useState(12);
    const [powerPerMeter, setPowerPerMeter] = useState(14.4); // Default generic
    const [length, setLength] = useState(0);
    const [customPower, setCustomPower] = useState(false);

    const calculate = () => {
        const totalPower = length * powerPerMeter;
        const recommendedPower = totalPower * 1.2; // 20% safety margin
        const current = recommendedPower / voltage;

        return {
            totalPower: totalPower.toFixed(1),
            recommendedPower: recommendedPower.toFixed(1),
            current: current.toFixed(1),
            minAmps: (totalPower / voltage).toFixed(1)
        };
    };

    const results = calculate();

    const commonPowers = [
        { label: '4.8W/m (Decorativa)', value: 4.8 },
        { label: '9.6W/m (Média)', value: 9.6 },
        { label: '14.4W/m (Forte)', value: 14.4 },
        { label: '20W/m (Alta Potência)', value: 20 },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/ferramentas" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-800">Calculadora Fonte LED</h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 space-y-6">
                {/* Input Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tensão da Fita (Volts)</label>
                        <div className="flex gap-2">
                            {[12, 24].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setVoltage(v)}
                                    className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-all ${voltage === v ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {v}V
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Potência por Metro</label>
                        <div className="space-y-2 mb-3">
                            {commonPowers.map((check) => (
                                <button
                                    key={check.value}
                                    onClick={() => { setPowerPerMeter(check.value); setCustomPower(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${!customPower && powerPerMeter === check.value ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-100 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {check.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="customP"
                                checked={customPower}
                                onChange={(e) => setCustomPower(e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="customP" className="text-sm text-gray-600">Personalizado (W/m)</label>
                        </div>
                        {customPower && (
                            <input
                                type="number"
                                value={powerPerMeter}
                                onChange={(e) => setPowerPerMeter(Number(e.target.value))}
                                className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comprimento Total (Metros)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={length || ''}
                                onChange={(e) => setLength(Number(e.target.value))}
                                placeholder="Informe o comprimento total em metros"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none pl-10"
                            />
                            <span className="absolute left-3 top-3.5 text-gray-400">m</span>
                        </div>
                    </div>
                </div>

                {/* Result Section */}
                {length > 0 && (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="text-yellow-400" />
                            <h2 className="font-bold text-lg">Fonte Recomendada</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                <p className="text-xs text-gray-300 mb-1">Potência Mínima</p>
                                <p className="text-2xl font-bold">{results.recommendedPower}W</p>
                                <p className="text-[10px] text-gray-400">Inclui +20% margem</p>
                            </div>
                            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                <p className="text-xs text-gray-300 mb-1">Corrente Ideal</p>
                                <p className="text-2xl font-bold">{results.current}A</p>
                                <p className="text-[10px] text-gray-400">@{voltage}V</p>
                            </div>
                        </div>

                        <div className="bg-yellow-500/20 border border-yellow-500/30 p-3 rounded-lg flex gap-3 items-start mt-2">
                            <Lightbulb className="text-yellow-400 shrink-0" size={18} />
                            <p className="text-xs text-yellow-100 leading-relaxed">
                                <strong>Dica Pro:</strong> Para fitas acima de 5 metros, lembre-se de alimentar as duas extremidades para evitar queda de tensão (luz mais fraca no final).
                            </p>
                        </div>
                    </div>
                )}

                {/* Search Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href={`/catalogo?q=Fita LED ${voltage}V`}
                        className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                        <Zap className="text-gray-400 group-hover:text-blue-500 mb-2" />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600">Buscar Fitas</span>
                    </Link>
                    <Link
                        href={`/catalogo?q=Fonte Chaveada ${results.recommendedPower}W`}
                        className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                        <div className="w-6 h-6 border-2 border-gray-400 rounded group-hover:border-blue-500 mb-2 flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:text-blue-500">
                            12V
                        </div>
                        <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600">Buscar Fontes</span>
                    </Link>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-800 text-sm">
                    <Info className="shrink-0" size={20} />
                    <p>O cálculo considera uma margem de segurança de 20% para garantir a vida útil da fonte e evitar superaquecimento.</p>
                </div>
            </main>
        </div>
    );
}
