import { Controller, Request, Post, UseGuards, Body, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
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

    @Post('register')
    async register(@Body() createUserDto: any) {
        return this.authService.register(createUserDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getProfile(@Request() req: any) {
        return req.user;
    }
}
