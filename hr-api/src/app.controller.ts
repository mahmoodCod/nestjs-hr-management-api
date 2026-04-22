import {
  BadRequestException,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './modules/auth/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path, { extname } from 'path';
import { execSync } from 'child_process';
import { mkdirSync } from 'fs';

@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    if (!execSync('./uploads')) {
      mkdirSync('./uploads', { recursive: true });
    }
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqename = `${Date.now()}-${Math.round(Math.random() * 1000)}${extname(file.originalname)}`;
          cb(null, uniqename);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowFormat = [
          'images/jpeg',
          'images/jpg',
          'images/png',
          'images/gif',
        ];
        if (allowMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('The file type is not allowed'), false);
        }
      },
    }),
  )
  upload(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('No file has been uploaded');

    return {
      filename: file.filename,
      orginalname: file.orginalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`,
    };
  }
}
