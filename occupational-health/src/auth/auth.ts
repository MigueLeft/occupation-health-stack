import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as authSchema from './auth.schema';

// Conexión independiente de la DI de NestJS para Better-Auth
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: authSchema });

// Almacén temporal de tokens de restablecimiento (keyed by email)
export const resetTokenStore = new Map<string, string>();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: authSchema.user,
      session: authSchema.session,
      account: authSchema.account,
      verification: authSchema.verification,
    },
  }),
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.FRONTEND_URL ?? 'http://localhost:5173'],
  emailAndPassword: {
    enabled: true,
    // Captura el token crudo para uso interno vía clave maestra
    sendResetPassword: async ({
      user,
      url,
    }: {
      user: { email: string };
      url: string;
    }) => {
      try {
        const rawToken = new URL(url).searchParams.get('token');
        if (rawToken) resetTokenStore.set(user.email, rawToken);
      } catch {
        /* ignorar URLs malformadas */
      }
    },
  },
  plugins: [
    // Plugin admin para RBAC: permite gestionar roles (admin, user)
    admin(),
  ],
  user: {
    // Campos adicionales del usuario
    additionalFields: {
      phone: {
        type: 'string',
        required: false,
        input: true,
      },
      roleId: {
        type: 'string',
        required: false,
        input: false, // no se puede setear en signup, solo internamente
        returned: true,
      },
    },
  },
});

export type Auth = typeof auth;
