'use client';

import { useState } from 'react';
import { ChevronRight, RefreshCw } from 'lucide-react';

export function BitolaCalculator() {
    const [voltage, setVoltage] = useState('220');
    const [power, setPower] = useState('');
    const [distance, setDistance] = useState('');
    const [result, setResult] = useState<{ gauge: string; drop: number } | null>(null);

    const calculate = () => {
        const V = parseFloat(voltage);
        const P = parseFloat(power);
        const L = parseFloat(distance);

        if (!V || !P || !L) return;

        // Corrente (I) = P / V
        const I = P / V;

        // Queda de Tensão Admitida (4%)
        // DeltaV = (2 * L * I * rho) / S
        // S = (2 * L * I * 0.0172) / (V * 0.04)   (Cobre)

        // rho cobre = 0.0172 ohm.mm²/m
        const rho = 0.0172;
        const maxDropV = V * 0.04; // 4%

        // S_drop = (2 * L * I * rho) / maxDropV (Monofasico/Bifasico simplificado 2 condutores carregados)
        const S_drop = (2 * L * I * rho) / maxDropV;

        // Capacidade de conducão (Tabela simplificada B1 - 2 condutores carregados PVC)
        // 1.5mm -> 17.5A
        // 2.5mm -> 24A
        // 4.0mm -> 32A
        // 6.0mm -> 41A
        // 10.mm -> 57A
        // 16.mm -> 76A
        const ampacityTable = [
            { gauge: 1.5, amp: 17.5 },
            { gauge: 2.5, amp: 24.0 },
            { gauge: 4.0, amp: 32.0 },
            { gauge: 6.0, amp: 41.0 },
            { gauge: 10.0, amp: 57.0 },
            { gauge: 16.0, amp: 76.0 },
            { gauge: 25.0, amp: 101.0 },
        ];

        // Encontrar bitola por Corrente
        let gaugeByAmp = 1.5;
        for (const row of ampacityTable) {
            if (I <= row.amp) {
                gaugeByAmp = row.gauge;
                break;
            } else {
                gaugeByAmp = 25.0; // Fallback max
            }
        }

        // Bitola final é o MAIOR entre (Queda de tensão e Capacidade)
        const finalGaugeRaw = Math.max(S_drop, gaugeByAmp);

        // Normalizar para comercial
        const commercialGauges = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50];
        let finalGauge = commercialGauges.find(g => g >= finalGaugeRaw) || 50;

        setResult({
            gauge: finalGauge.toString(),
            drop: (2 * L * I * rho / finalGauge) // Recalcula drop real
        });
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Calculadora de Bitola de Cabo</h2>

            <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tensão (Volts)</label>
                    <select
                        value={voltage}
                        onChange={e => setVoltage(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white"
                    >
                        <option value="127">127V (Monofásico)</option>
                        <option value="220">220V (Bifásico/Mono)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Potência Total (Watts)</label>
                    <input
                        type="number"
                        placeholder="Ex: 5500 (Chuveiro)"
                        value={power}
                        onChange={e => setPower(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Distância (Metros)</label>
                    <input
                        type="number"
                        placeholder="Ex: 15"
                        value={distance}
                        onChange={e => setDistance(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200"
                    />
                </div>

                <button
                    onClick={calculate}
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-200"
                >
                    <RefreshCw size={20} />
                    Calcular Bitola
                </button>
            </div>

            {result && (
                <div className="mt-8 animate-in slide-in-from-bottom duration-500">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Cable size={100} />
                        </div>

                        <p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-2">Resultado Recomendado</p>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-5xl font-black">{result.gauge}</span>
                            <span className="text-2xl font-medium">mm²</span>
                        </div>

                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20 text-sm">
                            <p>Corrente Calculada: <strong>{Math.round(parseFloat(power) / parseFloat(voltage))} A</strong></p>
                            <p>Queda de Tensão Estimada: <strong>{result.drop.toFixed(2)} V</strong></p>
                        </div>
                    </div>

                    <button className="mt-4 w-full bg-white border border-gray-200 text-blue-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50">
                        Buscar Cabos {result.gauge}mm <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
