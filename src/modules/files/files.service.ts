import { FILE_CONFIG_SERVICE } from './../../config/file/constants/file-config-service.constant';
import { FileResponseDto } from 'src/modules/files/dtos/files-response.dto';
import { CommonResponseDto } from './../../common/dtos/common-response.dto';
import { PrismaService } from './../../config/database/prisma.service';
import { FileConfigService } from './../../config/file/file.service';
import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { FileCreateResponseDto } from './dtos/files-create-response.dto';
import { File } from '@prisma/client';
import { OccupiedFilePayload } from './occupied-file.payload';
import { OccupiedCoopType } from './files.enum';
import { base64decoder } from 'src/common/utils/base64decoder';

@Injectable()
export class FilesService {
  constructor(
    @Inject(FILE_CONFIG_SERVICE)
    private readonly fileConfigService: FileConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  private async checkFileExists(uuid: string): Promise<File> {
    let result: File;
    try {
      result = await this.prismaService.file.findUnique({
        where: {
          uuid: uuid,
        },
      });
    } catch (e) {
      throw new BadRequestException(`file with uuid: ${uuid} does not exists`);
    }
    return result;
  }

  async create(
    file: Express.Multer.File,
  ): Promise<CommonResponseDto<FileCreateResponseDto>> {
    const createdFile = await this.prismaService.file.create({
      data: {
        uuid: (await this.fileConfigService.upload(file)).Key,
        name: file.originalname,
        mimeType: file.mimetype,
      },
    });
    return new CommonResponseDto(new FileCreateResponseDto(createdFile));
  }

  async createOccupied(
    file: Express.Multer.File,
    hash: string,
  ): Promise<CommonResponseDto> {
    const payload: OccupiedFilePayload = JSON.parse(base64decoder(hash));

    const createdFile = await this.prismaService.file.create({
      data: {
        uuid: (await this.fileConfigService.upload(file)).Key,
        name: file.originalname,
        mimeType: file.mimetype,
      },
    });

    switch (payload.service) {
      case 'COOP': {
        await this.prismaService.coopCompany_File.create({
          data: {
            coopCompanyId: payload.to,
            type: payload.type as OccupiedCoopType,
            fileId: createdFile.uuid,
          },
        });
        break;
      }
      case 'SALARY': {
        let fileType: string;
        switch (payload.type) {
          case 'IDCARD':
            fileType = 'idCardFileId';
            break;
          case 'ACCOUNT':
            fileType = 'accountFileId';
            break;
          case 'APPLY':
            fileType = 'applyFileId';
            break;
          case 'INSURANCE':
            fileType = 'insuranceFileId';
            break;
          case 'INCOME':
            fileType = 'incomeFileId';
            break;
        }
        await this.prismaService.employee.update({
          where: {
            id: payload.to,
          },
          data: {
            [fileType]: createdFile.uuid,
          },
        });
        break;
      }
      default:
        throw new BadRequestException('invalid request');
    }
    return new CommonResponseDto();
  }

  async get(uuid: string): Promise<FileResponseDto> {
    const file = await this.checkFileExists(uuid);
    const link = await this.fileConfigService.getURL(uuid);
    return new FileResponseDto(file, link);
  }

  async delete(uuid: string): Promise<CommonResponseDto> {
    await this.checkFileExists(uuid);
    await this.fileConfigService.delete(uuid);
    await this.prismaService.file.delete({
      where: {
        uuid,
      },
    });
    return new CommonResponseDto();
  }
}
