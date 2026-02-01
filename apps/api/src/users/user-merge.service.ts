import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserMergeService {
    private readonly logger = new Logger(UserMergeService.name);

    constructor(private prisma: PrismaService) { }

    @Cron('0 */6 * * *')
    async mergeDuplicateCpfCnpj() {
        try {
            const groups = await this.prisma.user.groupBy({
                by: ['cpf_cnpj'],
                where: {
                    cpf_cnpj: { not: null }
                },
                _count: { _all: true },
                having: {
                    cpf_cnpj: { _count: { gt: 1 } }
                }
            });

            if (!groups.length) return;

            for (const group of groups) {
                const cpfCnpj = group.cpf_cnpj as string;
                const users = await this.prisma.user.findMany({
                    where: { cpf_cnpj: cpfCnpj },
                    orderBy: [
                        { cadastro_finalizado: 'desc' },
                        { activatedAt: 'desc' },
                        { createdAt: 'asc' }
                    ]
                });

                if (users.length < 2) continue;

                const [primary, ...duplicates] = users;
                for (const duplicate of duplicates) {
                    await this.mergeIntoPrimary(primary.id, duplicate.id);
                }
            }
        } catch (error) {
            this.logger.error('Erro ao unificar cadastros duplicados', error as Error);
        }
    }

    private async mergeIntoPrimary(primaryId: string, duplicateId: string) {
        if (primaryId === duplicateId) return;

        const [primary, duplicate] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: primaryId } }),
            this.prisma.user.findUnique({ where: { id: duplicateId } })
        ]);

        if (!primary || !duplicate) return;

        const mergedData: Record<string, any> = {
            name: primary.name || duplicate.name,
            email: primary.email || duplicate.email,
            phone: primary.phone || duplicate.phone,
            bio: primary.bio || duplicate.bio,
            logo_url: primary.logo_url || duplicate.logo_url,
            pix_key: primary.pix_key || duplicate.pix_key,
            business_name: primary.business_name || duplicate.business_name,
            city: primary.city || duplicate.city,
            state: primary.state || duplicate.state,
            specialties: primary.specialties || duplicate.specialties,
            certifications: primary.certifications || duplicate.certifications,
            experience_years: primary.experience_years ?? duplicate.experience_years,
            cadastro_finalizado: primary.cadastro_finalizado || duplicate.cadastro_finalizado,
            pre_cadastrado: primary.pre_cadastrado && !primary.cadastro_finalizado,
            activatedAt: primary.activatedAt || duplicate.activatedAt,
            isAvailableForWork: primary.isAvailableForWork || duplicate.isAvailableForWork
        };

        await this.prisma.user.update({
            where: { id: primaryId },
            data: mergedData
        });

        await this.prisma.budget.updateMany({
            where: { userId: duplicateId },
            data: { userId: primaryId }
        });

        await this.prisma.aiMatchFeedback.updateMany({
            where: { userId: duplicateId },
            data: { userId: primaryId }
        });

        await this.prisma.serviceListing.updateMany({
            where: { userId: duplicateId },
            data: { userId: primaryId }
        });

        await this.prisma.serviceSuggestion.updateMany({
            where: { suggestedBy: duplicateId },
            data: { suggestedBy: primaryId }
        });

        await this.prisma.feedback.updateMany({
            where: { userId: duplicateId },
            data: { userId: primaryId }
        });

        await this.prisma.notification.updateMany({
            where: { userId: duplicateId },
            data: { userId: primaryId }
        });

        await this.prisma.pushSubscription.updateMany({
            where: { userId: duplicateId },
            data: { userId: primaryId }
        });

        await this.prisma.chatMessage.updateMany({
            where: { userId: duplicateId },
            data: { userId: primaryId }
        });

        await this.prisma.chatSession.updateMany({
            where: { userId: duplicateId },
            data: { userId: primaryId }
        });

        const duplicateLeads = await this.prisma.serviceLead.findMany({
            where: { userId: duplicateId },
            select: { serviceListingId: true }
        });

        if (duplicateLeads.length) {
            const listingIds = duplicateLeads.map(l => l.serviceListingId);
            const primaryLeads = await this.prisma.serviceLead.findMany({
                where: {
                    userId: primaryId,
                    serviceListingId: { in: listingIds }
                },
                select: { serviceListingId: true }
            });
            const conflicts = new Set(primaryLeads.map(l => l.serviceListingId));
            if (conflicts.size) {
                await this.prisma.serviceLead.deleteMany({
                    where: {
                        userId: duplicateId,
                        serviceListingId: { in: Array.from(conflicts) }
                    }
                });
            }
            await this.prisma.serviceLead.updateMany({
                where: { userId: duplicateId },
                data: { userId: primaryId }
            });
        }

        const duplicateContacts = await this.prisma.clientContact.findMany({
            where: { userId: duplicateId }
        });

        for (const contact of duplicateContacts) {
            await this.prisma.clientContact.upsert({
                where: {
                    userId_normalized_name_normalized_phone: {
                        userId: primaryId,
                        normalized_name: contact.normalized_name,
                        normalized_phone: contact.normalized_phone
                    }
                },
                update: {
                    name: contact.name,
                    phone: contact.phone,
                    last_used_at: contact.last_used_at
                },
                create: {
                    userId: primaryId,
                    name: contact.name,
                    phone: contact.phone,
                    normalized_name: contact.normalized_name,
                    normalized_phone: contact.normalized_phone,
                    last_used_at: contact.last_used_at
                }
            });
        }

        await this.prisma.clientContact.deleteMany({
            where: { userId: duplicateId }
        });

        await this.prisma.user.delete({ where: { id: duplicateId } });
    }
}
