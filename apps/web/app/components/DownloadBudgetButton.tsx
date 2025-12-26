'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { BudgetPdf } from './BudgetPdf';
import { FileDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export const DownloadBudgetButton = ({ budget }: { budget: any }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <button disabled className="flex-1 bg-white border border-gray-300 text-gray-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" />
                Carregando PDF...
            </button>
        );
    }

    return (
        <PDFDownloadLink
            document={<BudgetPdf budget={budget} />}
            fileName={`orcamento-${budget.client_name.replace(/\s+/g, '-').toLowerCase()}.pdf`}
            className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
            {/* @ts-ignore - The render prop signature in newer react-pdf versions can be tricky with TS */}
            {({ blob, url, loading, error }: any) => (
                <>
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <FileDown size={20} />}
                    {loading ? 'Gerando...' : 'Baixar PDF'}
                </>
            )}
        </PDFDownloadLink>
    );
};
