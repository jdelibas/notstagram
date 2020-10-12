import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express/multer/multer.module';
import { resolve } from 'path';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';

@Module({
  imports: [
    MulterModule.register({
      dest: resolve(process.cwd(), './tmp/files'),
    })
  ],
  controllers: [PhotoController],
  providers: [PhotoService],
})
export class PhotoModule {}
