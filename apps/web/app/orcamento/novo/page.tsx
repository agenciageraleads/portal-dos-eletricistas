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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Option 1: Full Budget */}
                    <Link
                        href="/orcamento?mode=full"
                        className="group bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-row md:flex-col items-center text-left md:text-center gap-2.5 h-20 md:h-auto"
                    >
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 text-blue-600 rounded-lg md:rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <PackagePlus className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <h2 className="text-sm font-bold text-gray-900 leading-tight">Completo</h2>
                                <span className="text-blue-600 font-bold text-[8px] bg-blue-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                    Recomendado
                                </span>
                            </div>
                            <p className="text-gray-500 text-[10px] leading-tight line-clamp-1">
                                Produtos + Mão de Obra
                            </p>
                        </div>
                    </Link>

                    {/* Option 2: Labor Only */}
                    <Link
                        href="/orcamento?mode=labor"
                        className="group bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 hover:border-green-500 hover:shadow-md transition-all cursor-pointer flex flex-row md:flex-col items-center text-left md:text-center gap-2.5 h-20 md:h-auto"
                    >
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-green-50 text-green-600 rounded-lg md:rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <HardHat className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-bold text-gray-900 mb-0.5 leading-tight">Mão de Obra</h2>
                            <p className="text-gray-500 text-[10px] leading-tight line-clamp-1">
                                Apenas serviço
                            </p>
                        </div>
                    </Link>

                    {/* Option 3: Products Only */}
                    <Link
                        href="/catalogo?mode=product"
                        className="group bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer flex flex-row md:flex-col items-center text-left md:text-center gap-2.5 h-20 md:h-auto"
                    >
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-50 text-purple-600 rounded-lg md:rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <PackagePlus className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-bold text-gray-900 mb-0.5 leading-tight">Só Produtos</h2>
                            <p className="text-gray-500 text-[10px] leading-tight line-clamp-1">
                                Lista de materiais
                            </p>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="mt-12 text-center text-sm text-gray-400">
                <p>Você poderá alterar essa escolha a qualquer momento.</p>
            </div>
        </div>
    );
}
