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
import { risks } from '../risks/risks.schema';
import { exams } from '../exams/exams.schema';
import { psychometricTestCatalog } from '../psychometric-test-catalog/psychometric-test-catalog.schema';

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

  // Crear catálogo de riesgos
  console.log('\n⚠️  Creando catálogo de riesgos...');
  const RISKS_DATA = [
    { name: 'Ruidos', type: 'Fisico' },
    { name: 'Calor', type: 'Fisico' },
    { name: 'Vibraciones', type: 'Fisico' },
    { name: 'Radiaciones', type: 'Fisico' },
    { name: 'Humo', type: 'Quimico' },
    { name: 'Polvos', type: 'Quimico' },
    { name: 'Metales', type: 'Quimico' },
    { name: 'Gases', type: 'Quimico' },
    { name: 'Solventes', type: 'Quimico' },
    { name: 'Exp. Animales', type: 'Biologico' },
    { name: 'Contacto Desechos', type: 'Biologico' },
    { name: 'Aglomeraciones', type: 'Biologico' },
    { name: 'Atencion al público', type: 'Biologico' },
    { name: 'Microorganismos', type: 'Biologico' },
    { name: 'Caidas', type: 'Mecanico' },
    { name: 'Objetos filosos', type: 'Mecanico' },
    { name: 'Trabajo en altura', type: 'Mecanico' },
    { name: 'Caidas de objetos', type: 'Mecanico' },
    { name: 'Atrapamiento', type: 'Mecanico' },
    { name: 'Sedestacion prolongada', type: 'Disergonomicos' },
    { name: 'Bipedestacion prolongada', type: 'Disergonomicos' },
    { name: 'Manipulacion manual de carga', type: 'Disergonomicos' },
    { name: 'Halar o empujar', type: 'Disergonomicos' },
    { name: 'Movimientos repetitivos', type: 'Disergonomicos' },
    { name: 'Sobrecarga mental', type: 'Psicosocial' },
    { name: 'Atencion sostenida', type: 'Psicosocial' },
    { name: 'Estilos de mando supervisorio rigido', type: 'Psicosocial' },
    { name: 'Horas extra', type: 'Psicosocial' },
    { name: 'Aislamiento', type: 'Psicosocial' },
    { name: 'Esfuerzo visual', type: 'Psicosocial' },
  ];
  for (const risk of RISKS_DATA) {
    await db.insert(risks).values(risk).onConflictDoNothing({ target: risks.name });
    console.log(`  ✓ [${risk.type}] ${risk.name}`);
  }

  // Crear catálogo de exámenes
  console.log('\n🔬 Creando catálogo de exámenes...');
  const EXAMS_DATA = [
    { name: 'Hematologia completa', category: 'Laboratorio' },
    { name: 'Quimica sanguinea', category: 'Laboratorio' },
    { name: 'Perfil lipidico', category: 'Laboratorio' },
    { name: 'VDRL', category: 'Laboratorio' },
    { name: 'Orina', category: 'Laboratorio' },
    { name: 'Heces', category: 'Laboratorio' },
    { name: 'Rx Torax PA', category: 'Estudio de Imagenes' },
    { name: 'Rx Columna cervical', category: 'Estudio de Imagenes' },
    { name: 'Rx Columna LS', category: 'Estudio de Imagenes' },
    { name: 'Rx Columna dorsal', category: 'Estudio de Imagenes' },
    { name: 'Audiometria', category: 'Pruebas Especiales' },
    { name: 'Espirometria', category: 'Pruebas Especiales' },
    { name: 'Goniometria', category: 'Pruebas Especiales' },
    { name: 'Agudeza visual', category: 'Pruebas Especiales' },
    { name: 'Certificado de salud', category: 'Pruebas Especiales' },
  ];
  for (const exam of EXAMS_DATA) {
    await db.insert(exams).values(exam).onConflictDoNothing({ target: exams.name });
    console.log(`  ✓ [${exam.category}] ${exam.name}`);
  }

  // Crear catálogo de tests psicométricos
  console.log('\n🧠 Creando catálogo de tests psicométricos...');
  const PSYCHOMETRIC_DATA = [
    { name: '16 PF 5' },
    { name: '16 PF' },
    { name: 'Test de Kostick' },
    { name: 'IPV' },
    { name: 'Test de Barsit' },
    { name: 'Raven' },
    { name: 'Wartegg' },
    { name: 'Persona bajo la lluvia' },
  ];
  for (const test of PSYCHOMETRIC_DATA) {
    await db
      .insert(psychometricTestCatalog)
      .values(test)
      .onConflictDoNothing({ target: psychometricTestCatalog.name });
    console.log(`  ✓ ${test.name}`);
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
