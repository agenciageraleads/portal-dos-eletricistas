import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    business_name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    cpf_cnpj?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    logo_url?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    pix_key?: string;

    @IsOptional()
    isAvailableForWork?: boolean;

    @IsOptional()
    @IsString()
    specialties?: string;

    @IsOptional()
    @IsBoolean()
    specialties_public?: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    experience_years?: number;

    @IsOptional()
    @IsBoolean()
    experience_public?: boolean;

    @IsOptional()
    @IsString()
    certifications?: string;

    @IsOptional()
    @IsBoolean()
    certifications_public?: boolean;
}
