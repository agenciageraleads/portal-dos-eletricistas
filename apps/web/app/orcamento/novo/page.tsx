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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Option 1: Full Budget */}
                    <Link
                        href="/orcamento?mode=full"
                        className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-row md:flex-col items-center text-left md:text-center gap-4 min-h-[6.5rem] md:min-h-[12rem]"
                    >
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 text-blue-600 rounded-xl md:rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <PackagePlus className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-base font-bold text-gray-900 leading-tight">Completo</h2>
                                <span className="text-blue-600 font-bold text-[10px] bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    Recomendado
                                </span>
                            </div>
                            <p className="text-gray-500 text-xs leading-tight line-clamp-2">
                                Produtos + Mão de Obra
                            </p>
                        </div>
                    </Link>

                    {/* Option 2: Labor Only */}
                    <Link
                        href="/orcamento?mode=labor"
                        className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-green-500 hover:shadow-md transition-all cursor-pointer flex flex-row md:flex-col items-center text-left md:text-center gap-4 min-h-[6.5rem] md:min-h-[12rem]"
                    >
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 text-green-600 rounded-xl md:rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <HardHat className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-base font-bold text-gray-900 mb-1 leading-tight">Mão de Obra</h2>
                            <p className="text-gray-500 text-xs leading-tight line-clamp-2">
                                Apenas serviço
                            </p>
                        </div>
                    </Link>

                    {/* Option 3: Products Only */}
                    <Link
                        href="/catalogo?mode=product"
                        className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer flex flex-row md:flex-col items-center text-left md:text-center gap-4 min-h-[6.5rem] md:min-h-[12rem]"
                    >
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-50 text-purple-600 rounded-xl md:rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <PackagePlus className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-base font-bold text-gray-900 mb-1 leading-tight">Só Produtos</h2>
                            <p className="text-gray-500 text-xs leading-tight line-clamp-2">
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
