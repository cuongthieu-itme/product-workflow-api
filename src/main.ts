import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './swagger.config';
import { corsConfig } from './cors.config';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = Number(configService.get('APP_PORT'));

  // Cấu hình CORS cho phép tất cả
  app.enableCors(corsConfig);

  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('/api');

  setupSwagger(app);

  await app.listen(port, async () => {
    const appURL = await app.getUrl();
    console.log(`🚀 Server is running: ${appURL}`);
    console.log(`📚 Swagger documentation: ${appURL}/api/docs`);
    console.log(`🌐 CORS: Allow ALL origins, methods, headers`);
  });
};

export default bootstrap();
