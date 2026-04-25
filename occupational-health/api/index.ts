// [SERVERLESS] Archivo de entrada para Vercel. Remover carpeta api/ y vercel.json al migrar a servidor dedicado.
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Request, type Response, type NextFunction } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from '../src/app.module';
import { auth } from '../src/auth/auth';

let cachedApp: express.Express | null = null;

async function bootstrap(): Promise<express.Express> {
  if (cachedApp) return cachedApp;

  const server = express();
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    bodyParser: false,
    logger: ['error', 'warn'],
  });

  nestApp.enableCors({
    origin: process.env.FRONTEND_URL ?? '*',
    credentials: true,
  });

  nestApp.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith('/api/auth')) {
      return toNodeHandler(auth)(req, res);
    }
    next();
  });

  nestApp.use(express.json());
  nestApp.use(express.urlencoded({ extended: true }));

  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await nestApp.init();
  cachedApp = server;
  return server;
}

export default async function handler(req: Request, res: Response) {
  const app = await bootstrap();
  app(req, res);
}
