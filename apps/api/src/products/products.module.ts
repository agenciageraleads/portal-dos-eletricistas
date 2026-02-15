import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ImageCandidatesService } from './image-candidates.service';
import { ImageCuratorController } from './image-curator.controller';
import { WebSearchModule } from '../integrations/web-search/web-search.module';
import { SankhyaModule } from '../integrations/sankhya/sankhya.module';

@Module({
  imports: [WebSearchModule, SankhyaModule],
  controllers: [ProductsController, ImageCuratorController],
  providers: [ProductsService, ImageCandidatesService],
  exports: [ProductsService, ImageCandidatesService],
})
export class ProductsModule {}
