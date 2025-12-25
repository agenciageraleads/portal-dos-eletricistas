
import { Product } from './product';

export interface BudgetItem {
    id: string;
    quantity: number;
    price: string; // Decimal vem como string do backend as vezes, ou number. Prisma Decimal -> string em JSON? Mofiquei para string para ser seguro ou number.
    product: Product;
}

export interface BudgetUser {
    name: string;
    phone: string;
    email: string;
}

export interface Budget {
    id: string;
    total_materials: string;
    total_labor: string;
    total_price: string;
    items: BudgetItem[];
    user: BudgetUser;
    createdAt: string;
}
