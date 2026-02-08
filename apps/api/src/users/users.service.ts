import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { isValidCpfCnpj } from '../common/validators/cpf-cnpj.validator';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        const protectedEmail = process.env.ADMIN_EMAIL || 'lucasborgessb@gmail.com';
        const protectedCpf = process.env.ADMIN_CPF || '03312918197';

        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: protectedEmail },
                    { cpf_cnpj: protectedCpf }
                ]
            },
            select: { id: true, role: true }
        });

        if (user && user.role !== 'ADMIN') {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { role: 'ADMIN' }
            });
        }
    }

    async updateProfile(userId: string, data: UpdateProfileDto) {
        try {
            console.log('Updating profile for user:', userId, 'Data:', data);
            const current = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!current) {
                throw new BadRequestException('Usuário não encontrado');
            }

            let normalizedCpfCnpj = data.cpf_cnpj;
            if (data.cpf_cnpj) {
                normalizedCpfCnpj = data.cpf_cnpj.replace(/\D/g, '');
                if (!isValidCpfCnpj(normalizedCpfCnpj)) {
                    throw new BadRequestException('CPF/CNPJ inválido');
                }
            }

            const merged = {
                ...current,
                ...data,
                cpf_cnpj: normalizedCpfCnpj ?? current.cpf_cnpj
            };

            const shouldFinalize = !!(merged.name && merged.email && merged.phone && merged.city && merged.state);

            return await this.prisma.user.update({
                where: { id: userId },
                data: {
                    ...data,
                    cpf_cnpj: normalizedCpfCnpj,
                    cadastro_finalizado: shouldFinalize ? true : current.cadastro_finalizado,
                    pre_cadastrado: shouldFinalize ? false : current.pre_cadastrado,
                    activatedAt: shouldFinalize && !current.activatedAt ? new Date() : current.activatedAt,
                    status: shouldFinalize ? 'ACTIVE' : current.status
                },
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    async findById(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                cpf_cnpj: true,
                role: true,
                bio: true,
                pix_key: true,
                city: true,
                state: true,
                isAvailableForWork: true,
                logo_url: true,
                business_name: true,
                specialties: true,
                specialties_public: true,
                experience_years: true,
                experience_public: true,
                certifications: true,
                certifications_public: true,
                cadastro_finalizado: true,
                pre_cadastrado: true,
                _count: {
                    select: { budgets: true }
                }
            }
        });
    }

    // Admin: List all users (v1.2.0)
    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                logo_url: true,
                createdAt: true,
                _count: {
                    select: { budgets: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Admin: Update user role (v1.2.0)
    async updateRole(userId: string, role: 'ELETRICISTA' | 'ADMIN') {
        const protectedEmail = process.env.ADMIN_EMAIL || 'lucasborgessb@gmail.com';
        const protectedCpf = process.env.ADMIN_CPF || '03312918197';

        const protectedUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: protectedEmail },
                    { cpf_cnpj: protectedCpf }
                ]
            },
            select: { id: true }
        });

        if (protectedUser && protectedUser.id === userId) {
            role = 'ADMIN';
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: { role }
        });
    }

    async updateAmbassador(userId: string, isAmbassador: boolean) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                is_ambassador: isAmbassador,
                ambassador_rank: isAmbassador ? undefined : null
            }
        });
    }

    // Admin: Generate Reset Token manually
    async generateManualResetToken(userId: string) {
        // Generate 6-digit code
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // Valid for 1 hour

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                reset_token: token,
                reset_token_expires: expires
            }
        });

        return { token };
    }

    // Admin: Soft delete user (block + remove from listings)
    async deleteUser(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                status: 'BLOCKED',
                isAvailableForWork: false,
                pre_cadastrado: false,
                cadastro_finalizado: false,
                is_ambassador: false,
                ambassador_rank: null
            }
        });
    }

    // Helper to fix ALL CAPS names from legacy systems
    private normalizeName(name: string): string {
        if (!name) return name;
        return name
            .toLowerCase()
            .split(' ')
            .map(word => {
                // Keep prepositions lowercase (de, da, dos, e)
                if (['de', 'da', 'do', 'das', 'dos', 'e'].includes(word)) return word;
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    }

    // Services: Find available electricians (v2.0)
    async findAvailable(city?: string, search?: string) {
        const isFeatureEnabled = process.env.FEATURE_PRE_REG_DISABLED !== 'true';
        const cityTerm = city?.trim();
        const searchTerm = search?.trim();

        const availabilityCondition = isFeatureEnabled
            ? Prisma.sql`(u."isAvailableForWork" = true OR u.pre_cadastrado = true)`
            : Prisma.sql`(u."isAvailableForWork" = true)`;

        const filters: Prisma.Sql[] = [];
        if (cityTerm) {
            filters.push(Prisma.sql`u.city ILIKE ${`%${cityTerm}%`}`);
        }
        if (searchTerm) {
            filters.push(Prisma.sql`(u.name ILIKE ${`%${searchTerm}%`} OR u.city ILIKE ${`%${searchTerm}%`})`);
        }

        const users = await this.prisma.$queryRaw<
            Array<{
                id: string;
                name: string;
                city: string | null;
                state: string | null;
                logo_url: string | null;
                phone: string | null;
                isAvailableForWork: boolean;
                pre_cadastrado: boolean;
                cadastro_finalizado: boolean;
                commercial_index: number | null;
                is_ambassador: boolean;
                ambassador_rank: number | null;
                budgets_count: number;
                rank: number;
            }>
        >(Prisma.sql`
            WITH base AS (
                SELECT
                    u.id,
                    u.name,
                    u.city,
                    u.state,
                    u.logo_url,
                    u.phone,
                    u."isAvailableForWork",
                    u.pre_cadastrado,
                    u.cadastro_finalizado,
                    u.commercial_index,
                    u.is_ambassador,
                    u.ambassador_rank,
                    COALESCE(b.budgets_count, 0) AS budgets_count,
                    ROW_NUMBER() OVER (
                        ORDER BY
                            CASE WHEN u.is_ambassador THEN 0 ELSE 1 END ASC,
                            CASE WHEN u.is_ambassador THEN COALESCE(u.ambassador_rank, 9999) ELSE 9999 END ASC,
                            CASE WHEN u.cadastro_finalizado THEN 0 ELSE 1 END ASC,
                            CASE WHEN u.logo_url IS NOT NULL THEN 0 ELSE 1 END ASC,
                            COALESCE(b.budgets_count, 0) DESC,
                            u.commercial_index DESC NULLS LAST,
                            u.name ASC
                    ) AS rank
                FROM users u
                LEFT JOIN (
                    SELECT "userId" AS user_id, COUNT(*)::int AS budgets_count
                    FROM budgets
                    GROUP BY "userId"
                ) b ON b.user_id = u.id
                WHERE u.role = 'ELETRICISTA'
                  AND ${availabilityCondition}
            )
            SELECT *
            FROM base
            ${filters.length ? Prisma.sql`WHERE ${Prisma.join(filters, Prisma.sql` AND `)}` : Prisma.empty}
            ORDER BY rank ASC
        `);

        return users.map(user => ({
            ...user,
            name: this.normalizeName(user.name)
        }));
    }

    async getPublicProfile(id: string) {
        // Increment view count asynchronously
        this.prisma.user.update({
            where: { id },
            data: { view_count: { increment: 1 } }
        }).catch(err => console.error('Error incrementing view_count:', err));

        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                business_name: true,
                city: true,
                state: true,
                bio: true,
                logo_url: true,
                role: true,
                phone: true,
                cadastro_finalizado: true,
                commercial_index: true,
                is_ambassador: true,
                ambassador_rank: true,
                total_orders: true,
                view_count: true,
                specialties: true,
                specialties_public: true,
                experience_years: true,
                experience_public: true,
                certifications: true,
                certifications_public: true,
                createdAt: true,
            }
        });

        if (!user) {
            return null;
        }

        const rankResult = await this.prisma.$queryRaw<
            { rank: number }[]
        >(Prisma.sql`
            SELECT rank
            FROM (
                SELECT
                    u.id,
                    ROW_NUMBER() OVER (
                        ORDER BY
                            CASE WHEN u.is_ambassador THEN 0 ELSE 1 END ASC,
                            CASE WHEN u.is_ambassador THEN COALESCE(u.ambassador_rank, 9999) ELSE 9999 END ASC,
                            CASE WHEN u.cadastro_finalizado THEN 0 ELSE 1 END ASC,
                            CASE WHEN u.logo_url IS NOT NULL THEN 0 ELSE 1 END ASC,
                            COALESCE(b.budgets_count, 0) DESC,
                            u.commercial_index DESC NULLS LAST,
                            u.name ASC
                    ) AS rank
                FROM users u
                LEFT JOIN (
                    SELECT "userId" AS user_id, COUNT(*)::int AS budgets_count
                    FROM budgets
                    GROUP BY "userId"
                ) b ON b.user_id = u.id
                WHERE u.role = 'ELETRICISTA'
                  AND (u."isAvailableForWork" = true OR u.pre_cadastrado = true)
            ) ranked
            WHERE id = ${id}
            LIMIT 1
        `);
        const rank = rankResult[0]?.rank ?? null;

        // Hide fields that are not public
        const publicUser = {
            ...user,
            specialties: user.specialties_public ? user.specialties : null,
            experience_years: user.experience_public ? user.experience_years : null,
            certifications: user.certifications_public ? user.certifications : null,
            rank,
            name: this.normalizeName(user.name)
        };

        return publicUser;
    }

    async getPeerProfile(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                business_name: true,
                city: true,
                state: true,
                bio: true,
                logo_url: true,
                role: true,
                phone: true,
                cadastro_finalizado: true,
                commercial_index: true,
                is_ambassador: true,
                ambassador_rank: true,
                total_orders: true,
                view_count: true,
                specialties: true,
                specialties_public: true,
                experience_years: true,
                experience_public: true,
                certifications: true,
                certifications_public: true,
                createdAt: true,
            }
        });

        if (!user) {
            return null;
        }

        const rankResult = await this.prisma.$queryRaw<
            { rank: number }[]
        >(Prisma.sql`
            SELECT rank
            FROM (
                SELECT
                    u.id,
                    ROW_NUMBER() OVER (
                        ORDER BY
                            CASE WHEN u.is_ambassador THEN 0 ELSE 1 END ASC,
                            CASE WHEN u.is_ambassador THEN COALESCE(u.ambassador_rank, 9999) ELSE 9999 END ASC,
                            CASE WHEN u.cadastro_finalizado THEN 0 ELSE 1 END ASC,
                            CASE WHEN u.logo_url IS NOT NULL THEN 0 ELSE 1 END ASC,
                            COALESCE(b.budgets_count, 0) DESC,
                            u.commercial_index DESC NULLS LAST,
                            u.name ASC
                    ) AS rank
                FROM users u
                LEFT JOIN (
                    SELECT "userId" AS user_id, COUNT(*)::int AS budgets_count
                    FROM budgets
                    GROUP BY "userId"
                ) b ON b.user_id = u.id
                WHERE u.role = 'ELETRICISTA'
                  AND (u."isAvailableForWork" = true OR u.pre_cadastrado = true)
            ) ranked
            WHERE id = ${id}
            LIMIT 1
        `);
        const rank = rankResult[0]?.rank ?? null;

        return {
            ...user,
            rank,
            name: this.normalizeName(user.name)
        };
    }

    async count() {
        // Count only finalized registrations or all? 
        // For gamification/social proof, counting all valid emails is usually better.
        // Assuming we want 'users' not just electricians.
        return { count: await this.prisma.user.count() };
    }
}
