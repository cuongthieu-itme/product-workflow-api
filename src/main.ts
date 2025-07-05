import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './swagger.config';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = Number(configService.get('APP_PORT'));

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('/api');

  // Setup Swagger documentation
  setupSwagger(app);

  await app.listen(port, async () => {
    const appURL = await app.getUrl();
    console.log(`🚀 Server is running: ${appURL}`);
    console.log(`📚 Swagger documentation: ${appURL}/api/docs`);
  });
};

export default bootstrap();
