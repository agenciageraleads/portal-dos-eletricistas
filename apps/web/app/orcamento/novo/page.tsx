'use client';

import Link from 'next/link';
import { PackagePlus, HardHat, ArrowLeft } from 'lucide-react';

export default function BudgetTypeSelection() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 -ml-2 text-gray-600 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Novo Orçamento</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    {/* Option 1: Full Budget */}
                    <Link
                        href="/orcamento?mode=full"
                        className="group bg-white p-6 md:p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center"
                    >
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <PackagePlus size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Produtos + Mão de Obra</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Crie uma lista de materiais completa usando nosso catálogo e adicione o valor do seu serviço.
                        </p>
                        <span className="mt-6 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-full">
                            Recomendado
                        </span>
                    </Link>

                    {/* Option 2: Labor Only */}
                    <Link
                        href="/orcamento?mode=labor"
                        className="group bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-green-500 hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center"
                    >
                        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <HardHat size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Apenas Mão de Obra</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Orçamento simplificado apenas para descrever e cobrar pelo seu serviço executado.
                        </p>
                    </Link>

                    {/* Option 3: Products Only */}
                    <Link
                        href="/catalogo?mode=product"
                        className="group bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-purple-500 hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center md:col-span-2 lg:col-span-1"
                    >
                        <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <PackagePlus size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Apenas Produtos</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Crie uma lista de materiais simples, sem incluir valores de mão de obra.
                        </p>
                    </Link>
                </div>

                <div className="mt-12 text-center text-sm text-gray-400">
                    <p>Você poderá alterar essa escolha a qualquer momento.</p>
                </div>
            </div>
        </div>
    );
}
