import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getVariations, STOPWORDS } from './search-engineering';

@Injectable()
export class ProductsService {

    constructor(private prisma: PrismaService) { }

    @Injectable()
    export class ProductsService {

    constructor(private prisma: PrismaService) { }

    async findAll(query ?: string, page: number = 1, limit: number = 20, category ?: string) {
        const where: Prisma.ProductWhereInput = {
            is_available: true,
        };

        // ... (Category logic remains)
        if (category) {
            where.category = { equals: category, mode: 'insensitive' };
        }

        let isSearch = false;
        let searchTokens: string[] = [];
        let normalizedQ = '';

        if (query) {
            isSearch = true;
            normalizedQ = query.toUpperCase().trim();

            // 1. Tokenize & Filter Stopwords
            // Improved regex to keep "2.5" together, but split "2.5mm" if space absent? 
            // "search-engineering" variations handle "2.5mm" -> "2.5".
            // So we just need to split by spaces generally.
            const tokens = normalizedQ.split(/\s+/)
                .filter(t => !STOPWORDS.has(t));

            searchTokens = tokens;

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

                        // If term is purely numeric code
                        const code = parseInt(term);
                        if (!isNaN(code) && String(code) === term) {
                            // Only match code if exact match string to avoid "32" matching "3200" via contains (which is handled above)
                            // But for `sankhya_code` it is Int, so equals.
                            tokenOrConditions.push({ sankhya_code: { equals: code } });
                        }
                    });

                    if (tokenOrConditions.length > 0) {
                        andConditions.push({ OR: tokenOrConditions });
                    }
                });
            } else if (normalizedQ.length > 0) {
                andConditions.push({ name: { contains: normalizedQuery, mode: 'insensitive' } });
            }

            // Fallback for exact code match on full query
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

            // LOG FAILED SEARCH (v1.1.0)
            if (results.length === 0 && query && query.length > 2) {
                // Async logging, don't await to not block response
                this.logFailedSearch(query).catch(err => console.error('Error logging failed search', err));
            }

            // Re-generate expanded tokens for scoring
            const allVariations = new Set<string>();

            // Add original full query for exact matching
            if (normalizedQ) allVariations.add(normalizedQ);

            searchTokens.forEach(t => {
                const vars = getVariations(t);
                vars.forEach(v => allVariations.add(v));
            });

            const sorted = results.sort((a, b) => {
                const nameA = a.name.toUpperCase();
                const nameB = b.name.toUpperCase();

                function calculateScore(name: string): number {
                    let score = 0;

                    // 1. Exact Match to Full Query
                    if (name === normalizedQ) score += 200;

                    // 2. Starts With (Any Token Variation) - Highest Priority
                    let maxStartScore = 0;
                    allVariations.forEach(term => {
                        if (name.startsWith(term)) {
                            maxStartScore = Math.max(maxStartScore, 100);
                        }
                    });
                    score += maxStartScore;

                    // 3. Word Match (Any Token Variation)
                    let maxWordScore = 0;
                    // Split name into words to match exact token presence
                    const nameWords = name.split(/[\s\-\/\.]+/);
                    allVariations.forEach(term => {
                        if (nameWords.includes(term)) {
                            maxWordScore = Math.max(maxWordScore, 50);
                        } else if (name.includes(term)) {
                            // Partial match inside word (e.g. searching "FITA" finds "FITA-ISOLANTE")
                            score += 10;
                        }
                    });
                    score += maxWordScore;

                    // Boost based on availability? optional.
                    if (!a.is_available) score -= 1000; // Push unavailable to bottom? No, maybe just less priority.

                    return score;
                }

                const scoreA = calculateScore(nameA);
                const scoreB = calculateScore(nameB);

                if (scoreA > scoreB) return -1;
                if (scoreB > scoreA) return 1;

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
                    total: results.length, // Accurate count of filters
                    page,
                    last_page: Math.ceil(results.length / limit),
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

    // Capture failed searches
    async logFailedSearch(query: string) {
        // Check if we already logged this query recently to avoid spam? 
        // For MVP, just log.
        await this.prisma.failedSearch.create({
            data: {
                query: query,
                // userId could be extracted if we passed context, but for now anonymous or we can add it later
            }
        });
    }
}
