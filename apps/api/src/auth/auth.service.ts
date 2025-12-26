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
        try {
            console.log('[REGISTER] Dados recebidos:', {
                name: data.name,
                cpf_cnpj: data.cpf_cnpj,
                phone: data.phone,
                hasPassword: !!data.password
            });

            // Limpar CPF/CNPJ caso venha formatado (garantia extra)
            if (data.cpf_cnpj) {
                data.cpf_cnpj = data.cpf_cnpj.replace(/\D/g, '');
                console.log('[REGISTER] CPF/CNPJ limpo:', data.cpf_cnpj);
            }

            // Se não vier email, gera um dummy baseado no CPF/CNPJ
            // Formato dummy: cpf@usuario.portal
            let emailToUse = data.email;

            if (!emailToUse && data.cpf_cnpj) {
                const cleanCpf = data.cpf_cnpj.replace(/\D/g, '');
                emailToUse = `${cleanCpf}@usuario.portal`;
                console.log('[REGISTER] Email gerado:', emailToUse);
            }

            if (!emailToUse) {
                console.error('[REGISTER] Erro: Email ou CPF é obrigatório');
                throw new ConflictException('Email ou CPF é obrigatório');
            }

            // Verifica duplicidade de Email
            const existingEmail = await this.prisma.user.findUnique({ where: { email: emailToUse } });
            if (existingEmail) {
                console.warn('[REGISTER] Email já existe:', emailToUse);
                throw new ConflictException('Usuário já existe (Email/CPF duplicado)');
            }

            // Verifica duplicidade de CPF (se fornecido)
            if (data.cpf_cnpj) {
                const existingCpf = await this.prisma.user.findFirst({ where: { cpf_cnpj: data.cpf_cnpj } });
                if (existingCpf) {
                    console.warn('[REGISTER] CPF/CNPJ já existe:', data.cpf_cnpj);
                    throw new ConflictException('CPF/CNPJ já cadastrado');
                }
            }

            const hashedPassword = await bcrypt.hash(data.password, 10);

            const userData = {
                ...data,
                email: emailToUse,
                password: hashedPassword,
            };

            console.log('[REGISTER] Criando usuário:', { email: emailToUse, cpf_cnpj: data.cpf_cnpj });

            const user = await this.prisma.user.create({
                data: userData,
            });

            console.log('[REGISTER] Usuário criado com sucesso:', user.id);

            const { password, ...result } = user;
            return result;
        } catch (error) {
            console.error('[REGISTER] Erro ao registrar:', error);
            throw error;
        }
    }
}
