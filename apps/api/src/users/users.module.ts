import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserMergeService } from './user-merge.service';
import { S3Service } from '../common/s3.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserMergeService, S3Service],
  exports: [UsersService]
})
export class UsersModule { }
