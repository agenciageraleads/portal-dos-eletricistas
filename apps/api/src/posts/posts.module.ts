import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Service } from '../common/s3.service';

@Module({
    imports: [
        PrismaModule
    ],
    controllers: [PostsController],
    providers: [PostsService, S3Service],
    exports: [PostsService]
})
export class PostsModule {}
