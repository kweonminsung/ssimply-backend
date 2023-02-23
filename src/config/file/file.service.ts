import { FileUploadResponseDto } from './dtos/upload-response.dto';

export interface FileConfigService {
  upload(file: Express.Multer.File): Promise<FileUploadResponseDto>;

  uploadByBuffer(buffer: Buffer, name: string): Promise<FileUploadResponseDto>;

  getURL(key: string): Promise<string>;

  delete(key: string);

  download(key: string): Promise<Buffer>;
}
