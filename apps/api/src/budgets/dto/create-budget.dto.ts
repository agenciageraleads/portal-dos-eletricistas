import { Type, Transform } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString, Min, ValidateNested, Matches, IsOptional } from 'class-validator';

export class CreateBudgetItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

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
    status?: 'DRAFT' | 'SHARED';
}
