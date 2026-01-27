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

  // Log de inicialização para auxiliar no debug do Railway
  console.log('--- Iniciando Backend ---');
  console.log(`Porta configurada: ${port}`);
  console.log(`Node Environment: ${process.env.NODE_ENV}`);

  // Verificar variáveis críticas
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('AVISO: Variáveis do Supabase não configuradas!');
  }

  await app.listen(port, '0.0.0.0');
  console.log(`Backend rodando em: http://0.0.0.0:${port}/api/v1`);
}
bootstrap();
