
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

interface ParsedItem {
    raw_text: string;
    quantity: number;
    unit: string | null;
    description: string;
    brand: string | null;
    code_ref: string | null;
}

export interface MatchResult {
    parsed: ParsedItem;
    match_score: number; // 0-100
    status: 'MATCHED' | 'SUGGESTED' | 'NOT_FOUND';
    product?: any; // Product entity
}

@Injectable()
export class BudgetImportService {
    private readonly logger = new Logger(BudgetImportService.name);
    private openai: OpenAI;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        const key = this.configService.get<string>('OPENAI_API_KEY');
        
        if (key) {
            console.log(`[DEBUG] OpenAI Key loaded: ${key.substring(0, 5)}...`);
            this.openai = new OpenAI({
                apiKey: key,
            });
        } else {
            console.warn('[WARN] OPENAI_API_KEY not found. AI features will be disabled.');
        }
    }

    /**
     * Main entry point: Process text or image to get budget items
     */
    async processInput(input: { text?: string; imageUrl?: string }): Promise<MatchResult[]> {
        let parsedItems: ParsedItem[] = [];


        if (input.text) {
            parsedItems = await this.parseTextWithAI(input.text);
        } else if (input.imageUrl) {
            parsedItems = await this.parseImageWithAI(input.imageUrl);
        }

        const results: MatchResult[] = [];

        for (const item of parsedItems) {
            const match = await this.findBestMatch(item);
            results.push(match);
        }

        return results;
    }

    /**
     * Use OpenAI to structure raw text into JSON
     */
    private async parseTextWithAI(text: string): Promise<ParsedItem[]> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert construction estimator. Extract items from the user's raw text list of electrical materials.
            Return a JSON object with a key "items" containing an array of objects.
            Each object must have:
            - "raw_text": The original line text.
            - "quantity": Number (default 1).
            - "unit": String or null (e.g., "M", "UN", "RL", "CX"). Normalize to simple abbr.
            - "description": The product name/description cleaned up.
            - "brand": Extracted brand if present, or null.
            - "code_ref": Any part number/code found, or null.
            
            Example output format:
            {
              "items": [
                { "raw_text": "10m Cabo 2.5mm", "quantity": 10, "unit": "M", "description": "Cabo Flexivel 2.5mm", "brand": null, "code_ref": null }
              ]
            }
            RETURN JSON ONLY.`
                    },
                    {
                        role: 'user',
                        content: text,
                    },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.1,
            });

            const content = completion.choices[0].message.content;
            if (!content) return [];

            const result = JSON.parse(content);
            return result.items || [];
        } catch (error) {
            this.logger.error('Error parsing text with OpenAI', error);
            if (error?.status === 429) {
                throw new Error('Cota da OpenAI excedida via API. Verifique o faturamento.');
            }
            throw error;
        }
    }

    /**
   * Use OpenAI Vision to extract text from image
   */
    private async parseImageWithAI(imageUrl: string): Promise<ParsedItem[]> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert construction estimator. Extract items from the image of the material list.
            Return a JSON object with a key "items" containing an array of objects.
            Each object must have:
            - "raw_text": The original line text as seen in the image.
            - "quantity": Number (default 1).
            - "unit": String or null.
            - "description": The product name cleaned up.
            - "brand": Extracted brand if visible, or null.
            - "code_ref": Any part number/code/ref visible, or null.
            
            RETURN JSON ONLY.`
                    },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Extract materials from this list.' },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageUrl,
                                    detail: 'high'
                                },
                            },
                        ],
                    },
                ],
                response_format: { type: 'json_object' },
                max_tokens: 1500,
            });

            const content = completion.choices[0].message.content;
            if (!content) return [];

            const result = JSON.parse(content);
            return result.items || [];
        } catch (error) {
            this.logger.error('Error parsing image with OpenAI', error);
            if (error?.status === 429) {
                throw new Error('Cota da OpenAI excedida via API. Verifique o faturamento.');
            }
            throw error;
        }
    }

    /**
     * Search Engine Logic (Cascading Match)
     */
    /**
     * Store feedback from user to improve future matches
     */
    async registerFeedback(userId: string, data: { original_text: string; ai_model?: string; suggested_pid?: string; correct_pid?: string; correction_type: string }) {
        try {
            await this.prisma.aiMatchFeedback.create({
                data: {
                    userId,
                    original_text: data.original_text.toLowerCase().trim(),
                    ai_model: data.ai_model || 'gpt-4o-mini',
                    suggested_pid: data.suggested_pid,
                    correct_pid: data.correct_pid,
                    correction_type: data.correction_type
                }
            });
            return { success: true };
        } catch (error) {
            this.logger.error('Error registering feedback', error);
            return { success: false };
        }
    }

    /**
     * Search Engine Logic (Cascading Match with Memory)
     */
    private async findBestMatch(item: ParsedItem): Promise<MatchResult> {
        // 0. CHECK MEMORY (AI Feedback)
        // Normalize text for lookup
        const normalizedText = item.raw_text.toLowerCase().trim();
        // Also check by description as fallback
        const normalizedDesc = item.description.toLowerCase().trim();

        const memory = await this.prisma.aiMatchFeedback.findFirst({
            where: {
                OR: [
                    { original_text: normalizedText },
                    { original_text: normalizedDesc }
                ],
                correction_type: 'FIXED',
                correct_pid: { not: null }
            },
            orderBy: { createdAt: 'desc' } // Get latest fix
        });

        if (memory && memory.correct_pid) {
            const product = await this.prisma.product.findUnique({ where: { id: memory.correct_pid } });
            if (product) {
                return { parsed: item, match_score: 95, status: 'MATCHED', product: product };
            }
        }

        // 1. Exact Match (Code)
        if (item.code_ref) {
            const codeInt = parseInt(item.code_ref.replace(/\D/g, ''));
            if (!isNaN(codeInt)) {
                const prodByCode = await this.prisma.product.findUnique({
                    where: { sankhya_code: codeInt },
                });
                if (prodByCode) {
                    return { parsed: item, match_score: 100, status: 'MATCHED', product: prodByCode };
                }
            }
        }

        // 2. Text Search Improvement
        // Remove quantities at start? e.g. "10 " or "10x" if captured in description
        // AI usually handles "description" well, but "10a" is important.

        const searchTerms = item.description
            .replace(/[^\w\s\-\.]/gi, '') // Keep alphanumeric, space, dash, dot
            .split(/\s+/)
            .filter((t) => t.length >= 2); // Ignore single chars unless it's like V, A, W? Handled by >=2 for now (10A is 3 chars)

        if (searchTerms.length === 0) {
            return { parsed: item, match_score: 0, status: 'NOT_FOUND' };
        }

        // STRATEGY A: Strict "AND" Search (All terms must appear) 
        // Best for "Disjuntor 20A" -> must have "Disjuntor" AND "20A"
        try {
            const strictMatches = await this.prisma.product.findMany({
                where: {
                    is_available: true,
                    AND: searchTerms.map(term => ({
                        name: { contains: term, mode: 'insensitive' }
                    }))
                },
                take: 1
            });

            if (strictMatches.length > 0) {
                return { parsed: item, match_score: 90, status: 'MATCHED', product: strictMatches[0] };
            }
        } catch (e) {
            // Ignore complexity limit errors if any
        }

        // STRATEGY B: Fallback "OR" Search (ranked by overlap)
        // If strict failed (e.g. user wrote "Disjuntor 2400A" (typo) or brand mismatch)
        const looseMatches = await this.prisma.product.findMany({
            where: {
                is_available: true,
                OR: searchTerms.map(term => ({
                    name: { contains: term, mode: 'insensitive' }
                }))
            },
            take: 10
        });

        if (looseMatches.length > 0) {
            // Rank them by how many terms they matched
            const ranked = looseMatches.map(p => {
                let score = 0;
                const nameLower = p.name.toLowerCase();
                searchTerms.forEach(term => {
                    if (nameLower.includes(term.toLowerCase())) score++;
                });
                return { product: p, score };
            }).sort((a, b) => b.score - a.score);

            // Return top 1 if score > 0
            if (ranked.length > 0 && ranked[0].score > 0) {
                return { parsed: item, match_score: 60, status: 'SUGGESTED', product: ranked[0].product };
            }
        }

        return { parsed: item, match_score: 0, status: 'NOT_FOUND' };
    }
}
