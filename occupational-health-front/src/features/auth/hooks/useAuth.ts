import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import type { LoginFormData, RegisterFormData } from '../types';

// Hook principal de autenticación: encapsula toda la lógica de sesión
export function useAuth() {
  const navigate = useNavigate();
  const { data: sessionData, isPending } = authClient.useSession();

  const signIn = async (data: LoginFormData) => {
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message ?? 'Error al iniciar sesión');
      return false;
    }

    toast.success('Sesión iniciada correctamente');
    await navigate({ to: '/' });
    return true;
  };

  const signUp = async (data: RegisterFormData) => {
    const { error } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
      // Campo adicional de teléfono
      phone: data.phone || undefined,
    } as Parameters<typeof authClient.signUp.email>[0]);

    if (error) {
      toast.error(error.message ?? 'Error al registrar usuario');
      return false;
    }

    toast.success('Cuenta creada correctamente. Inicia sesión.');
    await navigate({ to: '/login' });
    return true;
  };

  const signOut = async () => {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error('Error al cerrar sesión');
      return;
    }

    toast.success('Sesión cerrada');
    await navigate({ to: '/login' });
  };

  return {
    user: sessionData?.user ?? null,
    session: sessionData?.session ?? null,
    isPending,
    signIn,
    signUp,
    signOut,
  };
}
