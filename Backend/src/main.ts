import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();

  // Enable DTO validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // removes extra fields
      forbidNonWhitelisted: true, // throws error for extra fields
      transform: true,        // auto transform types (string → number)
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();