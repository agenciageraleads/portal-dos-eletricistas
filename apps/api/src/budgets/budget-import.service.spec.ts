
import { Test, TestingModule } from '@nestjs/testing';
import { BudgetImportService } from './budget-import.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

// Mock OpenAI
const mockOpenAI = {
    chat: {
        completions: {
            create: jest.fn(),
        },
    },
};

// Mock Prisma
const mockPrisma = {
    product: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
    },
};

jest.mock('openai', () => {
    return {
        default: jest.fn().mockImplementation(() => mockOpenAI)
    }
});

describe('BudgetImportService', () => {
    let service: BudgetImportService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BudgetImportService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('sk-123') } },
            ],
        }).compile();

        service = module.get<BudgetImportService>(BudgetImportService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('processInput', () => {
        it('should match a product exactly by code', async () => {
            // Mock OpenAI response
            mockOpenAI.chat.completions.create.mockResolvedValue({
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                items: [
                                    {
                                        raw_text: 'Ref 12345 Disjuntor',
                                        quantity: 2,
                                        unit: 'UN',
                                        description: 'Disjuntor',
                                        brand: null,
                                        code_ref: '12345'
                                    }
                                ]
                            }),
                        },
                    },
                ],
            });

            // Mock Prisma response
            mockPrisma.product.findUnique.mockResolvedValue({
                id: 'prod-1',
                sankhya_code: 12345,
                name: 'Disjuntor Bipolar 20A',
                price: 15.00,
            });

            const result = await service.processInput({ text: 'Ref 12345 Disjuntor' });

            expect(result).toHaveLength(1);
            expect(result[0].status).toBe('MATCHED');
            expect(result[0].match_score).toBe(100);
            expect(result[0].product.name).toBe('Disjuntor Bipolar 20A');
        });

        it('should suggest a product by name', async () => {
            // Mock OpenAI response
            mockOpenAI.chat.completions.create.mockResolvedValue({
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                items: [
                                    {
                                        raw_text: 'Cabo Flexivel',
                                        quantity: 100,
                                        unit: 'M',
                                        description: 'Cabo Flexivel 2.5mm',
                                        brand: 'Sil',
                                        code_ref: null
                                    }
                                ]
                            }),
                        },
                    },
                ],
            });

            // Mock Prisma response (findUnique returns null, findMany returns matches)
            mockPrisma.product.findUnique.mockResolvedValue(null);
            mockPrisma.product.findMany.mockResolvedValue([
                { id: 'prod-2', name: 'Cabo Flexivel 2.5mm Sil', price: 2.00, sankhya_code: 999 }
            ]);

            const result = await service.processInput({ text: 'Cabo Flexivel' });

            expect(result).toHaveLength(1);
            expect(result[0].status).toBe('SUGGESTED');
            expect(result[0].match_score).toBe(80);
            expect(result[0].product.name).toBe('Cabo Flexivel 2.5mm Sil');

        });
    });
});
