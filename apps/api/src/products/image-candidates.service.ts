import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { WebSearchService } from '../integrations/web-search/web-search.service';
import { ImageSearchStatus } from '@prisma/client';

@Injectable()
export class ImageCandidatesService {
  private readonly logger = new Logger(ImageCandidatesService.name);
  private isProcessing = false;

  constructor(
    private prisma: PrismaService,
    private webSearch: WebSearchService,
  ) {}

  /**
   * Cron job que roda a cada hora buscando candidatos para produtos sem foto.
   * Processa 10 produtos por vez para evitar rate limit.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Iniciando busca automática de candidatos a imagem...');
    await this.processPendingProducts(10);
  }

  /**
   * Busca candidatos para um lote de produtos.
   */
  async processPendingProducts(limit: number = 10) {
    if (this.isProcessing) {
      this.logger.warn('Já existe um processo de busca em andamento. Ignorando...');
      return;
    }

    this.isProcessing = true;

    try {
      // 1. Pegar produtos sem imagem e que estão PENDING
      const products = await this.prisma.product.findMany({
        where: {
          image_url: null,
          image_search_status: ImageSearchStatus.PENDING,
        },
        take: limit,
      });

      if (products.length === 0) {
        this.logger.log('Nenhum produto pendente de busca encontrado.');
        return;
      }

      this.logger.log(`Processando lote de ${products.length} produtos...`);

      for (const product of products) {
        await this.findCandidatesForProduct(product.id);
        // Pequeno delay entre produtos para ser gentil com o buscador
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      this.logger.error('Erro ao processar lote de candidatos', error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Busca e salva candidatos para um único produto.
   */
  async findCandidatesForProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return;

    // Marcar como SEARCHING
    await this.prisma.product.update({
      where: { id: productId },
      data: { image_search_status: ImageSearchStatus.SEARCHING },
    });

    // Montar query de busca: Nome + Marca + (se tiver) Código Original/Fornecedor
    // Nota: O código original pode estar no 'specs' ou as vezes usamos o sankhya_code
    const brandStr = product.brand ? ` ${product.brand}` : '';
    const query = `${product.name}${brandStr} profissional material eletrico`;

    const imageUrls = await this.webSearch.searchImages(query);

    if (imageUrls.length > 0) {
      // Criar candidatos
      const candidates = imageUrls.map(url => ({
        productId,
        url,
        source: 'DuckDuckGo',
      }));

      await this.prisma.productImageCandidate.createMany({
        data: candidates,
      });

      // Marcar como COMPLETED (fila de curadoria pronta)
      await this.prisma.product.update({
        where: { id: productId },
        data: { image_search_status: ImageSearchStatus.COMPLETED },
      });

      this.logger.log(`Encontrados ${imageUrls.length} candidatos para o produto: ${product.name}`);
    } else {
      // Se não encontrou nada, volta para PENDING para tentar depois ou marca como IGNORED?
      // Por enquanto, volta para PENDING mas talvez com um contador de tentativas no futuro.
      await this.prisma.product.update({
        where: { id: productId },
        data: { image_search_status: ImageSearchStatus.PENDING },
      });
      this.logger.warn(`Nenhuma imagem encontrada para: ${product.name}`);
    }
  }
}
