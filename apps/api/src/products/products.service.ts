import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getVariations, STOPWORDS } from './search-engineering';

@Injectable()
export class ProductsService {

    constructor(private prisma: PrismaService) { }

    async findAll(query?: string, page: number = 1, limit: number = 20, category?: string) {
        const where: Prisma.ProductWhereInput = {
            is_available: true,
        };

        if (category) {
            where.category = { equals: category, mode: 'insensitive' };
        }

        let isSearch = false;

        if (query) {
            isSearch = true;
            let normalizedQuery = query.toUpperCase().trim();

            // 1. Tokenize & Filter Stopwords
            const tokens = normalizedQuery.split(/\s+/)
                .filter(t => !STOPWORDS.has(t));

            const andConditions: Prisma.ProductWhereInput[] = [];

            if (tokens.length > 0) {
                tokens.forEach(token => {
                    const tokenVariations = getVariations(token);

                    const tokenOrConditions: Prisma.ProductWhereInput[] = [];
                    tokenVariations.forEach(term => {
                        // Using contains for broad recall
                        tokenOrConditions.push(
                            { name: { contains: term, mode: 'insensitive' } },
                            { brand: { contains: term, mode: 'insensitive' } },
                            { category: { startsWith: term, mode: 'insensitive' } },
                        );

                        const code = parseInt(term);
                        if (!isNaN(code)) {
                            tokenOrConditions.push({ sankhya_code: { equals: code } });
                        }
                    });

                    if (tokenOrConditions.length > 0) {
                        andConditions.push({ OR: tokenOrConditions });
                    }
                });
            } else if (normalizedQuery.length > 0) {
                andConditions.push({ name: { contains: normalizedQuery, mode: 'insensitive' } });
            }

            const fullQueryCode = parseInt(query);
            if (!isNaN(fullQueryCode) && (tokens.length <= 1)) {
                andConditions.push({ sankhya_code: { equals: fullQueryCode } });
            }

            if (andConditions.length > 0) {
                where['AND'] = andConditions;
            }
        }

        // Logic for Search vs Browsing
        if (isSearch) {
            // Strategy: Fetch up to 5000 items (Entire Catalog approx) and Sort In-Memory scoring
            const poolLimit = 5000;
            const results = await this.prisma.product.findMany({
                where,
                take: poolLimit,
            });

            // Re-generate expanded tokens for scoring
            const normalizedQ = query ? query.toUpperCase().trim() : '';
            const searchTokens = normalizedQ.split(/\s+/).filter(t => !STOPWORDS.has(t));
            const allVariations = new Set<string>();

            // Add original full query for exact matching
            if (normalizedQ) allVariations.add(normalizedQ);

            searchTokens.forEach(t => {
                const vars = getVariations(t);
                vars.forEach(v => allVariations.add(v));
            });
            // Add Synonyms logic explicitly if separated (It is in SYNONYMS dict in class but unused in previous sort?)
            // The class has SYNONYMS dict but findAll code structure integrated it? 
            // Previous code ONLY used ABBREVIATIONS and REVERSE.
            // Let's ensure we use SYNONYMS if they exist in the class.
            // *Check class definition*: SYNONYMS was removed in my previous `replace_file_content` call? 
            // *Reviewing file content*: I see ABBREVIATIONS and REVERSE_ABBREVIATIONS. I see 'MONOFASICO' in ABBREVIATIONS.
            // I REMOVED `SYNONYMS` property in step 171/179?
            // Yes, I merged them into ABBREVIATIONS in the plan.
            // So iterating ABBREVIATIONS is sufficient.

            const sorted = results.sort((a, b) => {
                const nameA = a.name.toUpperCase();
                const nameB = b.name.toUpperCase();

                function calculateScore(name: string): number {
                    let score = 0;
                    // Check against ALL variations
                    // We want to prioritize based on the BEST match among variations.

                    // 1. Exact Match to Full Query
                    if (name === normalizedQ) score += 200;

                    // 2. Starts With (Any Token Variation) - Highest Priority
                    // If matched "CABO", score 100.
                    let maxStartScore = 0;
                    allVariations.forEach(term => {
                        if (name.startsWith(term)) {
                            // Boost longer terms? "CABOMETRO" vs "CABO".
                            // Assume standard 100.
                            maxStartScore = Math.max(maxStartScore, 100);
                        }
                    });
                    score += maxStartScore;

                    // 3. Word Match (Any Token Variation)
                    let maxWordScore = 0;
                    const nameWords = name.split(/[\s\-\/\.]+/); // Split by common delimiters
                    allVariations.forEach(term => {
                        if (nameWords.includes(term)) {
                            maxWordScore = Math.max(maxWordScore, 50);
                        }
                    });
                    score += maxWordScore;

                    return score;
                }

                const scoreA = calculateScore(nameA);
                const scoreB = calculateScore(nameB);

                if (scoreA > scoreB) return -1;
                if (scoreB > scoreA) return 1; // Corrected comparison for scoreB > scoreA

                // Fallback: Alphabetical
                return nameA.localeCompare(nameB);
            });

            // Pagination
            const total = await this.prisma.product.count({ where });
            const start = (page - 1) * limit;
            const paginatedData = sorted.slice(start, start + limit);

            return {
                data: paginatedData,
                meta: {
                    total, // Still DB total
                    page,
                    last_page: Math.ceil(total / limit),
                },
            };
        } else {
            // Standard Browsing (Efficient DB Paging)
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                this.prisma.product.findMany({
                    where,
                    orderBy: { name: 'asc' },
                    skip,
                    take: limit,
                }),
                this.prisma.product.count({ where }),
            ]);

            return { data, meta: { total, page, last_page: Math.ceil(total / limit) } };
        }
    }
}
