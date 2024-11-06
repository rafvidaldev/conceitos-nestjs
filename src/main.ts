import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ParseIntIdPipe } from './common/pipes/parse-int.id.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //remove chaves que não estão no DTO,
      forbidNonWhitelisted: true, //retornar erro quando a chave não estiver no DTO
      transform: false //tenta transformar os tipos de dados de param e DTOs
    }),
    new ParseIntIdPipe()
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
