import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app/config.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { AuthModule } from './modules/auth/auth.module';
import { SupportprogramsModule } from './modules/supportprograms/supportprograms.module';
import { EmailModule } from './config/email/email.module';
import { FilesModule } from './modules/files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    CompaniesModule,
    AuthModule,
    EmailModule,
    SupportprogramsModule,
    FilesModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
