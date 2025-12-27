import { Controller, Request, Post, UseGuards, Body, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-recovery.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 attempts per 15 minutes
    @Post('login')
    async login(@Body() req: any) {
        // Aceita email, cpf_cnpj, ou um campo genérico 'username'
        const identifier = req.email || req.cpf_cnpj || req.username;
        if (!identifier) {
            throw new UnauthorizedException('Email ou CPF obrigatório');
        }

        const user = await this.authService.validateUser(identifier, req.password);
        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }
        return this.authService.login(user);
    }

    @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 attempts per hour
    @Post('register')
    async register(@Body() createUserDto: any) {
        return this.authService.register(createUserDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getProfile(@Request() req: any) {
        return req.user;
    }

    @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 attempts per hour
    @Post('forgot-password')
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.requestPasswordReset(dto.identifier);
    }

    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }
}
