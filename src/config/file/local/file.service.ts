import { Injectable, BadRequestException } from '@nestjs/common';
import { FileUploadResponseDto } from '../dtos/upload-response.dto';
import { FileConfigService } from './../file.service';
import { v1 } from 'uuid';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Injectable()
export class LocalConfigService implements FileConfigService {
  private readonly publicPath: string;

  constructor(private readonly configService: ConfigService) {
    this.publicPath = path.join(this.configService.get('app.root'), 'public');
  }

  async upload(file: Express.Multer.File): Promise<FileUploadResponseDto> {
    const uuid = `${v1()}-${file.originalname}`;

    try {
      fs.mkdirSync(this.publicPath);
    } catch (err) {}

    const filePath = path.join(this.publicPath, uuid);
    fs.writeFileSync(filePath, file.buffer);

    return new FileUploadResponseDto(uuid);
  }

  async uploadByBuffer(
    buffer: Buffer,
    name: string,
  ): Promise<FileUploadResponseDto> {
    const uuid = `${v1()}-${name}`;

    try {
      fs.mkdirSync(this.publicPath);
    } catch (err) {}

    const filePath = path.join(this.publicPath, uuid);
    fs.writeFileSync(filePath, buffer);

    return new FileUploadResponseDto(uuid);
  }

  async getURL(key: string): Promise<string> {
    const filePath = path.join(this.publicPath, key);

    if (fs.existsSync(filePath)) {
      return path.join(this.configService.get('app.baseURL'), key);
    } else {
      throw new BadRequestException('File Not Found');
    }
  }

  async delete(key: string) {
    const filePath = path.join(this.publicPath, key);

    if (fs.existsSync(filePath)) {
      return fs.unlinkSync(filePath);
    } else {
      throw new BadRequestException('File Not Found');
    }
  }

  async download(key: string): Promise<Buffer> {
    const filePath = path.join(this.publicPath, key);

    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    } else {
      throw new BadRequestException('File Not Found');
    }
  }
}
