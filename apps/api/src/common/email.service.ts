import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Configure Gmail SMTP
        // User needs to provide credentials in .env
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASSWORD;

        if (emailUser && emailPass) {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: emailUser,
                    pass: emailPass, // App Password, not regular password
                },
            });
            console.log('[EmailService] Gmail SMTP configurado');
        } else {
            console.warn('[EmailService] EMAIL_USER ou EMAIL_PASSWORD não configurados. Emails serão logados no console.');
        }
    }

    async sendPasswordResetCode(email: string, code: string) {
        const subject = 'Código de Recuperação de Senha - Portal do Eletricista';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563EB;">Portal do Eletricista</h2>
                <p>Você solicitou a recuperação de senha.</p>
                <p>Seu código de verificação é:</p>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <h1 style="color: #2563EB; font-size: 48px; letter-spacing: 8px; margin: 0;">${code}</h1>
                </div>
                <p style="color: #6b7280; font-size: 14px;">Este código expira em 15 minutos.</p>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                    Se você não solicitou esta recuperação, ignore este email.
                </p>
            </div>
        `;

        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: `"Portal do Eletricista" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject,
                    html,
                });
                console.log(`[EmailService] Email enviado para: ${email}`);
            } catch (error) {
                console.error('[EmailService] Erro ao enviar email:', error);
                throw error;
            }
        } else {
            // Fallback to console for MVP
            console.log(`\n========================================`);
            console.log(`[EMAIL] Para: ${email}`);
            console.log(`[EMAIL] Assunto: ${subject}`);
            console.log(`[EMAIL] Código: ${code}`);
            console.log(`========================================\n`);
        }
    }
}
