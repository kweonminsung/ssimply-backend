import { S3ConfigService } from './s3/file.service';
import { FILE_CONFIG_SERVICE } from './constants/file-config-service.constant';
import { FileConfigType } from './enums/file-config-type.enum';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { LocalConfigService } from './local/file.service';

@Global()
@Module({})
export class FileConfigModule {
  static register(type: FileConfigType): DynamicModule {
    switch (type) {
      case FileConfigType.S3:
        return {
          module: FileConfigModule,
          providers: [
            {
              provide: FILE_CONFIG_SERVICE,
              useClass: S3ConfigService,
            },
          ],
          exports: [FILE_CONFIG_SERVICE],
        };

      case FileConfigType.LOCAL:
        return {
          module: FileConfigModule,
          providers: [
            {
              provide: FILE_CONFIG_SERVICE,
              useClass: LocalConfigService,
            },
          ],
          exports: [FILE_CONFIG_SERVICE],
        };
    }
  }
}
