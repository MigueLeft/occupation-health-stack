/**
 * Seed script para datos iniciales del sistema.
 * Ejecutar DESPUÉS de correr las migraciones:
 *   pnpm db:generate && pnpm db:migrate && pnpm seed
 */
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { roles, type PermissionsMatrix } from '../roles/roles.schema';
import { user } from '../auth/auth.schema';
import { auth } from '../auth/auth';
import { SYSTEM_MODULES } from '../roles/constants';

const MODULES = SYSTEM_MODULES.map((m) => m.key);

function allPermissions(): PermissionsMatrix {
  return Object.fromEntries(
    MODULES.map((m) => [
      m,
      { view: true, create: true, edit: true, delete: true },
    ]),
  );
}

const ROLES_DATA = [
  {
    name: 'Administración',
    description: 'Secretarias y personal de atención de la clínica',
    isVisible: true,
    permissions: {
      users: { view: true, create: true, edit: true, delete: true },
      roles: { view: true },
      patients: { view: true, create: true, edit: true, delete: true },
      companies: { view: true, create: true, edit: true, delete: true },
      positions: { view: true, create: true, edit: true, delete: true },
      requests: { view: true, create: true, edit: true, delete: true },
      consultations: { view: true },
      physical_exams: { view: true },
      exam_results: { view: true },
      rest_periods: { view: true },
      diagnostics: { view: true },
      psychometric_tests: { view: true },
      reports: { view: true },
      catalogs: { view: true },
    } as PermissionsMatrix,
  },
  {
    name: 'Médicos',
    description: 'Personal médico con acceso clínico completo',
    isVisible: true,
    permissions: {
      patients: { view: true },
      requests: { view: true, edit: true },
      consultations: { view: true, create: true, edit: true },
      physical_exams: { view: true, create: true, edit: true },
      exam_results: { view: true, create: true, edit: true },
      rest_periods: { view: true, create: true, edit: true },
      diagnostics: { view: true, create: true, edit: true },
      psychometric_tests: { view: true, create: true, edit: true },
      reports: { view: true },
      catalogs: { view: true },
    } as PermissionsMatrix,
  },
  {
    name: 'Asistente de Médicos',
    description: 'Asistentes con acceso clínico (puede cambiar con el tiempo)',
    isVisible: true,
    permissions: {
      patients: { view: true },
      requests: { view: true, edit: true },
      consultations: { view: true, create: true, edit: true },
      physical_exams: { view: true, create: true, edit: true },
      exam_results: { view: true, create: true, edit: true },
      rest_periods: { view: true, create: true, edit: true },
      diagnostics: { view: true, create: true, edit: true },
      psychometric_tests: { view: true, create: true, edit: true },
      reports: { view: true },
      catalogs: { view: true },
    } as PermissionsMatrix,
  },
  {
    name: 'Admin',
    description: 'Administrador del sistema con todos los permisos',
    isVisible: false,
    permissions: allPermissions(),
  },
  {
    name: 'Desarrollo',
    description: 'Equipo de desarrollo con acceso total al sistema',
    isVisible: false,
    permissions: allPermissions(),
  },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool);

  console.log('🌱 Iniciando seed...\n');

  // Crear roles
  console.log('📋 Creando roles...');
  for (const roleData of ROLES_DATA) {
    await db
      .insert(roles)
      .values(roleData)
      .onConflictDoNothing({ target: roles.name });
    console.log(
      `  ✓ ${roleData.name} (${roleData.isVisible ? 'visible' : 'oculto'})`,
    );
  }

  // Obtener el rol Admin para asignarlo al usuario por defecto
  const [adminRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, 'Admin'));

  if (!adminRole) {
    throw new Error('No se pudo encontrar el rol Admin después de crearlo');
  }

  // Crear usuario admin por defecto
  console.log('\n👤 Creando usuario administrador por defecto...');

  const adminEmail = 'admin@salud-ocupacional.com';

  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, adminEmail));

  if (existingUser) {
    console.log(
      `  ℹ️  El usuario ${adminEmail} ya existe, actualizando rol...`,
    );
    await db
      .update(user)
      .set({ roleId: adminRole.id, role: 'admin' })
      .where(eq(user.id, existingUser.id));
  } else {
    const response = await auth.api.signUpEmail({
      body: {
        name: 'Admin',
        email: adminEmail,
        password: 'Admin@2025!',
      },
    });

    let userId: string | null = null;

    if (response instanceof Response) {
      if (!response.ok) {
        const err = (await response.json()) as { message?: string };
        throw new Error(`Error creando usuario: ${err.message}`);
      }
      const data = (await response.json()) as { user: { id: string } };
      userId = data.user.id;
    } else {
      userId = (response as { user: { id: string } }).user?.id ?? null;
    }

    if (userId) {
      await db
        .update(user)
        .set({ roleId: adminRole.id, role: 'admin' })
        .where(eq(user.id, userId));

      console.log(`  ✓ Usuario creado: ${adminEmail}`);
      console.log(`  ✓ Contraseña temporal: Admin@2025!`);
      console.log(`  ✓ Rol asignado: Admin`);
    }
  }

  console.log('\n✅ Seed completado exitosamente!\n');
  console.log('='.repeat(50));
  console.log('Credenciales de acceso:');
  console.log(`  Email:      ${adminEmail}`);
  console.log('  Contraseña: Admin@2025!');
  console.log('='.repeat(50));

  await pool.end();
}

main().catch((err) => {
  console.error('❌ Error en el seed:', err);
  process.exit(1);
});
