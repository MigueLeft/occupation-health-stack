import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { RolesPermissionsPage } from '@/pages/RolesPermissionsPage';
import { UsersPage } from '@/pages/UsersPage';
import { PatientsPage } from '@/pages/PatientsPage';
import { CompaniesPage } from '@/pages/CompaniesPage';
import { CatalogsPage } from '@/pages/CatalogsPage';
import { RequestsPage } from '@/pages/RequestsPage';
import { ConsultasPage } from '@/pages/ConsultasPage';
import { AttendConsultationPage } from '@/pages/AttendConsultationPage';
import { EditConsultationPage } from '@/pages/EditConsultationPage';
import { ExpedientePage } from '@/pages/ExpedientePage';
import { ConsultationDetailPage } from '@/pages/ConsultationDetailPage';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: async () => {
    let result;
    try {
      result = await authClient.getSession();
    } catch {
      toast.error('No se pudo conectar con el servidor. Verifica que el backend esté activo.');
      return;
    }
    if (!result.error && result.data?.session) {
      throw redirect({ to: '/' });
    }
  },
  component: LoginPage,
});

// Guard compartido para rutas protegidas
async function requireAuth() {
  let result;
  try {
    result = await authClient.getSession();
  } catch {
    toast.error('No se pudo conectar con el servidor. Verifica que el backend esté activo.');
    return;
  }

  if (result.error) {
    toast.error('No se pudo conectar con el servidor. Verifica que el backend esté activo.');
    return;
  }

  // redirect fuera del try/catch para que TanStack Router lo reciba correctamente
  if (!result.data?.session) {
    throw redirect({ to: '/login' });
  }

  return { user: result.data.user, session: result.data.session };
}

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: requireAuth,
  component: DashboardPage,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/usuarios',
  beforeLoad: requireAuth,
  component: UsersPage,
});

const rolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/config/roles',
  beforeLoad: requireAuth,
  component: RolesPermissionsPage,
});

const patientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pacientes',
  beforeLoad: requireAuth,
  component: PatientsPage,
});

const companiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/empresas',
  beforeLoad: requireAuth,
  component: CompaniesPage,
});

const catalogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalogos',
  beforeLoad: requireAuth,
  component: CatalogsPage,
});

const requestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/solicitudes',
  beforeLoad: requireAuth,
  component: RequestsPage,
});

const consultasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/consultas',
  beforeLoad: requireAuth,
  component: ConsultasPage,
});

const consultaAtenderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/consultas/$id/atender',
  beforeLoad: requireAuth,
  component: AttendConsultationPage,
});

const consultaEditarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/consultas/$id/editar',
  beforeLoad: requireAuth,
  component: EditConsultationPage,
});

const expedienteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expedientes/$cedula',
  beforeLoad: requireAuth,
  component: ExpedientePage,
});

const consultationDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expedientes/$cedula/consultas/$id',
  beforeLoad: requireAuth,
  component: ConsultationDetailPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  homeRoute,
  usersRoute,
  rolesRoute,
  patientsRoute,
  companiesRoute,
  catalogsRoute,
  requestsRoute,
  consultasRoute,
  consultaAtenderRoute,
  consultaEditarRoute,
  expedienteRoute,
  consultationDetailRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
