/* eslint-disable */
/*
 @auhor : © 2024 Valens Niyonsenga <valensniyonsenga2003@gmail.com>
*/

/**
 * @file
 * @brief file for Main App
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cors from 'cors';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    cors({
      origin: '*',
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('KABSTORE BACKEND API')
    .setDescription(
      'This is the inventory management for Kabstore sho, By LEINS',
    )
    .setVersion('1.0')
    .addTag('Kabstore')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions:{
      persistAuthorization:true
    }
  });
  app.useGlobalPipes(new ValidationPipe());
  // app.useGlobalFilters(new GlobalExceptionFilter());
  app.listen(3001).then(_d => {
    console.log(`Server listening at: http://localhost:3001`);
    console.log('Swagger api: http://localhost:3001/api');
  });
 

  // insert the roles in the database at the application starting
}
bootstrap();
