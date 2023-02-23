import { ConfigService } from '@nestjs/config';
import { FileConfigService } from './../file.service';
import { FileUploadResponseDto } from '../dtos/upload-response.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v1 } from 'uuid';

@Injectable()
export class S3ConfigService implements FileConfigService {
  constructor(private readonly configService: ConfigService) {}

  private s3 = new AWS.S3({
    credentials: {
      accessKeyId: this.configService.get('s3.key'),
      secretAccessKey: this.configService.get('s3.secret'),
    },
    region: 'ap-northeast-2',
  });

  async upload(file: Express.Multer.File): Promise<FileUploadResponseDto> {
    const uuid = `${v1()}-${file.originalname}`;

    try {
      const result = await this.s3
        .upload({
          Bucket: this.configService.get('s3.bucket'),
          Body: file.buffer,
          Key: uuid,
        })
        .promise();

      return result;
    } catch (e) {
      throw new InternalServerErrorException('failed to upload file');
    }
  }

  async uploadByBuffer(
    buffer: Buffer,
    name: string,
  ): Promise<FileUploadResponseDto> {
    const uuid = `${v1()}-${name}`;

    try {
      const result = await this.s3
        .upload({
          Bucket: this.configService.get('s3.bucket'),
          Body: buffer,
          Key: uuid,
        })
        .promise();

      return result;
    } catch (e) {
      throw new InternalServerErrorException('failed to upload file');
    }
  }

  async getURL(key: string): Promise<string> {
    return await this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.configService.get('s3.bucket'),
      Key: key,
    });
  }

  async delete(key: string) {
    try {
      await this.s3
        .deleteObject({
          Bucket: this.configService.get('s3.bucket'),
          Key: key,
        })
        .promise();
    } catch (e) {
      throw new InternalServerErrorException('failed to delete file');
    }
  }

  async download(key: string): Promise<Buffer> {
    try {
      const result = (
        await this.s3
          .getObject({
            Bucket: this.configService.get('s3.bucket'),
            Key: key,
          })
          .promise()
      ).Body as Buffer;

      return result;
    } catch (e) {
      throw new InternalServerErrorException('cannot to download file');
    }
  }
}
