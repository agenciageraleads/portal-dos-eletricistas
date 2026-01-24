import { Injectable, UnauthorizedException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../common/email.service';
import { isValidCpfCnpj } from '../common/validators/cpf-cnpj.validator';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private emailService: EmailService,
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
        // DEBUG TRIGGER
        if (true) throw new BadRequestException('DEBUG: REACHED SERVICE START ' + JSON.stringify(data));
        try {
            console.log('[REGISTER] Dados recebidos:', {
                name: data.name,
                email: data.email,
                cpf_cnpj: data.cpf_cnpj,
                phone: data.phone,
                hasPassword: !!data.password
            });

            // Email é obrigatório
            if (!data.email) {
                console.error('[REGISTER] Erro: Email é obrigatório');
                throw new ConflictException('Email é obrigatório');
            }

            // Limpar CPF/CNPJ caso venha formatado
            if (data.cpf_cnpj) {
                data.cpf_cnpj = data.cpf_cnpj.replace(/\D/g, '');
                console.log('[REGISTER] CPF/CNPJ limpo:', data.cpf_cnpj);

                // Validar CPF/CNPJ
                if (!isValidCpfCnpj(data.cpf_cnpj)) {
                    console.warn('[REGISTER] CPF/CNPJ inválido:', data.cpf_cnpj);
                    throw new BadRequestException('CPF/CNPJ inválido');
                }
            }

            // Verifica duplicidade de Email
            const existingEmail = await this.prisma.user.findUnique({ where: { email: data.email } });
            if (existingEmail) {
                console.warn('[REGISTER] Email já existe:', data.email);
                throw new ConflictException('Email já cadastrado');
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

            // Tratamento LGPD
            let termsDate = null;
            if (data.termsAccepted) {
                termsDate = new Date();
                delete data.termsAccepted; // Remove para não quebrar o Prisma
            }

            const userData = {
                ...data,
                password: hashedPassword,
                terms_accepted_at: termsDate,
            };

            console.log('[REGISTER] Criando usuário:', { email: data.email, cpf_cnpj: data.cpf_cnpj });

            const user = await this.prisma.user.create({
                data: userData,
            });

            console.log('[REGISTER] Usuário criado com sucesso:', user.id);

            const { password, ...result } = user;
            return result;
        } catch (error) {
            console.error('[REGISTER] Erro ao registrar:', error);
            // DEBUG: Exposing error to client to debug 500
            // @ts-ignore
            throw new BadRequestException(`Debug Error: ${error?.message || JSON.stringify(error)}`);
        }
    }

    // (Removed BundleError class)

    async requestPasswordReset(identifier: string) {
        // Find user by email or CPF/CNPJ
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { cpf_cnpj: identifier }
                ]
            }
        });

        if (!user) {
            // Don't reveal if user exists or not (security)
            return { message: 'Se o usuário existir, um código foi enviado para o email cadastrado.' };
        }

        // Generate 6-digit code
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry

        // Save token to database
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                reset_token: resetToken,
                reset_token_expires: expiresAt
            }
        });

        // Send email with token
        try {
            await this.emailService.sendPasswordResetCode(user.email, resetToken);
        } catch (error) {
            console.error('[PASSWORD RESET] Erro ao enviar email:', error);
            // Don't fail the request if email fails
        }

        return { message: 'Código de recuperação enviado para seu email.' };
    }

    async resetPassword(token: string, newPassword: string) {
        // Find user with matching token that hasn't expired
        const user = await this.prisma.user.findFirst({
            where: {
                reset_token: token,
                reset_token_expires: {
                    gte: new Date() // Greater than or equal to now (not expired)
                }
            }
        });

        if (!user) {
            throw new UnauthorizedException('Código inválido ou expirado');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                reset_token: null,
                reset_token_expires: null
            }
        });

        console.log(`[PASSWORD RESET] Senha alterada com sucesso para usuário: ${user.email}`);

        return { message: 'Senha alterada com sucesso!' };
    }
}
