import { extname, resolve } from 'path';
import { Controller, Get, UseGuards, Request, Post, UseInterceptors, UploadedFile, Param, Put, NotFoundException, ValidationPipe, Body, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../users/jwt-auth.guard';
import { PhotoService } from './photo.service';
import { fileFilterHandler, filenameHandler } from './photo.utils';
import { Photo, PhotoCreateDto } from './photo.interface';
import { createReadStream } from 'fs';
import { getType } from 'mime';

@ApiTags('photo')
@Controller('photo')
export class PhotoController {

  constructor(private photoService: PhotoService){}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        caption: { type: 'string', },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
      },
    },
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiOkResponse({ type: Photo })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: resolve(process.cwd(), './tmp/files'),
        filename: filenameHandler,
      }),
      fileFilter: fileFilterHandler,
    }),
  )
  async postPhoto(
    @Body() body: PhotoCreateDto,
    @Request() req,
    @UploadedFile('file') file,
  ): Promise<Photo> {
    const payload = {
      user_id: req.user.user_id,
      caption: body.caption,
      latitude: body.latitude,
      longitude: body.longitude,
      image_path: `${file.filename}`,
      image_size: file.size,
    }
    const photo = await this.photoService.create(payload);
    return photo;
  }

  @Get(':photo_id')
  @ApiNotFoundResponse()
  @ApiOkResponse()
  async getPhoto(@Param('photo_id') photo_id: string, @Res() response){
    const photo = await this.photoService.findOne(photo_id);
    if (!photo) {
      throw new NotFoundException();
    }
    const filePath = resolve(process.cwd(), './tmp/files', photo.image_path);
    const readStream = createReadStream(filePath);
    const mimeType = getType(extname(photo.image_path));
    readStream.on('open', () => response.setHeader('Content-Type', mimeType));
    readStream.pipe(response);
  }

  @Get(':photo_id/details')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiOkResponse({ type: Photo })
  async getPhotoDetails(@Param('photo_id') photo_id: string): Promise<Photo> {
    const photo = await this.photoService.findOne(photo_id);
    if (!photo) {
      throw new NotFoundException();
    }
    return photo;
  }

  @Put(':photo_id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiOkResponse()
  async likePhoto(@Request() req, @Param('photo_id') photo_id: string) {
    const { user_id } = req.user;
    await this.photoService.likePhoto(user_id, photo_id);
    return {
      success: true,
    }
  }

  @Get(':photo_id/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiOkResponse()
  async countLikes(@Request() req, @Param('photo_id') photo_id: string) {
    const { user_id } = req.user;
    const likes = await this.photoService.countLikes(photo_id);
    if (likes === undefined) {
      throw new NotFoundException();
    }
    return {
      photo_id,
      likes,
    }
  }

  @Get('all/:username')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiOkResponse({ isArray: true, type: Photo })
  async getUserPhotos(@Param('username') username: string): Promise<Photo[]> {
    const photos = await this.photoService.getUserPhotos(username);
    return photos;
  }
}
