import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as authSchema from './auth.schema';

// Conexión independiente de la DI de NestJS para Better-Auth
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: authSchema });

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
    },
  },
});

export type Auth = typeof auth;
