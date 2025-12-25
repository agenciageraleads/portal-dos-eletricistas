'use client';

import { Search } from 'lucide-react';

interface ProductSearchProps {
    onSearch: (query: string) => void;
}

export function ProductSearch({ onSearch }: ProductSearchProps) {
    return (
        <div className="relative mb-6">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <Search size={20} />
            </div>
            <input
                type="text"
                placeholder="O que você vai instalar hoje? (ex: cabo, disjuntor...)"
                className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg"
                onChange={(e) => onSearch(e.target.value)}
            />
        </div>
    );
}
