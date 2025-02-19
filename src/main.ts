import { VersioningType, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './config/database/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix('v1');

  // GlobalPipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://ssimply.kro.kr',
      'https://ssimply.kro.kr',
    ],
    credentials: true,
  });

  // Env settings
  const appConfig = app.get(ConfigService);

  // Config for Prisma
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // Config for Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SSimply')
    .setDescription('The API description for ssimply-backend')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  console.log(`==== Running as ${process.env.APP_ENV} ====`);
  await app.listen(appConfig.get('app.port'));
}
bootstrap();
