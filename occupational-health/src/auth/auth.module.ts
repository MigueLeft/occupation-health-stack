import { Module } from '@nestjs/common';

// El módulo de autenticación es manejado como middleware de Express en main.ts.
// Este módulo existe como punto de extensión para futuros guards y decoradores.
@Module({})
export class AuthModule {}
