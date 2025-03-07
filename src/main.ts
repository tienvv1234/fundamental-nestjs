import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true, // transform payloads to DTO instances 
    transformOptions: {
      enableImplicitConversion: true // it enable implicit conversion of types no need to specify type in DTO
    }  
  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
