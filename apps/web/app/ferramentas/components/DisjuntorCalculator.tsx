'use client';

import { useState } from 'react';
import { ChevronRight, RefreshCw, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DisjuntorCalculator() {
    const router = useRouter();
    const [voltage, setVoltage] = useState('220');
    const [power, setPower] = useState('');
    const [result, setResult] = useState<{ amps: string; curve: string } | null>(null);

    const calculate = () => {
        const V = parseFloat(voltage);
        const P = parseFloat(power);

        if (!V || !P) return;

        // Corrente Nominal (In) = P / V
        const In = P / V;

        // Fator de segurança típico (1.25x para cargas resistivas contínuas ou geral)
        // Para chuveiro (resistivo puro), In já serve, mas disjuntor deve ser > In.
        // NBR 5410: Ib <= In <= Iz
        // Vamos simplificar: Disjuntor comercial imediatamente acima da corrente calculada.

        const commercialBreakers = [10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 100];

        // Encontrar o próximo comercial > In
        let recommended = commercialBreakers.find(b => b > In);

        // Se In for muito próximo do comercial (ex: calculou 31.8A, usar 32A é arriscado se temperatura alta).
        // Melhor dar uma margem minima de 5-10%?
        // Vamos usar regra simples: > In.

        if (!recommended) recommended = 100;

        // Curva
        // Chuveiro / Resistivo: Curva B
        // Ar Condicionado / Motor: Curva C
        // Vamos sugerir Curva C por ser o "Coringa" residencial, ou analisar a potência?
        // Geralmente residencial usa C para tomadas e B/C para iluminação.
        // Vamos sugerir C como padrão seguro.

        setResult({
            amps: recommended.toString(),
            curve: 'C'
        });
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Dimensionar Disjuntor</h2>

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
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Potência Total do Circuito (Watts)</label>
                    <input
                        type="number"
                        placeholder="Ex: 7500"
                        value={power}
                        onChange={e => setPower(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200"
                    />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-xs text-yellow-800">
                    <p>💡 <b>Dica:</b> Some a potência de todos os equipamentos que serão ligados neste circuito.</p>
                </div>

                <button
                    onClick={calculate}
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-200"
                >
                    <RefreshCw size={20} />
                    Calcular Disjuntor
                </button>
            </div>

            {result && (
                <div className="mt-8 animate-in slide-in-from-bottom duration-500">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap size={100} />
                        </div>

                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Disjuntor Recomendado</p>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-5xl font-black">{result.amps}A</span>
                            <span className="text-xl font-medium text-gray-400">Curva {result.curve}</span>
                        </div>

                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20 text-sm">
                            <p>Corrente Real: <strong>{(parseFloat(power) / parseFloat(voltage)).toFixed(1)} A</strong></p>
                            <p>Proteção: <strong>Circuito Geral / Tomadas</strong></p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push(`/catalogo?q=DISJUNTOR+${result.amps}A`)}
                        className="mt-4 w-full bg-white border border-gray-200 text-gray-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50"
                    >
                        Ver Disjuntores {result.amps}A <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
