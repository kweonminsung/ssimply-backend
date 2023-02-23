export class FileUploadResponseDto {
  Location?: string;
  ETag?: string;
  Bucket?: string;
  Key: string;

  constructor(key: string) {
    this.Key = key;
  }
}
