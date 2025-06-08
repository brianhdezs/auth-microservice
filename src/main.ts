import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // HABILITAR CORS - MUY IMPORTANTE PARA QUE REACT PUEDA CONECTARSE
  app.enableCors({
    origin: ['http://localhost:3002', 'http://127.0.0.1:3002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
  });
  
  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  // Aplicar el filtro de excepciones global
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Configurar prefijo global
  app.setGlobalPrefix('api');
  
  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('Authentication Microservice API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);
  
  // Iniciar el servidor
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}`);
}

bootstrap();