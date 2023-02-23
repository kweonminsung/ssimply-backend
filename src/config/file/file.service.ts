import { FileUploadResponseDto } from './dtos/upload-response.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v1 } from 'uuid';

@Injectable()
export class FileConfigService {
  private s3 = new AWS.S3({
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    region: 'ap-northeast-2',
  });

  async upload(file: Express.Multer.File): Promise<FileUploadResponseDto> {
    const uuid = v1();

    try {
      const result = await this.s3
        .upload({
          Bucket: process.env.S3_BUCKET_NAME,
          Body: file.buffer,
          Key: uuid,
        })
        .promise();

      return result;
    } catch (e) {
      throw new InternalServerErrorException('failed to upload file');
    }
  }

  async uploadByBuffer(buffer: Buffer, name: string) {
    const uuid = v1();

    try {
      const result = await this.s3
        .upload({
          Bucket: process.env.S3_BUCKET_NAME,
          Body: buffer,
          Key: `${uuid}-${name}`,
        })
        .promise();

      return result;
    } catch (e) {
      throw new InternalServerErrorException('failed to upload file');
    }
  }

  async getURL(key: string): Promise<string> {
    return await this.s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });
  }

  async delete(key: string) {
    try {
      await this.s3
        .deleteObject({
          Bucket: process.env.S3_BUCKET_NAME,
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
            Bucket: process.env.S3_BUCKET_NAME,
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
