export interface Product {
    id: string;
    name: string;
    price: string; // Decimal vem como string da API por padrão
    unit?: string;
    image_url?: string;
    sankhya_code: number;
    is_available: boolean;
    brand?: string;
    category?: string;
}
