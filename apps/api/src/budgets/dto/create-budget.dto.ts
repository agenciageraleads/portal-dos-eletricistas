import { Type, Transform } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString, Min, ValidateNested, Matches, IsOptional, IsBoolean } from 'class-validator';

export class CreateBudgetItemDto {
    @IsString()
    @IsOptional()
    productId?: string;

    @IsBoolean()
    @IsOptional()
    isExternal?: boolean;

    @IsString()
    @IsOptional()
    customName?: string;

    @IsString()
    @IsOptional()
    customPhotoUrl?: string;

    @IsString()
    @IsOptional()
    suggestedSource?: string;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsNumber()
    @Min(0)
    price: number;
}

export class CreateBudgetDto {
    @IsString()
    @IsNotEmpty()
    clientName: string;

    @Transform(({ value }) => value.replace(/\D/g, '')) // Remove non-digits
    @IsString()
    @Matches(/^(\d{10,11})$/, { message: 'clientPhone must contain only 10 or 11 digits (DDD + Number)' })
    @IsNotEmpty()
    clientPhone: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateBudgetItemDto)
    items: CreateBudgetItemDto[];

    @IsNumber()
    @Min(0)
    laborValue: number;

    @IsString()
    @IsOptional()
    laborDescription?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsOptional()
    showUnitPrices?: boolean;

    @IsOptional()
    showLaborTotal?: boolean;

    @IsString({ message: 'Status deve ser "DRAFT" ou "SHARED"' })
    @IsOptional()
    status?: 'DRAFT' | 'SHARED';

    // Campos de Condições
    @IsString({ message: 'Prazo de execução deve ser um texto' })
    @IsOptional()
    executionTime?: string;

    @IsString({ message: 'Condições de pagamento deve ser um texto' })
    @IsOptional()
    paymentTerms?: string;

    @IsString({ message: 'Validade da proposta deve ser um texto' })
    @IsOptional()
    validity?: string;

    @IsString({ message: 'Garantia deve ser um texto' })
    @IsOptional()
    warranty?: string;
}
