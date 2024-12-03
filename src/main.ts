import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ParseIntIdPipe } from './common/pipes/parse-int.id.pipe';
import appConfig from './app/app.config';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appConfig(app);

  if(process.env.NODE_ENV === 'production'){
    //helmet -> cabeçalhos de segurança no protocolo HTTP
    app.use(helmet());

    //cors -> permitir que outro domínio faça requests na sua aplicação
    app.enableCors({
      origin: 'https://rafvidal.dev'
    });
  }

  const documentBuilderConfig = new DocumentBuilder()
    .setTitle('Recados API')
    .setDescription('Recados para amigos e familiares')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilderConfig);

  SwaggerModule.setup('docs', app, document);
  
  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
