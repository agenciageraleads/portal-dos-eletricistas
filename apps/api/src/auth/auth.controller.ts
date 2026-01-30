import { Controller, Request, Post, UseGuards, Body, Get, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-recovery.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Throttle({ default: { limit: 20, ttl: 900000 } }) // 20 attempts per 15 minutes
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

    @Throttle({ default: { limit: 50, ttl: 3600000 } }) // 50 attempts per hour
    @Get('check-registration/:identifier')
    async checkRegistration(@Param('identifier') identifier: string) {
        return await this.authService.checkRegistration(identifier);
    }

    @Throttle({ default: { limit: 50, ttl: 3600000 } }) // 50 attempts per hour
    @Post('register')
    async register(@Body() createUserDto: any) {
        return await this.authService.register(createUserDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getProfile(@Request() req: any) {
        return req.user;
    }

    @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 attempts per hour
    @Post('forgot-password')
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.requestPasswordReset(dto.identifier);
    }

    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }
}
