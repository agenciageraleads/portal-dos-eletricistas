import { Controller, Get, Post, Body, Query, UseGuards, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, ImageSearchStatus } from '@prisma/client';
import { SankhyaImageService } from '../integrations/sankhya/sankhya-image.service';
import { ImageCandidatesService } from './image-candidates.service';

@Controller('admin/image-curator')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class ImageCuratorController {
  constructor(
    private prisma: PrismaService,
    private sankhyaImageService: SankhyaImageService,
    private imageCandidatesService: ImageCandidatesService,
  ) {}

  /**
   * Lista produtos que já possuem candidatos a imagem prontos para curadoria.
   */
  @Get('queue')
  async getQueue(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('brand') brand?: string,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {
      image_url: null,
      image_search_status: ImageSearchStatus.COMPLETED,
    };

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          imageCandidates: true,
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
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

  /**
   * Aprova uma imagem específica para um produto.
   */
  @Post('approve')
  async approveImage(
    @Body() body: { productId: string; imageUrl: string },
  ) {
    const { productId, imageUrl } = body;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // 1. Baixar e salvar a imagem permanentemente
    const finalUrl = await this.sankhyaImageService.saveExternalImageForProduct(
      product.sankhya_code,
      imageUrl,
    );

    if (!finalUrl) {
      throw new BadRequestException('Não foi possível processar a imagem selecionada');
    }

    // 2. Atualizar o produto
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        image_url: finalUrl,
        image_search_status: ImageSearchStatus.COMPLETED, // Já está completed, mas garante
      },
    });

    // 3. Limpar candidatos
    await this.prisma.productImageCandidate.deleteMany({
      where: { productId },
    });

    return { success: true, imageUrl: finalUrl };
  }

  /**
   * Rejeita todas as fotos e marca produto como IGNORED.
   */
  @Post('ignore/:id')
  async ignoreProduct(@Param('id') id: string) {
    await this.prisma.product.update({
      where: { id },
      data: { image_search_status: ImageSearchStatus.IGNORED },
    });

    await this.prisma.productImageCandidate.deleteMany({
      where: { productId: id },
    });

    return { success: true };
  }

  /**
   * Força uma busca imediata para um produto específico (útil para testes).
   */
  @Post('search/:id')
  async forceSearch(@Param('id') id: string) {
    await this.imageCandidatesService.findCandidatesForProduct(id);
    return { success: true };
  }
}
