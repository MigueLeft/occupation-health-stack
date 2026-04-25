import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';

// Cliente de Better-Auth con soporte de plugin admin (RBAC)
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  plugins: [adminClient()],
  fetchOptions: {
    credentials: 'include', // Necesario para enviar cookies de sesión
  },
});

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
