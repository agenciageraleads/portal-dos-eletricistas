import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getVariations, STOPWORDS, reloadSynonyms, RAW_SYNONYMS } from './search-engineering';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

function normalizeSearchQuery(input: string): string {
    let normalized = input.toUpperCase().trim();
    normalized = normalized.replace(/[’´`]/g, "'");
    normalized = normalized.replace(/(\d)\s*'\s*(\d)/g, '$1,$2');
    normalized = normalized.replace(/["]+/g, '');
    normalized = normalized.replace(/'+/g, ' ');
    normalized = normalized.replace(/\s+/g, ' ').trim();
    return normalized;
}

@Injectable()
export class ProductsService implements OnModuleInit {
    private openai: OpenAI;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        const key = this.configService.get<string>('OPENAI_API_KEY');
        if (key) {
            this.openai = new OpenAI({ apiKey: key });
        }
    }

    async onModuleInit() {
        await this.syncSynonyms();
    }

    async syncSynonyms() {
        // Load from DB
        const dbSynonyms = await this.prisma.searchSynonym.findMany({
            where: { approved: true }
        });

        const newRawSynonyms: Record<string, string[]> = { ...RAW_SYNONYMS };

        // Merge DB synonyms
        dbSynonyms.forEach(s => {
            newRawSynonyms[s.term] = s.synonyms;
        });

        // Reload memory
        reloadSynonyms(newRawSynonyms);
    }

    async addSynonym(term: string, synonyms: string[]) {
        // Upsert
        await this.prisma.searchSynonym.upsert({
            where: { term },
            update: { synonyms, approved: true },
            create: { term, synonyms, approved: true }
        });
        await this.syncSynonyms();
    }

    async generateSearchSuggestions(failedTerm: string) {
        if (!this.openai) return { error: 'AI not configured' };

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a search query optimizer for an Electrical Material store.
                    The user searched for a term that yielded no results.
                    Your goal is to suggest synonyms or corrected terms that likely exist in our catalog (standard industry terms).
                    Return a JSON with "synonyms": string[].
                    Ex: "lampada led 9w" -> synonyms: ["LAMPADA", "BULBO", "E27"]
                    Ex: "fita isolante" -> synonyms: ["ISOLANTE"]`
                },
                { role: 'user', content: failedTerm }
            ],
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0].message.content;
        return JSON.parse(content || '{}');
    }



    async findAll(query?: string, page: number = 1, limit: number = 20, category?: string, orderBy: string = 'popularity', type?: string) {
        try {
            const where: Prisma.ProductWhereInput = {
                is_available: true,
            };

            // Regra v2.1: Materiais só aparecem se preço > 0. Serviços sempre aparecem.
            if (type === 'SERVICE') {
                where.type = 'SERVICE';
            } else if (type === 'MATERIAL') {
                where.type = 'MATERIAL';
                where.price = { gt: 0 };
            } else {
                // Catálogo geral: esconde materiais com preço zero, mas mostra serviços
                where.OR = [
                    { type: 'MATERIAL', price: { gt: 0 } },
                    { type: 'SERVICE' }
                ];
            }

            if (category) {
                const categories = category.split(',').map(c => c.trim());
                if (categories.length > 1) {
                    where.AND = [
                        { OR: categories.map(c => ({ category: { equals: c, mode: 'insensitive' as Prisma.QueryMode } })) }
                    ];
                } else {
                    where.category = { equals: category, mode: 'insensitive' as Prisma.QueryMode };
                }
            }

            let isSearch = false;
            let searchTokens: string[] = [];
            let normalizedQ = '';

            if (query) {
                isSearch = true;
                normalizedQ = normalizeSearchQuery(query);

                const tokens = normalizedQ.split(/\s+/)
                    .filter(t => !STOPWORDS.has(t));

                searchTokens = tokens;

                const andConditions: Prisma.ProductWhereInput[] = [];

                if (tokens.length > 0) {
                    tokens.forEach(token => {
                        const tokenVariations = getVariations(token);

                        const tokenOrConditions: Prisma.ProductWhereInput[] = [];
                        tokenVariations.forEach(term => {
                            tokenOrConditions.push(
                                { name: { contains: term, mode: 'insensitive' as Prisma.QueryMode } },
                                { brand: { contains: term, mode: 'insensitive' as Prisma.QueryMode } },
                                { category: { startsWith: term, mode: 'insensitive' as Prisma.QueryMode } },
                            );

                            const code = parseInt(term);
                            if (!isNaN(code) && String(code) === term) {
                                tokenOrConditions.push({ sankhya_code: { equals: code } });
                            }
                        });

                        if (tokenOrConditions.length > 0) {
                            andConditions.push({ OR: tokenOrConditions });
                        }
                    });
                } else if (normalizedQ.length > 0) {
                    andConditions.push({ name: { contains: normalizedQ, mode: 'insensitive' as Prisma.QueryMode } });
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

                // LOG FAILED SEARCH (v1.1.0)
                if (results.length === 0 && query && query.length > 2) {
                    this.logFailedSearch(query).catch(err => console.error('Error logging failed search', err));
                }

                let sorted = results;

                // Only apply relevance sort if orderBy is 'relevance' or 'popularity' (and it's a search)
                // Actually, if user specifically asks for 'price_asc', we should respect that over relevance.
                if (!orderBy || orderBy === 'relevance' || orderBy === 'popularity') {
                    // Re-generate expanded tokens for scoring
                    const allVariations = new Set<string>();

                    if (normalizedQ) allVariations.add(normalizedQ);

                    searchTokens.forEach(t => {
                        const vars = getVariations(t);
                        vars.forEach(v => allVariations.add(v));
                    });

                    sorted = results.sort((a, b) => {
                        const nameA = a.name.toUpperCase();
                        const nameB = b.name.toUpperCase();

                        function calculateScore(name: string): number {
                            let score = 0;
                            if (name === normalizedQ) score += 200;
                            let maxStartScore = 0;
                            allVariations.forEach(term => {
                                if (name.startsWith(term)) maxStartScore = Math.max(maxStartScore, 100);
                            });
                            score += maxStartScore;
                            let maxWordScore = 0;
                            const nameWords = name.split(/[\s\-\/\.]+/);
                            // Deep split: break digit-to-alphabet transitions (e.g. 10mm -> 10, mm)
                            const nameWordsDeep: string[] = [];
                            nameWords.forEach(w => {
                                nameWordsDeep.push(w);
                                const parts = w.split(/(?<=[a-zA-Z])(?=\d)|(?<=\d)(?=[a-zA-Z])/);
                                if (parts.length > 1) {
                                    parts.forEach(p => nameWordsDeep.push(p));
                                }
                            });

                            allVariations.forEach(term => {
                                if (nameWordsDeep.includes(term)) maxWordScore = Math.max(maxWordScore, 50);
                                else if (name.includes(term)) score += 10;
                            });
                            score += maxWordScore;

                            // NEW: Improved Number Matching (v1.2.1)
                            // Capture numbers loosely (e.g. from "10mm", "100v")
                            const queryNumbers = normalizedQ.match(/\d+([.,]\d+)?/g);
                            if (queryNumbers) {
                                queryNumbers.forEach(num => {
                                    // Check normalized number (e.g. 10.0 vs 10)
                                    const hasNumber = nameWordsDeep.some(w => {
                                        return parseFloat(w) === parseFloat(num);
                                    });
                                    if (!hasNumber) {
                                        score -= 500; // Giant penalty to push to bottom
                                    }
                                });
                            }

                            return score;
                        }

                        const scoreA = calculateScore(nameA);
                        const scoreB = calculateScore(nameB);

                        if (scoreA > scoreB) return -1;
                        if (scoreB > scoreA) return 1;

                        // Fallback: Popularity then Alphabetical
                        if (orderBy === 'popularity' || !orderBy) {
                            const popA = Number(a.popularity_index) || 0;
                            const popB = Number(b.popularity_index) || 0;
                            if (popA > popB) return -1;
                            if (popB > popA) return 1;
                        }

                        return nameA.localeCompare(nameB);
                    });
                } else {
                    // Apply explicit sort on the in-memory results (since we already fetched them)
                    sorted = results.sort((a, b) => {
                        if (orderBy === 'price_asc') return Number(a.price) - Number(b.price);
                        if (orderBy === 'price_desc') return Number(b.price) - Number(a.price);
                        if (orderBy === 'name_asc') return a.name.localeCompare(b.name);
                        if (orderBy === 'name_desc') return b.name.localeCompare(a.name);
                        return 0;
                    });
                }

                // Pagination
                const total = results.length;
                const start = (page - 1) * limit;
                const paginatedData = sorted.slice(start, start + limit);

                return {
                    data: paginatedData,
                    meta: {
                        total: results.length,
                        page,
                        last_page: Math.ceil(results.length / limit),
                    },
                };
            } else {
                // Standard Browsing (Efficient DB Paging)
                const skip = (page - 1) * limit;

                let finalOrderBy: Prisma.ProductOrderByWithRelationInput[] = [
                    { popularity_index: 'desc' },
                    { name: 'asc' }
                ];

                if (orderBy === 'price_asc') finalOrderBy = [{ price: 'asc' }];
                if (orderBy === 'price_desc') finalOrderBy = [{ price: 'desc' }];
                if (orderBy === 'name_asc') finalOrderBy = [{ name: 'asc' }];
                if (orderBy === 'name_desc') finalOrderBy = [{ name: 'desc' }];
                // popularity is default

                const [data, total] = await Promise.all([
                    this.prisma.product.findMany({
                        where,
                        orderBy: finalOrderBy,
                        skip,
                        take: limit,
                    }),
                    this.prisma.product.count({ where }),
                ]);

                return { data, meta: { total, page, last_page: Math.ceil(total / limit) } };
            }
        } catch (error) {
            console.error('Error in ProductsService.findAll:', error);
            throw error;
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

    async createSuggestion(data: { name: string, category?: string, description?: string, suggestedBy?: string }) {
        return this.prisma.serviceSuggestion.create({
            data: {
                name: data.name,
                category: data.category,
                description: data.description,
                suggestedBy: data.suggestedBy
            }
        });
    }

    // Admin: Get Failed Searches
    async getFailedSearches(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.failedSearch.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.failedSearch.count(),
        ]);

        return {
            data,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    // Admin: Update Product
    async updateProduct(id: string, data: Prisma.ProductUpdateInput) {
        return this.prisma.product.update({
            where: { id },
            data,
        });
    }
}
