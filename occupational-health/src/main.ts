import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { toNodeHandler } from 'better-auth/node';

import { AppModule } from './app.module';
import { auth } from './auth/auth';

async function bootstrap() {
  // bodyParser: false para que Better-Auth pueda leer el body crudo
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // CORS con soporte de credenciales (cookies de sesión)
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  // Better-Auth se monta ANTES del body parser de Express
  // para que pueda leer el stream del body directamente
  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (req.originalUrl.startsWith('/api/auth')) {
        return toNodeHandler(auth)(req, res);
      }
      next();
    },
  );

  // Body parsing para el resto de rutas de NestJS
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
