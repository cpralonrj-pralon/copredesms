import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefixo Global da API
  app.setGlobalPrefix('api/v1');

  // Habilitar CORS para o frontend corporativo
  app.enableCors();

  // Validação Global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend rodando em: http://localhost:${port}/api/v1`);
}
bootstrap();
