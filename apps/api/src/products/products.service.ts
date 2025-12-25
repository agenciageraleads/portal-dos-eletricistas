import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    private readonly ABBREVIATIONS: Record<string, string[]> = {
        'TOMADA': ['TOM', 'TOM.'],
        'MODULO': ['MOD', 'MOD.', 'MÓDULO'],
        'CAIXA': ['CX', 'CX.', 'CXA', 'CX.'],
        'QUADRO': ['QD', 'QD.', 'QDR', 'QUAD'],
        'DISJUNTOR': ['DISJ', 'DISJ.', 'DISJUN', 'DR', 'D.R'],
        'INTERRUPTOR': ['INT', 'INT.'],
        'PLACA': ['PL', 'PL.', 'ESPELHO'],
        'CABO': ['CB', 'CAB', 'FIO'],
        'FIO': ['CABO', 'FIL'],
        'EMBUTIR': ['EMB', 'EMB.'],
        'SOBREPOR': ['SOB', 'SOB.', 'EXTERNO'],
        'AMPERES': ['A'],
        'WATTS': ['W'],
        'METRO': ['M', 'MT'],
        'CANALETA': ['CANAL'],
        'PRESA': ['PRES'],
    };

    private readonly MISSPELLINGS: Record<string, string> = {
        'FIL': 'FIO',
        'CUADRADA': 'QUADRADO',
        'QUADRADA': 'QUADRO', // Contexto dependente, mas ajuda
        'LAMPADA': 'LAMP',
        'INTERUPTOR': 'INTERRUPTOR',
        'DISJUNTO': 'DISJUNTOR',
    };

    private readonly SYNONYMS: Record<string, string[]> = {
        'FIO': ['CABO'],
        'CABO': ['FIO'],
        'DISJUNTOR': ['DISJ', 'DJ'],
        'TOMADA': ['TOM'],
        'MODULO': ['TOMADA', 'INTERRUPTOR'], // Às vezes buscado junto
        'LAMPADA': ['LAMP', 'LED'],
    };

    async findAll(query?: string, page: number = 1, limit: number = 20, category?: string) {
        const skip = (page - 1) * limit;
        const take = limit;
        const where: Prisma.ProductWhereInput = {};

        if (category) {
            where.category = { equals: category, mode: 'insensitive' };
        }

        if (query) {
            // ... (rest of the logic)
            // Normalizar query para maiúsculas e remover espaços extras
            let normalizedQuery = query.toUpperCase().trim();

            // 1. Tokenização Básica para tratar palavras compostas
            // Ex: "Modulo Tomada" -> ["MODULO", "TOMADA"]
            const tokens = normalizedQuery.split(/\s+/);

            // Estratégia: Para CADA token, encontrar suas variações
            // E criar um grupo de condições que devem ser atendidas (AND entre tokens, OR entre variações do token)
            // Alterado de Global OR para Global AND para aumentar precisão.

            const andConditions: Prisma.ProductWhereInput[] = [];

            tokens.forEach(token => {
                const tokenVariations = new Set<string>();
                tokenVariations.add(token);

                // Check Misspellings
                let corrected = this.MISSPELLINGS[token];
                if (corrected) {
                    tokenVariations.add(corrected);
                    if (this.ABBREVIATIONS[corrected]) {
                        this.ABBREVIATIONS[corrected].forEach(v => tokenVariations.add(v));
                    }
                    // Check Synonyms for corrected word
                    if (this.SYNONYMS[corrected]) {
                        this.SYNONYMS[corrected].forEach(v => tokenVariations.add(v));
                    }
                }

                // Check Abbreviations
                if (this.ABBREVIATIONS[token]) {
                    this.ABBREVIATIONS[token].forEach(v => tokenVariations.add(v));
                }

                // Check Synonyms
                if (this.SYNONYMS[token]) {
                    this.SYNONYMS[token].forEach(v => tokenVariations.add(v));
                }

                // Busca reversa: Se o token for "TOM", achar "TOMADA"
                Object.entries(this.ABBREVIATIONS).forEach(([fullWord, abbrevs]) => {
                    if (abbrevs.includes(token)) {
                        tokenVariations.add(fullWord);
                    }
                });

                // Build OR condition for this specific token (Match ANY variation of THIS token)
                const tokenOrConditions: Prisma.ProductWhereInput[] = [];
                tokenVariations.forEach(term => {
                    tokenOrConditions.push(
                        { name: { contains: term, mode: 'insensitive' as Prisma.QueryMode } },
                        { brand: { contains: term, mode: 'insensitive' as Prisma.QueryMode } },
                        { category: { startsWith: term, mode: 'insensitive' as Prisma.QueryMode } }, // startsWith aqui também
                    );

                    // Código exato (se for número)
                    const code = parseInt(term);
                    if (!isNaN(code)) {
                        tokenOrConditions.push({ sankhya_code: { equals: code } });
                    }
                });

                if (tokenOrConditions.length > 0) {
                    andConditions.push({ OR: tokenOrConditions });
                }
            });

            // Tenta buscar por código exato se for número (para a query completa, se não foi tokenizada como tal)
            const fullQueryCode = parseInt(query);
            if (!isNaN(fullQueryCode) && tokens.length === 1 && tokens[0] === normalizedQuery) { // Only if query is a single number
                andConditions.push({ sankhya_code: { equals: fullQueryCode } });
            }


            if (andConditions.length > 0) {
                where['AND'] = andConditions;
            }
        }

        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                orderBy: {
                    // Tenta ordenar por nome para agrupar resultados parecidos
                    name: 'asc',
                },
                skip,
                take,
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
            },
        };
    }
}
