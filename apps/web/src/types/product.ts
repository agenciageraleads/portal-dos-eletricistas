export interface Product {
    id: string;
    sankhya_code: number;
    name: string;
    price: string; // Decimal string
    description?: string;
    brand?: string;
    reference?: string;
    has_image: boolean;
    image_url?: string;
    createdAt?: string;
    updatedAt?: string;
}
