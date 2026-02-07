'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ContractPdf } from './ContractPdf';

export const DownloadContractButton = ({ budget }: { budget: any }) => {
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
      document={<ContractPdf budget={budget} />}
      fileName={`contrato-${budget.client_name?.replace(/\s+/g, '-').toLowerCase() || 'cliente'}.pdf`}
      className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
    >
      {/* @ts-ignore */}
      {({ loading }: any) => (
        <>
          {loading ? <Loader2 size={20} className="animate-spin" /> : <FileDown size={20} />}
          {loading ? 'Gerando...' : 'Baixar Contrato'}
        </>
      )}
    </PDFDownloadLink>
  );
};
