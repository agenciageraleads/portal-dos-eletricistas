
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
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
            return [];
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
            return [];
        }
    }

    /**
     * Search Engine Logic (Cascading Match)
     */
    private async findBestMatch(item: ParsedItem): Promise<MatchResult> {
        // 1. Exact Match (Code)
        if (item.code_ref) {
            // Try Sankhya Code first (if numeric)
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

        // 2. Text Search (Full Text / ILIKE)
        // Clean up description for search
        const searchTerms = item.description
            .replace(/[^\w\s]/gi, ' ') // Remove special chars
            .split(' ')
            .filter((t) => t.length > 2)
            .join(' & '); // Create TSQUERY

        if (!searchTerms) {
            return { parsed: item, match_score: 0, status: 'NOT_FOUND' };
        }

        // Using PostgreSQL Full Text Search via Prisma (raw query is often better for this, but simplistic approach first)
        // We'll search by name containing words
        // Priority: Name + Brand

        // Simplistic ranking:
        // 1. filter by brand if present (optional, maybe too strict)
        // 2. ILIKE query on name

        // To calculate score, we would typically use pg_trgm but let's stick to standard querying for V1

        const possibleMatches = await this.prisma.product.findMany({
            where: {
                is_available: true,
                OR: [
                    { name: { contains: item.description, mode: 'insensitive' } },
                    // Fallback: split terms
                    ...item.description.split(' ').map(term => ({ name: { contains: term, mode: 'insensitive' } }))
                ]
            },
            take: 5
        });

        if (possibleMatches.length > 0) {
            // Find best match in this small subset
            // Basic Levenshtein or token overlap could go here.
            // For now, return the first one as "SUGGESTED" (Logic to be improved)
            return {
                parsed: item,
                match_score: 80, // Mock score for textual match
                status: 'SUGGESTED',
                product: possibleMatches[0]
            };
        }

        return { parsed: item, match_score: 0, status: 'NOT_FOUND' };
    }
}
