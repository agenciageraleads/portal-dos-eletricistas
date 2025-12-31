'use client';

/* NO CHANGE HERE YET, WILL DO IN PAGE.TSX */

import { Search, X } from 'lucide-react';
import { useRef } from 'react';

interface ProductSearchProps {
    onSearch: (query: string) => void;
}

export function ProductSearch({ onSearch }: ProductSearchProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClear = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            onSearch('');
            inputRef.current.focus();
        }
    };

    return (
        <div className="relative mb-6">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <Search size={20} />
            </div>
            <input
                ref={inputRef}
                type="text"
                placeholder="O que você vai instalar hoje? (ex: cabo, disjuntor...)"
                className="w-full pl-10 pr-10 py-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg"
                onChange={(e) => onSearch(e.target.value)}
            />
            <button
                onClick={handleClear}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                title="Limpar busca"
            >
                <X size={20} />
            </button>
        </div>
    );
}
