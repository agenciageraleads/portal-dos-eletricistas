import { Test, TestingModule } from '@nestjs/testing';
import { ImageCandidatesService } from './image-candidates.service';
import { PrismaService } from '../prisma/prisma.service';
import { WebSearchService } from '../integrations/web-search/web-search.service';
import { ImageSearchStatus } from '@prisma/client';

describe('ImageCandidatesService', () => {
  let service: ImageCandidatesService;
  let prisma: PrismaService;
  let webSearch: WebSearchService;

  const mockPrisma = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    productImageCandidate: {
      createMany: jest.fn(),
    },
  };

  const mockWebSearch = {
    searchImages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageCandidatesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: WebSearchService, useValue: mockWebSearch },
      ],
    }).compile();

    service = module.get<ImageCandidatesService>(ImageCandidatesService);
    prisma = module.get<PrismaService>(PrismaService);
    webSearch = module.get<WebSearchService>(WebSearchService);
    
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('processPendingProducts', () => {
    it('deve buscar produtos pendentes e processar candidatos', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', brand: 'Brand' },
      ];

      mockPrisma.product.findMany.mockResolvedValueOnce(mockProducts);
      mockPrisma.product.findUnique.mockResolvedValueOnce(mockProducts[0]);
      mockWebSearch.searchImages.mockResolvedValueOnce(['http://img.com/1.jpg']);
      mockPrisma.product.update.mockResolvedValue({});
      mockPrisma.productImageCandidate.createMany.mockResolvedValue({ count: 1 });

      await service.processPendingProducts(1);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { image_url: null, image_search_status: ImageSearchStatus.PENDING }
      }));
      expect(mockWebSearch.searchImages).toHaveBeenCalled();
      expect(mockPrisma.productImageCandidate.createMany).toHaveBeenCalled();
      expect(mockPrisma.product.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { image_search_status: ImageSearchStatus.COMPLETED }
      }));
    });

    it('não deve fazer nada se não houver produtos pendentes', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce([]);

      await service.processPendingProducts(10);

      expect(mockWebSearch.searchImages).not.toHaveBeenCalled();
    });
  });

  describe('findCandidatesForProduct', () => {
    it('deve atualizar status para COMPLETED se encontrar imagens', async () => {
        const mockProduct = { id: '123', name: 'Cabo Flexivel', brand: 'Sil' };
        mockPrisma.product.findUnique.mockResolvedValueOnce(mockProduct);
        mockWebSearch.searchImages.mockResolvedValueOnce(['url1', 'url2']);

        await service.findCandidatesForProduct('123');

        expect(mockPrisma.product.update).toHaveBeenCalledWith({
            where: { id: '123' },
            data: { image_search_status: ImageSearchStatus.COMPLETED }
        });
    });

    it('deve voltar para PENDING se não encontrar imagens', async () => {
        const mockProduct = { id: '123', name: 'Cabo Flexivel', brand: 'Sil' };
        mockPrisma.product.findUnique.mockResolvedValueOnce(mockProduct);
        mockWebSearch.searchImages.mockResolvedValueOnce([]);

        await service.findCandidatesForProduct('123');

        expect(mockPrisma.product.update).toHaveBeenCalledWith({
            where: { id: '123' },
            data: { image_search_status: ImageSearchStatus.PENDING }
        });
    });
  });
});
