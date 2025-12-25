export interface SankhyaProduct {
    CODPROD: number;
    DESCRPROD: string;
    VLRVENDA: number;
    CODVOL: string;
    MARCA?: string;
    ATIVO: 'S' | 'N';
    ESTOQUE?: number;
    DTALTER?: string;
}

export interface SankhyaProductsRequest {
    serviceName: 'CRUDServiceProvider.loadRecords';
    requestBody: {
        dataSet: {
            rootEntity: 'Produto';
            includePresentationFields: string;
            offsetPage?: number;
            maxResults?: number;
        };
    };
}

export interface SankhyaProductsResponse {
    responseBody: {
        rows: SankhyaProduct[];
        total: number;
    };
}
