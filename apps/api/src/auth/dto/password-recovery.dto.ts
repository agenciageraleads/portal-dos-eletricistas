import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {
    @IsString()
    @IsNotEmpty()
    identifier: string; // CPF/CNPJ or Email
}

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    token: string; // 6-digit code

    @IsString()
    @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    newPassword: string;
}
