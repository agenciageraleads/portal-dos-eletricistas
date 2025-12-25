import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        // Busca por email OU cpf_cnpj
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: username },
                    { cpf_cnpj: username }
                ]
            }
        });

        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, name: user.name, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: payload,
        };
    }

    async register(data: any) {
        // Se não vier email, gera um dummy baseado no CPF/CNPJ
        // Formato dummy: cpf@usuario.portal
        let emailToUse = data.email;

        if (!emailToUse && data.cpf_cnpj) {
            const cleanCpf = data.cpf_cnpj.replace(/\D/g, '');
            emailToUse = `${cleanCpf}@usuario.portal`;
        }

        if (!emailToUse) {
            throw new ConflictException('Email ou CPF é obrigatório');
        }

        // Verifica duplicidade de Email
        const existingEmail = await this.prisma.user.findUnique({ where: { email: emailToUse } });
        if (existingEmail) {
            throw new ConflictException('Usuário já existe (Email/CPF duplicado)');
        }

        // Verifica duplicidade de CPF (se fornecido)
        if (data.cpf_cnpj) {
            const existingCpf = await this.prisma.user.findFirst({ where: { cpf_cnpj: data.cpf_cnpj } });
            if (existingCpf) {
                throw new ConflictException('CPF/CNPJ já cadastrado');
            }
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const userData = {
            ...data,
            email: emailToUse,
            password: hashedPassword,
        };

        const user = await this.prisma.user.create({
            data: userData,
        });

        const { password, ...result } = user;
        return result;
    }
}
