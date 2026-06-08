/**
 * Seed script para datos iniciales del sistema.
 * Ejecutar DESPUÉS de correr las migraciones:
 *   pnpm db:generate && pnpm db:migrate && pnpm seed
 */
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, count } from 'drizzle-orm';
import { roles, type PermissionsMatrix } from '../roles/roles.schema';
import { user } from '../auth/auth.schema';
import { auth } from '../auth/auth';
import { SYSTEM_MODULES } from '../roles/constants';
import { risks, RISK_TYPES } from '../risks/risks.schema';
import { exams } from '../exams/exams.schema';
import { psychometricTestCatalog } from '../psychometric-test-catalog/psychometric-test-catalog.schema';
import { bodySystems } from '../body-systems/body-systems.schema';
import { diseaseCategories } from '../disease-categories/disease-categories.schema';
import { diseases } from '../diseases/diseases.schema';
import { companies } from '../companies/companies.schema';
import { positions } from '../positions/positions.schema';
import { patients } from '../patients/patients.schema';
import { riskExposureCategories } from '../risk-exposure-categories/risk-exposure-categories.schema';
import {
  psychologicalIndicators,
  psychologicalIndicatorValues,
} from '../psychological-indicators/psychological-indicators.schema';

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
    isVisible: true,
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

  // Asegurar que el rol Admin sea visible en bases de datos existentes
  await db.update(roles).set({ isVisible: true }).where(eq(roles.name, 'Admin'));

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
    await db
      .insert(risks)
      .values(risk)
      .onConflictDoNothing({ target: risks.name });
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
    await db
      .insert(exams)
      .values(exam)
      .onConflictDoNothing({ target: exams.name });
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

  // Crear aparatos / sistemas corporales (CIE-10)
  console.log('\n🫀 Creando aparatos y sistemas corporales...');
  const BODY_SYSTEMS_DATA = [
    { name: 'Sistema Nervioso' },
    { name: 'Aparato Circulatorio' },
    { name: 'Aparato Respiratorio' },
    { name: 'Aparato Digestivo' },
    { name: 'Aparato Genitourinario' },
    { name: 'Sistema Musculoesquelético y Tejido Conjuntivo' },
    { name: 'Sistema Endocrino, Nutricional y Metabólico' },
    { name: 'Sangre y Órganos Hematopoyéticos' },
    { name: 'Piel y Tejido Subcutáneo' },
    { name: 'Ojo y Anexos Oculares' },
    { name: 'Oído y Apófisis Mastoides' },
    { name: 'Trastornos Mentales y del Comportamiento' },
    { name: 'Sistema Reproductor' },
    { name: 'Sistema Inmunológico' },
  ];
  for (const bs of BODY_SYSTEMS_DATA) {
    await db
      .insert(bodySystems)
      .values(bs)
      .onConflictDoNothing({ target: bodySystems.name });
    console.log(`  ✓ ${bs.name}`);
  }

  // Crear categorías de diagnóstico
  console.log('\n📂 Creando categorías de diagnóstico...');
  const DISEASE_CATEGORIES_DATA = [
    { name: 'Enfermedad Laboral' },
    { name: 'Enfermedad Comun' },
    { name: 'Accidente Laboral' },
    { name: 'Accidente Comun' },
    // { name: 'Enfermedades Infecciosas y Parasitarias' },
    // { name: 'Neoplasias' },
    // { name: 'Enfermedades de la Sangre y Órganos Hematopoyéticos' },
    // { name: 'Enfermedades Endocrinas, Nutricionales y Metabólicas' },
    // { name: 'Trastornos Mentales y del Comportamiento' },
    // { name: 'Enfermedades del Sistema Nervioso' },
    // { name: 'Enfermedades del Ojo y sus Anexos' },
    // { name: 'Enfermedades del Oído' },
    // { name: 'Enfermedades del Aparato Circulatorio' },
    // { name: 'Enfermedades del Aparato Respiratorio' },
    // { name: 'Enfermedades del Aparato Digestivo' },
    // { name: 'Enfermedades de la Piel y Tejido Subcutáneo' },
    // { name: 'Enfermedades del Sistema Musculoesquelético y Tejido Conjuntivo' },
    // { name: 'Enfermedades del Aparato Genitourinario' },
    // { name: 'Embarazo, Parto y Puerperio' },
    // { name: 'Malformaciones Congénitas y Anomalías Cromosómicas' },
    // { name: 'Traumatismos, Envenenamientos y Causas Externas' },
    // { name: 'Factores que Influyen en el Estado de Salud' },
    // { name: 'Síntomas, Signos y Hallazgos Anormales' },
  ];
  for (const dc of DISEASE_CATEGORIES_DATA) {
    await db
      .insert(diseaseCategories)
      .values(dc)
      .onConflictDoNothing({ target: diseaseCategories.name });
    console.log(`  ✓ ${dc.name}`);
  }

  // Crear enfermedades basadas en CIE-10
  console.log('\n🦠 Creando enfermedades (CIE-10)...');
  const DISEASES_DATA = [
    // ── Capítulo I: Enfermedades Infecciosas y Parasitarias (A00-B99) ──
    { name: 'Tuberculosis pulmonar', isChronic: false },
    { name: 'Tuberculosis extrapulmonar', isChronic: false },
    { name: 'VIH/SIDA', isChronic: true },
    { name: 'Hepatitis A', isChronic: false },
    { name: 'Hepatitis B crónica', isChronic: true },
    { name: 'Hepatitis C crónica', isChronic: true },
    { name: 'Malaria', isChronic: false },
    { name: 'Dengue', isChronic: false },
    { name: 'Dengue grave', isChronic: false },
    { name: 'Influenza', isChronic: false },
    { name: 'COVID-19', isChronic: false },
    { name: 'Infección por Salmonella', isChronic: false },
    { name: 'Leishmaniasis', isChronic: false },
    { name: 'Enfermedad de Chagas', isChronic: true },
    { name: 'Toxoplasmosis', isChronic: false },
    { name: 'Leptospirosis', isChronic: false },
    { name: 'Varicela', isChronic: false },
    { name: 'Herpes zóster', isChronic: false },
    { name: 'Sífilis', isChronic: false },
    { name: 'Gonorrea', isChronic: false },
    { name: 'Tétanos', isChronic: false },
    { name: 'Brucelosis', isChronic: false },
    { name: 'Paludismo', isChronic: false },
    { name: 'Amebiasis', isChronic: false },
    { name: 'Giardiasis', isChronic: false },
    { name: 'Cisticercosis', isChronic: false },
    { name: 'Rabia', isChronic: false },
    // ── Capítulo II: Neoplasias (C00-D48) ──
    { name: 'Cáncer de pulmón', isChronic: false },
    { name: 'Cáncer de mama', isChronic: false },
    { name: 'Cáncer de colon', isChronic: false },
    { name: 'Cáncer de cuello uterino', isChronic: false },
    { name: 'Cáncer de próstata', isChronic: false },
    { name: 'Cáncer gástrico', isChronic: false },
    { name: 'Cáncer de hígado', isChronic: false },
    { name: 'Cáncer de páncreas', isChronic: false },
    { name: 'Leucemia linfoblástica aguda', isChronic: false },
    { name: 'Leucemia mieloide crónica', isChronic: true },
    { name: 'Linfoma de Hodgkin', isChronic: false },
    { name: 'Linfoma no Hodgkin', isChronic: false },
    { name: 'Melanoma', isChronic: false },
    { name: 'Cáncer de vejiga', isChronic: false },
    { name: 'Cáncer de tiroides', isChronic: false },
    { name: 'Mieloma múltiple', isChronic: true },
    // ── Capítulo III: Sangre y Órganos Hematopoyéticos (D50-D89) ──
    { name: 'Anemia ferropénica', isChronic: false },
    { name: 'Anemia perniciosa', isChronic: true },
    { name: 'Anemia drepanocítica', isChronic: true },
    { name: 'Talasemia', isChronic: true },
    { name: 'Trombocitopenia', isChronic: false },
    { name: 'Hemofilia', isChronic: true },
    { name: 'Púrpura trombocitopénica idiopática', isChronic: false },
    { name: 'Policitemia vera', isChronic: true },
    // ── Capítulo IV: Endocrinas, Nutricionales y Metabólicas (E00-E90) ──
    { name: 'Diabetes mellitus tipo 1', isChronic: true },
    { name: 'Diabetes mellitus tipo 2', isChronic: true },
    { name: 'Hipotiroidismo', isChronic: true },
    { name: 'Hipertiroidismo', isChronic: true },
    { name: 'Bocio', isChronic: true },
    { name: 'Obesidad', isChronic: true },
    { name: 'Sobrepeso', isChronic: false },
    { name: 'Síndrome metabólico', isChronic: true },
    { name: 'Dislipidemia', isChronic: true },
    { name: 'Hipercolesterolemia', isChronic: true },
    { name: 'Hipertrigliceridemia', isChronic: true },
    { name: 'Gota', isChronic: true },
    { name: 'Síndrome de Cushing', isChronic: false },
    { name: 'Insuficiencia suprarrenal', isChronic: true },
    { name: 'Deficiencia de vitamina D', isChronic: false },
    { name: 'Desnutrición proteico-calórica', isChronic: false },
    // ── Capítulo V: Trastornos Mentales y del Comportamiento (F00-F99) ──
    { name: 'Demencia por enfermedad de Alzheimer', isChronic: true },
    { name: 'Demencia vascular', isChronic: true },
    { name: 'Trastornos debidos al uso del alcohol', isChronic: true },
    { name: 'Dependencia a sustancias psicoactivas', isChronic: true },
    { name: 'Esquizofrenia', isChronic: true },
    { name: 'Trastorno esquizoafectivo', isChronic: true },
    { name: 'Trastorno bipolar', isChronic: true },
    { name: 'Episodio depresivo mayor', isChronic: false },
    { name: 'Depresión mayor recurrente', isChronic: true },
    { name: 'Trastorno distímico', isChronic: true },
    { name: 'Trastorno de ansiedad generalizada', isChronic: true },
    { name: 'Trastorno de pánico', isChronic: false },
    { name: 'Fobia social', isChronic: false },
    { name: 'Trastorno obsesivo-compulsivo', isChronic: true },
    { name: 'Trastorno de estrés postraumático', isChronic: false },
    { name: 'Trastorno de adaptación', isChronic: false },
    { name: 'Trastorno del espectro autista', isChronic: true },
    {
      name: 'TDAH (Trastorno por déficit de atención e hiperactividad)',
      isChronic: true,
    },
    { name: 'Trastorno de la conducta alimentaria', isChronic: false },
    { name: 'Insomnio', isChronic: false },
    // ── Capítulo VI: Enfermedades del Sistema Nervioso (G00-G99) ──
    { name: 'Meningitis bacteriana', isChronic: false },
    { name: 'Meningitis viral', isChronic: false },
    { name: 'Epilepsia', isChronic: true },
    { name: 'Migraña', isChronic: true },
    { name: 'Cefalea tensional', isChronic: false },
    { name: 'Enfermedad de Parkinson', isChronic: true },
    { name: 'Esclerosis múltiple', isChronic: true },
    { name: 'Neuropatía periférica', isChronic: true },
    { name: 'Polineuropatía diabética', isChronic: true },
    { name: 'Síndrome de Guillain-Barré', isChronic: false },
    { name: 'Síndrome del túnel carpiano', isChronic: false },
    { name: 'Accidente cerebrovascular isquémico', isChronic: false },
    { name: 'Accidente cerebrovascular hemorrágico', isChronic: false },
    { name: 'Esclerosis lateral amiotrófica', isChronic: true },
    { name: 'Miastenia gravis', isChronic: true },
    { name: 'Vértigo posicional paroxístico benigno', isChronic: false },
    // ── Capítulo VII: Enfermedades del Ojo y sus Anexos (H00-H59) ──
    { name: 'Conjuntivitis', isChronic: false },
    { name: 'Cataratas', isChronic: false },
    { name: 'Glaucoma', isChronic: true },
    { name: 'Retinopatía diabética', isChronic: true },
    { name: 'Degeneración macular', isChronic: true },
    { name: 'Estrabismo', isChronic: false },
    { name: 'Miopía', isChronic: true },
    { name: 'Astigmatismo', isChronic: true },
    { name: 'Uveítis', isChronic: false },
    { name: 'Pterigión', isChronic: false },
    // ── Capítulo VIII: Enfermedades del Oído (H60-H95) ──
    { name: 'Otitis media aguda', isChronic: false },
    { name: 'Otitis media crónica', isChronic: true },
    { name: 'Otitis externa', isChronic: false },
    { name: 'Hipoacusia neurosensorial', isChronic: true },
    { name: 'Hipoacusia conductiva', isChronic: false },
    { name: 'Tinnitus', isChronic: true },
    { name: 'Enfermedad de Ménière', isChronic: true },
    // ── Capítulo IX: Enfermedades del Aparato Circulatorio (I00-I99) ──
    { name: 'Hipertensión arterial esencial', isChronic: true },
    { name: 'Hipertensión pulmonar', isChronic: true },
    { name: 'Cardiopatía isquémica crónica', isChronic: true },
    { name: 'Angina de pecho', isChronic: true },
    { name: 'Infarto agudo de miocardio', isChronic: false },
    { name: 'Insuficiencia cardíaca', isChronic: true },
    { name: 'Fibrilación auricular', isChronic: true },
    { name: 'Flutter auricular', isChronic: false },
    { name: 'Taquicardia supraventricular', isChronic: false },
    { name: 'Bloqueo auriculoventricular', isChronic: true },
    { name: 'Cardiopatía reumática', isChronic: true },
    { name: 'Miocardiopatía dilatada', isChronic: true },
    { name: 'Endocarditis infecciosa', isChronic: false },
    { name: 'Pericarditis', isChronic: false },
    { name: 'Enfermedad arterial periférica', isChronic: true },
    { name: 'Trombosis venosa profunda', isChronic: false },
    { name: 'Tromboembolia pulmonar', isChronic: false },
    { name: 'Várices de miembros inferiores', isChronic: true },
    { name: 'Aneurisma aórtico', isChronic: false },
    // ── Capítulo X: Enfermedades del Aparato Respiratorio (J00-J99) ──
    { name: 'Rinofaringitis aguda (resfriado común)', isChronic: false },
    { name: 'Sinusitis aguda', isChronic: false },
    { name: 'Sinusitis crónica', isChronic: true },
    { name: 'Rinitis alérgica', isChronic: true },
    { name: 'Faringitis aguda', isChronic: false },
    { name: 'Amigdalitis aguda', isChronic: false },
    { name: 'Laringitis aguda', isChronic: false },
    { name: 'Bronquitis aguda', isChronic: false },
    { name: 'Bronquitis crónica', isChronic: true },
    { name: 'Asma bronquial', isChronic: true },
    { name: 'EPOC (Enfermedad Pulmonar Obstructiva Crónica)', isChronic: true },
    { name: 'Enfisema pulmonar', isChronic: true },
    { name: 'Neumonía bacteriana', isChronic: false },
    { name: 'Neumonía viral', isChronic: false },
    { name: 'Pleuritis', isChronic: false },
    { name: 'Derrame pleural', isChronic: false },
    { name: 'Neumotórax', isChronic: false },
    { name: 'Fibrosis pulmonar idiopática', isChronic: true },
    { name: 'Apnea obstructiva del sueño', isChronic: true },
    { name: 'Silicosis', isChronic: true },
    { name: 'Asbestosis', isChronic: true },
    // ── Capítulo XI: Enfermedades del Aparato Digestivo (K00-K93) ──
    { name: 'Esofagitis', isChronic: false },
    { name: 'Reflujo gastroesofágico', isChronic: true },
    { name: 'Úlcera gástrica', isChronic: false },
    { name: 'Úlcera duodenal', isChronic: false },
    { name: 'Gastritis aguda', isChronic: false },
    { name: 'Gastritis crónica', isChronic: true },
    { name: 'Enfermedad de Crohn', isChronic: true },
    { name: 'Colitis ulcerosa', isChronic: true },
    { name: 'Síndrome de intestino irritable', isChronic: true },
    { name: 'Diverticulosis del colon', isChronic: true },
    { name: 'Diverticulitis', isChronic: false },
    { name: 'Apendicitis aguda', isChronic: false },
    { name: 'Colelitiasis', isChronic: false },
    { name: 'Colecistitis aguda', isChronic: false },
    { name: 'Pancreatitis aguda', isChronic: false },
    { name: 'Pancreatitis crónica', isChronic: true },
    { name: 'Cirrosis hepática', isChronic: true },
    { name: 'Hígado graso no alcohólico (NAFLD)', isChronic: true },
    { name: 'Hemorragia digestiva alta', isChronic: false },
    { name: 'Hemorroides', isChronic: true },
    // ── Capítulo XII: Piel y Tejido Subcutáneo (L00-L99) ──
    { name: 'Dermatitis de contacto', isChronic: false },
    { name: 'Dermatitis atópica', isChronic: true },
    { name: 'Psoriasis', isChronic: true },
    { name: 'Urticaria', isChronic: false },
    { name: 'Urticaria crónica', isChronic: true },
    { name: 'Acné vulgar', isChronic: false },
    { name: 'Rosácea', isChronic: true },
    { name: 'Vitiligo', isChronic: true },
    { name: 'Alopecia areata', isChronic: true },
    { name: 'Eccema', isChronic: true },
    { name: 'Celulitis infecciosa', isChronic: false },
    { name: 'Tinea pedis (pie de atleta)', isChronic: false },
    { name: 'Onixis por hongos', isChronic: false },
    { name: 'Escabiosis (sarna)', isChronic: false },
    // ── Capítulo XIII: Sistema Musculoesquelético (M00-M99) ──
    { name: 'Artritis reumatoide', isChronic: true },
    { name: 'Osteoartritis (artrosis)', isChronic: true },
    { name: 'Osteoporosis', isChronic: true },
    { name: 'Osteopenia', isChronic: true },
    { name: 'Fibromialgia', isChronic: true },
    { name: 'Lupus eritematoso sistémico', isChronic: true },
    { name: 'Espondilitis anquilosante', isChronic: true },
    { name: 'Artritis psoriásica', isChronic: true },
    { name: 'Artritis reactiva', isChronic: false },
    { name: 'Gota articular', isChronic: true },
    { name: 'Lumbalgia crónica', isChronic: true },
    { name: 'Cervicalgia crónica', isChronic: true },
    { name: 'Hernia discal lumbar', isChronic: false },
    { name: 'Hernia discal cervical', isChronic: false },
    { name: 'Síndrome del manguito rotador', isChronic: false },
    { name: 'Epicondilitis lateral (codo de tenista)', isChronic: false },
    { name: 'Tendinitis aquílea', isChronic: false },
    { name: 'Bursitis', isChronic: false },
    { name: 'Síndrome de piriforme', isChronic: false },
    { name: 'Escoliosis', isChronic: true },
    { name: 'Fractura vertebral por osteoporosis', isChronic: false },
    // ── Capítulo XIV: Aparato Genitourinario (N00-N99) ──
    { name: 'Insuficiencia renal crónica', isChronic: true },
    { name: 'Insuficiencia renal aguda', isChronic: false },
    { name: 'Glomerulonefritis', isChronic: false },
    { name: 'Síndrome nefrótico', isChronic: false },
    { name: 'Nefritis intersticial', isChronic: false },
    { name: 'Litiasis renal', isChronic: false },
    { name: 'Infección del tracto urinario', isChronic: false },
    { name: 'Infección urinaria recurrente', isChronic: true },
    { name: 'Cistitis', isChronic: false },
    { name: 'Pielonefritis', isChronic: false },
    { name: 'Hiperplasia prostática benigna', isChronic: true },
    { name: 'Prostatitis', isChronic: false },
    { name: 'Endometriosis', isChronic: true },
    { name: 'Síndrome de ovario poliquístico', isChronic: true },
    { name: 'Enfermedad inflamatoria pélvica', isChronic: false },
    { name: 'Disfunción eréctil', isChronic: true },
    // ── Capítulo XV: Embarazo, Parto y Puerperio (O00-O99) ──
    { name: 'Preeclampsia', isChronic: false },
    { name: 'Eclampsia', isChronic: false },
    { name: 'Diabetes gestacional', isChronic: false },
    { name: 'Aborto espontáneo', isChronic: false },
    { name: 'Embarazo ectópico', isChronic: false },
    // ── Capítulo XVII: Malformaciones Congénitas (Q00-Q99) ──
    { name: 'Síndrome de Down', isChronic: true },
    { name: 'Cardiopatía congénita', isChronic: true },
    { name: 'Labio leporino y paladar hendido', isChronic: false },
    { name: 'Espina bífida', isChronic: true },
    { name: 'Síndrome de Turner', isChronic: true },
    { name: 'Síndrome de Klinefelter', isChronic: true },
    // ── Capítulo XVIII: Síntomas y Signos (R00-R99) ──
    { name: 'Dolor torácico no especificado', isChronic: false },
    { name: 'Palpitaciones', isChronic: false },
    { name: 'Disnea', isChronic: false },
    { name: 'Síncope', isChronic: false },
    { name: 'Fiebre de origen desconocido', isChronic: false },
    { name: 'Fatiga crónica', isChronic: true },
    // ── Capítulo XIX: Traumatismos y Envenenamientos (S00-T98) ──
    { name: 'Fractura de clavícula', isChronic: false },
    { name: 'Fractura de húmero', isChronic: false },
    { name: 'Fractura de radio y cúbito', isChronic: false },
    { name: 'Fractura de fémur', isChronic: false },
    { name: 'Fractura de tibia y peroné', isChronic: false },
    { name: 'Esguince de tobillo', isChronic: false },
    { name: 'Luxación de hombro', isChronic: false },
    { name: 'Traumatismo craneoencefálico', isChronic: false },
    { name: 'Intoxicación por monóxido de carbono', isChronic: false },
    { name: 'Quemaduras', isChronic: false },
    // ── Enfermedades Ocupacionales ──
    { name: 'Dermatosis ocupacional', isChronic: false },
    { name: 'Hipoacusia inducida por ruido', isChronic: true },
    { name: 'Neumoconiosis', isChronic: true },
    { name: 'Intoxicación por plomo (saturnismo)', isChronic: false },
    { name: 'Intoxicación por mercurio', isChronic: false },
    { name: 'Síndrome de vibración mano-brazo', isChronic: true },
    { name: 'Síndrome de burnout (agotamiento laboral)', isChronic: false },
    {
      name: 'Trastorno musculoesquelético relacionado con el trabajo',
      isChronic: true,
    },
  ];
  for (const disease of DISEASES_DATA) {
    await db
      .insert(diseases)
      .values(disease)
      .onConflictDoNothing({ target: diseases.name });
    console.log(
      `  ✓ [${disease.isChronic ? 'crónica' : 'aguda  '}] ${disease.name}`,
    );
  }

  // ── INICIO BLOQUE WORKERS ──────────────────────────────────────────────────
  // Solo se ejecuta si LOAD_WORKERS=true Y la base de datos no tiene pacientes aún.
  // Esto garantiza que la carga inicial se haga solo una vez, aunque el servidor
  // se reinicie con LOAD_WORKERS=true en el docker-compose.
  if (process.env.LOAD_WORKERS === 'true') {
    const [{ value: patientCount }] = await db
      .select({ value: count() })
      .from(patients);

    if (Number(patientCount) > 0) {
      console.log(
        `\n📦 Workers ya cargados (${patientCount} pacientes en DB) — omitiendo bloque de trabajadores.`,
      );
    } else {
      console.log(
        '\n📦 Cargando empresas y trabajadores (primera instalación)...',
      );

      const RAW_WORKERS: {
        cedula: string;
        nombre: string;
        empresa: string;
        cargo: string;
        sexo: string;
      }[] = [
        {
          cedula: '21505821',
          nombre: 'Roengris Gallardo',
          empresa: 'El hechizo',
          cargo: 'Vendedor',
          sexo: 'F',
        },
        {
          cedula: '30664741',
          nombre: 'Brayan Edilberth Amaya Pinto',
          empresa: 'El hechizo',
          cargo: 'Vendedor',
          sexo: 'M',
        },
        {
          cedula: '33175743',
          nombre: 'Daiker Alberto Tovar',
          empresa: 'El hechizo',
          cargo: 'Vendedor',
          sexo: 'M',
        },
        {
          cedula: '20015230',
          nombre: 'Gabriel de Jesus Colmenarez Rodriguez',
          empresa: 'El hechizo',
          cargo: 'Vendedor',
          sexo: 'M',
        },
        {
          cedula: '25136309',
          nombre: 'Karliannys Yennail Esteves Mujica',
          empresa: 'El hechizo',
          cargo: 'Asistente Administrativo',
          sexo: 'F',
        },
        {
          cedula: '16386923',
          nombre: 'Luis Miguel Melendez Almodovar',
          empresa: 'El hechizo',
          cargo: 'Gerente',
          sexo: 'M',
        },
        {
          cedula: '12246539',
          nombre: 'Mariela Figueroa',
          empresa: 'El hechizo',
          cargo: 'Vendedor',
          sexo: 'F',
        },
        {
          cedula: '9601769',
          nombre: 'Nelly Pastora Peña',
          empresa: 'Café Cordillera',
          cargo: 'Empacador',
          sexo: 'F',
        },
        {
          cedula: '3880329',
          nombre: 'Francisco Guere',
          empresa: 'Café Cordillera',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '7374198',
          nombre: 'Carmen Merlo',
          empresa: 'Café Cordillera',
          cargo: 'Empacador',
          sexo: 'F',
        },
        {
          cedula: '10774979',
          nombre: 'Erwin Betancourt',
          empresa: 'Café Cordillera',
          cargo: 'Despachador',
          sexo: 'M',
        },
        {
          cedula: '21297350',
          nombre: 'Camacaro Rivas Antony Yonier',
          empresa: 'Café Cordillera',
          cargo: 'Ayudante Tostador',
          sexo: 'M',
        },
        {
          cedula: '7373514',
          nombre: 'Fonseca Manuel Jose',
          empresa: 'Café Cordillera',
          cargo: 'Vendedor/chofer',
          sexo: 'M',
        },
        {
          cedula: '23852346',
          nombre: 'Medina Flores Maria Beatriz',
          empresa: 'Café Cordillera',
          cargo: 'Asistente Contable',
          sexo: 'F',
        },
        {
          cedula: '7385872',
          nombre: 'Mujica Hernandez Angel',
          empresa: 'Café Cordillera',
          cargo: 'Tostador',
          sexo: 'M',
        },
        {
          cedula: '7445780',
          nombre: 'Perez Fonseca Eduardo Antonio',
          empresa: 'Café Cordillera',
          cargo: 'Vendedor',
          sexo: 'M',
        },
        {
          cedula: '7303193',
          nombre: 'Reyes Figueroa Sara del Rosario',
          empresa: 'Café Cordillera',
          cargo: 'Asistente Administrativo',
          sexo: 'F',
        },
        {
          cedula: '5657727',
          nombre: 'Zambrano Angel Ramon',
          empresa: 'Café Cordillera',
          cargo: 'Mecanico',
          sexo: 'M',
        },
        {
          cedula: '10778026',
          nombre: 'Ana Pimentel',
          empresa: 'Café Cordillera',
          cargo: 'Empaquetador',
          sexo: 'F',
        },
        {
          cedula: '24787345',
          nombre: 'Daniela Romero',
          empresa: 'Café Cordillera',
          cargo: 'Asistente Contable',
          sexo: 'F',
        },
        {
          cedula: '12026175',
          nombre: 'Marisela Pineda',
          empresa: 'Café Cordillera',
          cargo: 'Empacador',
          sexo: 'F',
        },
        {
          cedula: '7362922',
          nombre: 'Luis Reyes',
          empresa: 'Café Cordillera',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '18552049',
          nombre: 'Anyela León',
          empresa: 'Café Cordillera',
          cargo: 'Empacador',
          sexo: 'F',
        },
        {
          cedula: '15666317',
          nombre: 'Eglis Manzano',
          empresa: 'Café Cordillera',
          cargo: 'Asistente Administrativo',
          sexo: 'F',
        },
        {
          cedula: '27085878',
          nombre: 'Ezequiel Mosquera',
          empresa: 'Agrícola León',
          cargo: 'Vendedor',
          sexo: 'M',
        },
        {
          cedula: '25627208',
          nombre: 'Estefany Mogollon',
          empresa: 'Agrícola León',
          cargo: 'Asistente RRHH',
          sexo: 'F',
        },
        {
          cedula: '24680352',
          nombre: 'Eyildais Peña',
          empresa: 'Agrícola León',
          cargo: 'Asistente Contable',
          sexo: 'F',
        },
        {
          cedula: '26608159',
          nombre: 'Daniela Moreno',
          empresa: 'Agrícola León',
          cargo: 'Asistente de Ventas',
          sexo: 'F',
        },
        {
          cedula: '9628713',
          nombre: 'Mary Carreño',
          empresa: 'Agrícola León',
          cargo: 'Administrador',
          sexo: 'F',
        },
        {
          cedula: '14760710',
          nombre: 'Abraham Peralta',
          empresa: 'Agrícola León',
          cargo: 'Almacenista',
          sexo: 'M',
        },
        {
          cedula: '11428940',
          nombre: 'Gustavo Ferrer',
          empresa: 'Agrícola León',
          cargo: 'Gerente',
          sexo: 'M',
        },
        {
          cedula: '30529329',
          nombre: 'Marcos Freytez',
          empresa: 'AJL',
          cargo: 'Ayudante de Prensa',
          sexo: 'M',
        },
        {
          cedula: '17356936',
          nombre: 'Evelin Silva',
          empresa: 'AJL',
          cargo: 'Mantenimiento',
          sexo: 'F',
        },
        {
          cedula: '19639007',
          nombre: 'Yulimar Pereira',
          empresa: 'AJL',
          cargo: 'Compagiador',
          sexo: 'F',
        },
        {
          cedula: '20075672',
          nombre: 'Endelis Morillo',
          empresa: 'AJL',
          cargo: 'Administrativo',
          sexo: 'F',
        },
        {
          cedula: '12702829',
          nombre: 'Jenny Pereira',
          empresa: 'AJL',
          cargo: 'Compagiador',
          sexo: 'F',
        },
        {
          cedula: '26644670',
          nombre: 'Heilyn Yepez',
          empresa: 'AJL',
          cargo: 'Diseñador Gráfico',
          sexo: 'F',
        },
        {
          cedula: '17627967',
          nombre: 'Yaneth Blanco',
          empresa: 'AJL',
          cargo: 'Compagiador',
          sexo: 'F',
        },
        {
          cedula: '30395831',
          nombre: 'Martinez Deisimar',
          empresa: 'AJL',
          cargo: 'Compagiador',
          sexo: 'F',
        },
        {
          cedula: '17196167',
          nombre: 'Ender Rodriguez',
          empresa: 'AJL',
          cargo: 'Prensista',
          sexo: 'M',
        },
        {
          cedula: '24325102',
          nombre: 'Fradeisy Vargas',
          empresa: 'AJL',
          cargo: 'Rrhh',
          sexo: 'F',
        },
        {
          cedula: '14938236',
          nombre: 'Detsi Mendoza',
          empresa: 'AJL',
          cargo: 'Compagiador',
          sexo: 'F',
        },
        {
          cedula: '19164959',
          nombre: 'Gimenez  Vanessa',
          empresa: 'AJL',
          cargo: 'Gerente Administrativo',
          sexo: 'F',
        },
        {
          cedula: '12025353',
          nombre: 'Francisco Suarez',
          empresa: 'AJL',
          cargo: 'Ayudante de Prensa',
          sexo: 'M',
        },
        {
          cedula: '23835644',
          nombre: 'Roxeidi Rojas',
          empresa: 'AJL',
          cargo: 'Rrhh',
          sexo: 'F',
        },
        {
          cedula: '13603760',
          nombre: 'Aracelis Silva',
          empresa: 'Canaima',
          cargo: 'Asistente Administrativo',
          sexo: 'F',
        },
        {
          cedula: '7343696',
          nombre: 'Blas Amaro',
          empresa: 'Canaima',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '9610183',
          nombre: 'Carlos Burguillo',
          empresa: 'Canaima',
          cargo: 'Auxiliar de Mantenimineto',
          sexo: 'M',
        },
        {
          cedula: '11427594',
          nombre: 'Carlos Medina',
          empresa: 'Canaima',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '19323301',
          nombre: 'Deimar Mosquera',
          empresa: 'Canaima',
          cargo: 'Administrador',
          sexo: 'F',
        },
        {
          cedula: '23811589',
          nombre: 'Edgar Perozo',
          empresa: 'Canaima',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '20045652',
          nombre: 'Edwin Castillo',
          empresa: 'Canaima',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '19697367',
          nombre: 'Edwuar Alvarado',
          empresa: 'Canaima',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '20008379',
          nombre: 'Iraida Aldana',
          empresa: 'Canaima',
          cargo: 'Operador',
          sexo: 'F',
        },
        {
          cedula: '13555590',
          nombre: 'Jennis Mora',
          empresa: 'Canaima',
          cargo: 'Analista de Seguridad',
          sexo: 'F',
        },
        {
          cedula: '12022044',
          nombre: 'Jorge Riera',
          empresa: 'Canaima',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '20471875',
          nombre: 'José Luis Pérez',
          empresa: 'Canaima',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '16748429',
          nombre: 'Manuel Riera',
          empresa: 'Canaima',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '18058872',
          nombre: 'María José Silva',
          empresa: 'Canaima',
          cargo: 'Coordinador General',
          sexo: 'F',
        },
        {
          cedula: '7395962',
          nombre: 'Nancy Mendoza',
          empresa: 'Canaima',
          cargo: 'Mantenimiento',
          sexo: 'F',
        },
        {
          cedula: '19264011',
          nombre: 'Pastor Agüero',
          empresa: 'Canaima',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '10777009',
          nombre: 'Rafael Aranguren',
          empresa: 'Canaima',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '7328347',
          nombre: 'Raimundo Ramon Piña',
          empresa: 'Canaima',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '12018739',
          nombre: 'Ramon Medoza',
          empresa: 'Canaima',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '12850063',
          nombre: 'Román Garcés',
          empresa: 'Canaima',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '26480597',
          nombre: 'Yeferson Amaro',
          empresa: 'Canaima',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '21054223',
          nombre: 'Yosman Mendoza',
          empresa: 'Canaima',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '12026297',
          nombre: 'Mirla Salon',
          empresa: 'Cera Artística',
          cargo: 'Etiquetador',
          sexo: 'F',
        },
        {
          cedula: '15413768',
          nombre: 'Juan Alvarez',
          empresa: 'Cera Artística',
          cargo: 'Jefe de Operaciones',
          sexo: 'M',
        },
        {
          cedula: '18262819',
          nombre: 'Luis Yanez',
          empresa: 'Cera Artística',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '16322284',
          nombre: 'Alexander Dudamel',
          empresa: 'Cera Artística',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '16750912',
          nombre: 'José Noguera',
          empresa: 'Cera Artística',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '16584762',
          nombre: 'Johana Chirinos',
          empresa: 'Cera Artística',
          cargo: 'Administrador',
          sexo: 'F',
        },
        {
          cedula: '17139143',
          nombre: 'Jerilee Rodriguez',
          empresa: 'Cera Artística',
          cargo: 'Coordinador',
          sexo: 'F',
        },
        {
          cedula: '7422453',
          nombre: 'Elba Piedra',
          empresa: 'Cera Artística',
          cargo: 'Administrador',
          sexo: 'F',
        },
        {
          cedula: '23031904',
          nombre: 'Roberto Castellanos',
          empresa: 'Cera Artística',
          cargo: 'Operador de Maquina',
          sexo: 'M',
        },
        {
          cedula: '22180448',
          nombre: 'Gabriel Hernandez',
          empresa: 'Cera Artística',
          cargo: 'Analista Contable',
          sexo: 'M',
        },
        {
          cedula: '22196808',
          nombre: 'Jesús Cordero',
          empresa: 'Cera Artística',
          cargo: 'Operador de Máquinas',
          sexo: 'M',
        },
        {
          cedula: '25989208',
          nombre: 'Royber Moreno',
          empresa: 'Cera Artística',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '20187852',
          nombre: 'Yohana Amaro',
          empresa: 'Cera Artística',
          cargo: 'Aseador',
          sexo: 'F',
        },
        {
          cedula: '17033852',
          nombre: 'Richard Marchetto',
          empresa: 'Cera Artística',
          cargo: 'Analista Administrativo',
          sexo: 'M',
        },
        {
          cedula: '26006465',
          nombre: 'Yriannis Suarez',
          empresa: 'Cera Artística',
          cargo: 'Etiquetador',
          sexo: 'F',
        },
        {
          cedula: '9389439',
          nombre: 'Digna Torres',
          empresa: 'Dimza',
          cargo: 'Empaquetador',
          sexo: 'F',
        },
        {
          cedula: '9545889',
          nombre: 'Leyda Suarez',
          empresa: 'Dimza',
          cargo: 'Empaquetador',
          sexo: 'F',
        },
        {
          cedula: '7382681',
          nombre: 'Eduardo Loyo',
          empresa: 'Dimza',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '13644149',
          nombre: 'Carelis Aldazono',
          empresa: 'Dimza',
          cargo: 'Asistente Rrhh',
          sexo: 'F',
        },
        {
          cedula: '11360773',
          nombre: 'Luis Rivero',
          empresa: 'Dimza',
          cargo: 'Supervisor',
          sexo: 'M',
        },
        {
          cedula: '13267636',
          nombre: 'Yanitza Jimenez',
          empresa: 'Dimza',
          cargo: 'Administrador',
          sexo: 'F',
        },
        {
          cedula: '7371801',
          nombre: 'Gladys Oviedo',
          empresa: 'Dimza',
          cargo: 'Operador de Empaque',
          sexo: 'F',
        },
        {
          cedula: '16585709',
          nombre: 'Richard Castillo',
          empresa: 'Dimza',
          cargo: 'Almacenista',
          sexo: 'M',
        },
        {
          cedula: '19639847',
          nombre: 'Edixon Torres',
          empresa: 'Dimza',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '12933120',
          nombre: 'Adan Castillo Antonio Jose',
          empresa: 'Ecogerencia',
          cargo: 'Segregador',
          sexo: 'M',
        },
        {
          cedula: '25149206',
          nombre: 'Alvarez Pastran Franyer Jose',
          empresa: 'Ecogerencia',
          cargo: 'Operador de Jardineria',
          sexo: 'M',
        },
        {
          cedula: '13603442',
          nombre: 'Angarita Gimenez Wilmer Jose',
          empresa: 'Ecogerencia',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '21274028',
          nombre: 'Aponte Colmenarez Jesus Rafael',
          empresa: 'Ecogerencia',
          cargo: 'Operador Segregador',
          sexo: 'M',
        },
        {
          cedula: '30403709',
          nombre: 'Boris Martin',
          empresa: 'Ecogerencia',
          cargo: 'Supervisor/Segregador',
          sexo: 'M',
        },
        {
          cedula: '28220160',
          nombre: 'Briceño Marchan Jahdiel Jesus',
          empresa: 'Ecogerencia',
          cargo: 'Obrero/jardinero',
          sexo: 'M',
        },
        {
          cedula: '7390280',
          nombre: 'Cerniechiaro Vargas Jose',
          empresa: 'Ecogerencia',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '14512120',
          nombre: 'Colmenarez Amaya Pablo Jose',
          empresa: 'Ecogerencia',
          cargo: 'Segregador',
          sexo: 'M',
        },
        {
          cedula: '30529355',
          nombre: 'Diaz castillo David Alejandro',
          empresa: 'Ecogerencia',
          cargo: 'Segregador',
          sexo: 'M',
        },
        {
          cedula: '31137993',
          nombre: 'Gallardo Rivero Jeferson Javier',
          empresa: 'Ecogerencia',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '12249565',
          nombre: 'Gimenez Torres Noel Andres',
          empresa: 'Ecogerencia',
          cargo: 'Operador de Jardineria',
          sexo: 'M',
        },
        {
          cedula: '17859643',
          nombre: 'Linarez Gil Jesus Ignancio',
          empresa: 'Ecogerencia',
          cargo: 'Segregador',
          sexo: 'M',
        },
        {
          cedula: '28019032',
          nombre: 'Martinez Jaime Deivis Jose',
          empresa: 'Ecogerencia',
          cargo: 'Operador de Jardineria',
          sexo: 'M',
        },
        {
          cedula: '18262600',
          nombre: 'Mendoza Arrieche Reinaldo Jesus',
          empresa: 'Ecogerencia',
          cargo: 'Operador de Jardineria',
          sexo: 'M',
        },
        {
          cedula: '9610170',
          nombre: 'Silva Lobaton Cecilio Antonio',
          empresa: 'Ecogerencia',
          cargo: 'Operador de Jardineria',
          sexo: 'M',
        },
        {
          cedula: '30558025',
          nombre: 'Vargas Perez Jesus Enrique',
          empresa: 'Ecogerencia',
          cargo: 'Operador de Jardineria',
          sexo: 'M',
        },
        {
          cedula: '20672877',
          nombre: 'Villegas Zambrano Yerdiver Javier',
          empresa: 'Ecogerencia',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '14879734',
          nombre: 'Alberto Diaz',
          empresa: 'CAPMIL-FCMPE',
          cargo: 'Analista Contable',
          sexo: 'M',
        },
        {
          cedula: '9614689',
          nombre: 'Glorimar Andrade',
          empresa: 'CAPMIL-FCMPE',
          cargo: 'Directora Ejecutiva',
          sexo: 'F',
        },
        {
          cedula: '17343242',
          nombre: 'Isabel Vasquez',
          empresa: 'CAPMIL-FCMPE',
          cargo: 'Gerente',
          sexo: 'F',
        },
        {
          cedula: '10770995',
          nombre: 'Ivonne Rojas',
          empresa: 'CAPMIL-FCMPE',
          cargo: 'Jefe de Historia Medica',
          sexo: 'F',
        },
        {
          cedula: '17194546',
          nombre: 'Luisdy Esmeralda Alvarez Oropeza',
          empresa: 'CAPMIL-FCMPE',
          cargo: 'Enfermera Ocupacional',
          sexo: 'F',
        },
        {
          cedula: '24567835',
          nombre: 'Wuilbelis mujica',
          empresa: 'CAPMIL-FCMPE',
          cargo: 'Coordinador HSL',
          sexo: 'F',
        },
        {
          cedula: '16642180',
          nombre: 'Florangel Querales',
          empresa: 'CAPMIL-FCMPE',
          cargo: 'Ing de Proyecto',
          sexo: 'F',
        },
        {
          cedula: '21244494',
          nombre: 'Adriana Guedez',
          empresa: 'CAPMIL-FCMPE',
          cargo: 'Ing de Proyecto',
          sexo: 'F',
        },
        {
          cedula: '22270685',
          nombre: 'Glorimar González',
          empresa: 'CAPMIL-FCMPE',
          cargo: 'Ing de Proyecto',
          sexo: 'F',
        },
        {
          cedula: '17627843',
          nombre: 'Roger Espinoza',
          empresa: 'CAPMIL-FCMPE',
          cargo: 'Médico Ocupacional',
          sexo: 'M',
        },
        {
          cedula: '20470808',
          nombre: 'Cariannys Sanchez',
          empresa: 'CAPMIL-FCMPE',
          cargo: 'Coordinador',
          sexo: 'F',
        },
        {
          cedula: '11082909',
          nombre: 'Enrique Morillo',
          empresa: 'CAPMIL-FCMPE',
          cargo: 'Sugenerales',
          sexo: 'M',
        },
        {
          cedula: '21125207',
          nombre: 'Miguel Fernández',
          empresa: 'Fumigamos Lara',
          cargo: 'Técnico Aplicador',
          sexo: 'M',
        },
        {
          cedula: '14880043',
          nombre: 'Yorci Galindez',
          empresa: 'Fumigamos Lara',
          cargo: 'Tenico de Fumigacion',
          sexo: 'M',
        },
        {
          cedula: '9850426',
          nombre: 'Ander Olarte',
          empresa: 'Funlemos',
          cargo: 'Operador de Planta',
          sexo: 'M',
        },
        {
          cedula: '7315945',
          nombre: 'Andres Hidaldo',
          empresa: 'Funlemos',
          cargo: 'Asistente de Almacén',
          sexo: 'M',
        },
        {
          cedula: '4302452',
          nombre: 'Auxilio León',
          empresa: 'Funlemos',
          cargo: 'Mecanico',
          sexo: 'M',
        },
        {
          cedula: '28466245',
          nombre: 'Brayan Garcia',
          empresa: 'Funlemos',
          cargo: 'Ayudante de Planta',
          sexo: 'M',
        },
        {
          cedula: '12250139',
          nombre: 'Carlos Landaeta',
          empresa: 'Funlemos',
          cargo: 'Electricista',
          sexo: 'M',
        },
        {
          cedula: '9603347',
          nombre: 'Francisco Navas',
          empresa: 'Funlemos',
          cargo: 'Inspector de Planta',
          sexo: 'M',
        },
        {
          cedula: '22330018',
          nombre: 'Edwin Mendoza',
          empresa: 'Funlemos',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '7305439',
          nombre: 'Freddy Gallardo',
          empresa: 'Funlemos',
          cargo: 'Electricista',
          sexo: 'M',
        },
        {
          cedula: '20351549',
          nombre: 'Howard Castillo',
          empresa: 'Funlemos',
          cargo: 'Asistente de Ventas',
          sexo: 'M',
        },
        {
          cedula: '17194126',
          nombre: 'Jesus Castillo',
          empresa: 'Funlemos',
          cargo: 'Ayudante de Planta',
          sexo: 'M',
        },
        {
          cedula: '9005578',
          nombre: 'Jhonmer Romero',
          empresa: 'Funlemos',
          cargo: 'Ayudante de Planta',
          sexo: 'M',
        },
        {
          cedula: '9551768',
          nombre: 'Jose Angel Gonzalez',
          empresa: 'Funlemos',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '5240851',
          nombre: 'José Espinoza',
          empresa: 'Funlemos',
          cargo: 'Operador de Planta',
          sexo: 'M',
        },
        {
          cedula: '9116147',
          nombre: 'José Rosendo',
          empresa: 'Funlemos',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '5247596',
          nombre: 'Jose Vasquez',
          empresa: 'Funlemos',
          cargo: 'Operador de Planta',
          sexo: 'M',
        },
        {
          cedula: '3532627',
          nombre: 'Juan Fernandez',
          empresa: 'Funlemos',
          cargo: 'Coordinador de Horno',
          sexo: 'M',
        },
        {
          cedula: '7329199',
          nombre: 'Lucirio Aranguren',
          empresa: 'Funlemos',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '15386934',
          nombre: 'Luis Barco',
          empresa: 'Funlemos',
          cargo: 'Jefe de Compras',
          sexo: 'M',
        },
        {
          cedula: '22262858',
          nombre: 'Nelson Lopez',
          empresa: 'Funlemos',
          cargo: 'Jefe de Plan de Arena',
          sexo: 'M',
        },
        {
          cedula: '9609216',
          nombre: 'Obdulio Castillo',
          empresa: 'Funlemos',
          cargo: 'Operador de Planta',
          sexo: 'M',
        },
        {
          cedula: '7585283',
          nombre: 'Olvis Boada',
          empresa: 'Funlemos',
          cargo: 'Jefe de Aseguramiento y Control de Calidad',
          sexo: 'F',
        },
        {
          cedula: '4370994',
          nombre: 'Omaira Gomez',
          empresa: 'Funlemos',
          cargo: 'Mantenimiento',
          sexo: 'F',
        },
        {
          cedula: '20926127',
          nombre: 'Quirico Olarte',
          empresa: 'Funlemos',
          cargo: 'Ayudante de Almacen',
          sexo: 'M',
        },
        {
          cedula: '9614145',
          nombre: 'Roberto Vidoza',
          empresa: 'Funlemos',
          cargo: 'Operador de Planta',
          sexo: 'M',
        },
        {
          cedula: '91116147',
          nombre: 'Rodolfo Delf',
          empresa: 'Funlemos',
          cargo: 'Operador de Planta',
          sexo: 'M',
        },
        {
          cedula: '12450374',
          nombre: 'Nestor Perez',
          empresa: 'Funlemos',
          cargo: 'Operador de Maquina',
          sexo: 'M',
        },
        {
          cedula: '7428554',
          nombre: 'Carlos Cuarez',
          empresa: 'Funlemos',
          cargo: 'Administrador',
          sexo: 'M',
        },
        {
          cedula: '9054250',
          nombre: 'Andres Figueroa',
          empresa: 'Funlemos',
          cargo: 'Coordinador',
          sexo: 'M',
        },
        {
          cedula: '5249945',
          nombre: 'Alberto Alvarez',
          empresa: 'Funlemos',
          cargo: 'Ayudante de Modelo',
          sexo: 'M',
        },
        {
          cedula: '14590925',
          nombre: 'Adolfo Ponton',
          empresa: 'Funlemos',
          cargo: 'Operador de Maquina',
          sexo: 'M',
        },
        {
          cedula: '18057645',
          nombre: 'Ali Castañeda',
          empresa: 'Funlemos',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '28127373',
          nombre: 'Carlos Díaz',
          empresa: 'Funlemos',
          cargo: 'Analista de Compras',
          sexo: 'M',
        },
        {
          cedula: '21460037',
          nombre: 'María Mendoza',
          empresa: 'Funlemos',
          cargo: 'Inspector de Calidad',
          sexo: 'F',
        },
        {
          cedula: '23400164',
          nombre: 'Denise Lemos',
          empresa: 'Funlemos',
          cargo: 'Gestión y Control',
          sexo: 'F',
        },
        {
          cedula: '23846289',
          nombre: 'Yenifer González',
          empresa: 'Funlemos',
          cargo: 'Inspector de Calidad',
          sexo: 'F',
        },
        {
          cedula: '18058340',
          nombre: 'David Pernalete',
          empresa: 'Funlemos',
          cargo: 'Operador de Planta de Arena',
          sexo: 'M',
        },
        {
          cedula: '6602255',
          nombre: 'Zoilmar Villalobos',
          empresa: 'Funlemos',
          cargo: 'Asistente Contable',
          sexo: 'F',
        },
        {
          cedula: '12707986',
          nombre: 'Omar Suarez',
          empresa: 'Funlemos',
          cargo: 'Ayudante',
          sexo: 'M',
        },
        {
          cedula: '17759258',
          nombre: 'Adolfo Pontón Guevara',
          empresa: 'Funlemos',
          cargo: 'Jefe de Mecanica',
          sexo: 'M',
        },
        {
          cedula: '22335204',
          nombre: 'Luis Alejandro Perez',
          empresa: 'Funlemos',
          cargo: 'Inspector de Planta',
          sexo: 'M',
        },
        {
          cedula: '12708004',
          nombre: 'Anibal Sanchez',
          empresa: 'Funlemos',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '7368619',
          nombre: 'Juan Alvarez',
          empresa: 'Funlemos',
          cargo: 'Jefe de Ventas',
          sexo: 'M',
        },
        {
          cedula: '16418433',
          nombre: 'Laura Rangel',
          empresa: 'Funlemos',
          cargo: 'Jefe de Compras',
          sexo: 'F',
        },
        {
          cedula: '9622121',
          nombre: 'Hysep Melendez',
          empresa: 'Funlemos',
          cargo: 'Jefe de Recursos Humanos',
          sexo: 'F',
        },
        {
          cedula: '14399453',
          nombre: 'José González',
          empresa: 'Funlemos',
          cargo: 'Soldador',
          sexo: 'M',
        },
        {
          cedula: '9558952',
          nombre: 'Alexander Gómez',
          empresa: 'Funlemos',
          cargo: 'Contador',
          sexo: 'M',
        },
        {
          cedula: '13034549',
          nombre: 'Ronald Melendez',
          empresa: 'Funlemos',
          cargo: 'Jefe de Finanzas',
          sexo: 'M',
        },
        {
          cedula: '13269289',
          nombre: 'Laudid Alejos',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Empaquetador',
          sexo: 'M',
        },
        {
          cedula: '18736200',
          nombre: 'Alfredo Vizcaya',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '11588613',
          nombre: 'Carlos Vargas',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Vigilante',
          sexo: 'M',
        },
        {
          cedula: '15170654',
          nombre: 'Daniel Carrillo',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Ayudante Mecanica',
          sexo: 'M',
        },
        {
          cedula: '27250908',
          nombre: 'Daniela Escalona',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Analista Contable',
          sexo: 'F',
        },
        {
          cedula: '12702855',
          nombre: 'Elida Castellano',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Analista Contable',
          sexo: 'F',
        },
        {
          cedula: '7330172',
          nombre: 'Esteban Alejos',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Vigilante',
          sexo: 'M',
        },
        {
          cedula: '18673847',
          nombre: 'Jesús Durán',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Almacenista',
          sexo: 'M',
        },
        {
          cedula: '10641935',
          nombre: 'Jesús Soto',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '16750665',
          nombre: 'José Gregorio Bravo',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '7468746',
          nombre: 'Luis Goyo',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '22188847',
          nombre: 'Luis Peña',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Empacador',
          sexo: 'M',
        },
        {
          cedula: '15444678',
          nombre: 'María Ortíz',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Analista Cxp',
          sexo: 'M',
        },
        {
          cedula: '18785328',
          nombre: 'Willian Alejo',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Almacenista',
          sexo: 'M',
        },
        {
          cedula: '15776490',
          nombre: 'Yolmar Torrez',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Analista Contable',
          sexo: 'F',
        },
        {
          cedula: '14649082',
          nombre: 'Gisset Briseño',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Auxiliar de Mantenimiento',
          sexo: 'F',
        },
        {
          cedula: '31663626',
          nombre: 'Osneyber Castro',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Galvanizado',
          sexo: 'M',
        },
        {
          cedula: '20471916',
          nombre: 'Ednisneidy Querales',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Analista Cxp',
          sexo: 'F',
        },
        {
          cedula: '14404198',
          nombre: 'Mariela Rodriguez',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Empaque',
          sexo: 'F',
        },
        {
          cedula: '20473351',
          nombre: 'Vanessa Herrera',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Asistente Administrativo',
          sexo: 'F',
        },
        {
          cedula: '7415500',
          nombre: 'Miguel Lucena',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Supervisor de Planta',
          sexo: 'M',
        },
        {
          cedula: '20473350',
          nombre: 'Halmat Herrera',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Vendedor',
          sexo: 'M',
        },
        {
          cedula: '7385076',
          nombre: 'Nelson Díaz',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '10775777',
          nombre: 'Orlando Rodriguez',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '9604234',
          nombre: 'Luis Alejos',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Vigilante',
          sexo: 'M',
        },
        {
          cedula: '24384151',
          nombre: 'Jean Carlos Vargas',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Vigilante',
          sexo: 'M',
        },
        {
          cedula: '17784704',
          nombre: 'Yusbelyn Hernández',
          empresa: 'Ganchos Venezolanos',
          cargo: 'Rrhh',
          sexo: 'F',
        },
        {
          cedula: '11428545',
          nombre: 'Lolimar Colmenarez',
          empresa: 'INVITREL',
          cargo: 'Asistente de Ventas',
          sexo: 'F',
        },
        {
          cedula: '7325649',
          nombre: 'Anner Toyo',
          empresa: 'INVITREL',
          cargo: 'Electromecánica',
          sexo: 'M',
        },
        {
          cedula: '7224846',
          nombre: 'Elías José Mujica',
          empresa: 'INVITREL',
          cargo: 'Electromecánica',
          sexo: 'M',
        },
        {
          cedula: '11426342',
          nombre: 'Gisela Torrealba',
          empresa: 'INVITREL',
          cargo: 'Auxiliar en Ventas',
          sexo: 'F',
        },
        {
          cedula: '11883200',
          nombre: 'Jhonny Castillo',
          empresa: 'INVITREL',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '7045532',
          nombre: 'José Collado',
          empresa: 'INVITREL',
          cargo: 'Jefe de Ingeniería',
          sexo: 'M',
        },
        {
          cedula: '8801640',
          nombre: 'José Higuera',
          empresa: 'INVITREL',
          cargo: 'Técnico de Seguridad',
          sexo: 'M',
        },
        {
          cedula: '7615986',
          nombre: 'Yelitza González',
          empresa: 'Larense de Alimentos',
          cargo: 'Administrador',
          sexo: 'F',
        },
        {
          cedula: '24354779',
          nombre: 'Karen Hernandez',
          empresa: 'Larense de Alimentos',
          cargo: 'Analista Contable',
          sexo: 'F',
        },
        {
          cedula: '19921028',
          nombre: 'Aixa Rivero',
          empresa: 'Larense de Alimentos',
          cargo: 'Operador',
          sexo: 'F',
        },
        {
          cedula: '24927305',
          nombre: 'Arni Salazar',
          empresa: 'Larense de Alimentos',
          cargo: 'Empaque',
          sexo: 'M',
        },
        {
          cedula: '18923147',
          nombre: 'Carlos Fernández',
          empresa: 'Larense de Alimentos',
          cargo: 'Analista Contable',
          sexo: 'M',
        },
        {
          cedula: '7829419',
          nombre: 'Carlos Luengo',
          empresa: 'Larense de Alimentos',
          cargo: 'Empaque',
          sexo: 'M',
        },
        {
          cedula: '9727373',
          nombre: 'Darling Gonzalez',
          empresa: 'Larense de Alimentos',
          cargo: 'Analista de Ventas',
          sexo: 'F',
        },
        {
          cedula: '22330542',
          nombre: 'Douglas Melendez',
          empresa: 'Larense de Alimentos',
          cargo: 'Analista de Ventas',
          sexo: 'M',
        },
        {
          cedula: '28297755',
          nombre: 'Edwuar de la Rosa',
          empresa: 'Larense de Alimentos',
          cargo: 'Operador de Mezclado',
          sexo: 'M',
        },
        {
          cedula: '31388600',
          nombre: 'Fernando Leon',
          empresa: 'Larense de Alimentos',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '4622851',
          nombre: 'Francisco Rendón',
          empresa: 'Larense de Alimentos',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '15444148',
          nombre: 'Freddy Suárez',
          empresa: 'Larense de Alimentos',
          cargo: 'Preparador',
          sexo: 'M',
        },
        {
          cedula: '30042333',
          nombre: 'Gabriel Vargas',
          empresa: 'Larense de Alimentos',
          cargo: 'Auxiliar General',
          sexo: 'M',
        },
        {
          cedula: '20767505',
          nombre: 'Jesus Teran',
          empresa: 'Larense de Alimentos',
          cargo: 'Supervisor de Produccion',
          sexo: 'M',
        },
        {
          cedula: '10777325',
          nombre: 'Jhonny Hernández',
          empresa: 'Larense de Alimentos',
          cargo: 'Operador de Mezclado',
          sexo: 'M',
        },
        {
          cedula: '25894500',
          nombre: 'Kristhian Medina',
          empresa: 'Larense de Alimentos',
          cargo: 'Electromecanico',
          sexo: 'M',
        },
        {
          cedula: '24354838',
          nombre: 'Libelys Angulo',
          empresa: 'Larense de Alimentos',
          cargo: 'Auxiliar General',
          sexo: 'F',
        },
        {
          cedula: '25139333',
          nombre: 'Rafael Betancout',
          empresa: 'Larense de Alimentos',
          cargo: 'Empaque',
          sexo: 'M',
        },
        {
          cedula: '10774538',
          nombre: 'Rudy Martínez',
          empresa: 'Larense de Alimentos',
          cargo: 'Mantenimiento',
          sexo: 'F',
        },
        {
          cedula: '24162865',
          nombre: 'Simon Urbina',
          empresa: 'Larense de Alimentos',
          cargo: 'Analista de Calidad',
          sexo: 'M',
        },
        {
          cedula: '32366669',
          nombre: 'Reneyker Silva',
          empresa: 'Larense de Alimentos',
          cargo: 'Empaque',
          sexo: 'M',
        },
        {
          cedula: '20237680',
          nombre: 'Yonathan Martinez',
          empresa: 'Larense de Alimentos',
          cargo: 'Ayudante de Mezclado',
          sexo: 'M',
        },
        {
          cedula: '10842483',
          nombre: 'Jose Luis Suarez',
          empresa: 'Larense de Alimentos',
          cargo: 'Ventas',
          sexo: 'M',
        },
        {
          cedula: '27882777',
          nombre: 'Roberth García',
          empresa: 'Larense de Alimentos',
          cargo: 'Asistente Administrativo',
          sexo: 'M',
        },
        {
          cedula: '19591173',
          nombre: 'Ricardo Adames',
          empresa: 'Larense de Alimentos',
          cargo: 'Supervisor',
          sexo: 'M',
        },
        {
          cedula: '27217450',
          nombre: 'Yahilyn Colmenarez',
          empresa: 'Larense de Alimentos',
          cargo: 'Analista Contable',
          sexo: 'F',
        },
        {
          cedula: '14649821',
          nombre: 'Jhosmar Alejandra Mendoza',
          empresa: 'Larense de Alimentos',
          cargo: 'Asesor de Ventas',
          sexo: 'F',
        },
        {
          cedula: '16796268',
          nombre: 'Juan Carlos Viscaya',
          empresa: 'Larense de Alimentos',
          cargo: 'Vendedor',
          sexo: 'M',
        },
        {
          cedula: '22184990',
          nombre: 'Fabiola Morillo',
          empresa: 'Larense de Alimentos',
          cargo: 'Analista',
          sexo: 'F',
        },
        {
          cedula: '20666469',
          nombre: 'María Torres',
          empresa: 'Larense de Alimentos',
          cargo: 'Analista de Calidad',
          sexo: 'F',
        },
        {
          cedula: '31099512',
          nombre: 'Carlos Coronado',
          empresa: 'Larense de Alimentos',
          cargo: 'Auxiliar General',
          sexo: 'M',
        },
        {
          cedula: '27629506',
          nombre: 'Luis Hernández',
          empresa: 'Larense de Alimentos',
          cargo: 'Auxiliar General',
          sexo: 'M',
        },
        {
          cedula: '25714237',
          nombre: 'Harol Rojas',
          empresa: 'Larense de Alimentos',
          cargo: 'Auxiliar General',
          sexo: 'M',
        },
        {
          cedula: '29997132',
          nombre: 'Gresmain Molina',
          empresa: 'Larense de Alimentos',
          cargo: 'Auxiliar General',
          sexo: 'M',
        },
        {
          cedula: '5251023',
          nombre: 'Orlando Melendez',
          empresa: 'Larense de Alimentos',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '12434027',
          nombre: 'Henry Pérez',
          empresa: 'Larense de Alimentos',
          cargo: 'Gerente Comercial',
          sexo: 'M',
        },
        {
          cedula: '7449375',
          nombre: 'Nelson Castillo',
          empresa: 'Larense de Alimentos',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '14937007',
          nombre: 'Jose Perez',
          empresa: 'Larense de Alimentos',
          cargo: 'Coordinador de Ventas',
          sexo: 'M',
        },
        {
          cedula: '7415970',
          nombre: 'Eloy Rojas',
          empresa: 'Margana',
          cargo: 'Vigilante',
          sexo: 'M',
        },
        {
          cedula: '15558468',
          nombre: 'José Ventura',
          empresa: 'Margana',
          cargo: 'Almacenista',
          sexo: 'M',
        },
        {
          cedula: '4739176',
          nombre: 'Gordillo Rafael Simon',
          empresa: 'Margana',
          cargo: 'Ayudante de Almacen',
          sexo: 'M',
        },
        {
          cedula: '7381853',
          nombre: 'Vargas Ramon Rogelio',
          empresa: 'Margana',
          cargo: 'Jefe de Almacen',
          sexo: 'M',
        },
        {
          cedula: '23485462',
          nombre: 'David Figueroa',
          empresa: 'Margana',
          cargo: 'Sistema',
          sexo: 'M',
        },
        {
          cedula: '4720866',
          nombre: 'Minerva Figueroa',
          empresa: 'Margana',
          cargo: 'Administrador',
          sexo: 'F',
        },
        {
          cedula: '14648627',
          nombre: 'Albis Camacaro',
          empresa: 'Polyplast',
          cargo: 'Ing.de Planta',
          sexo: 'F',
        },
        {
          cedula: '22320054',
          nombre: 'Alexander Gonzalez',
          empresa: 'Polyplast',
          cargo: 'Electricista',
          sexo: 'M',
        },
        {
          cedula: '7397415',
          nombre: 'Alexis Mogollon',
          empresa: 'Polyplast',
          cargo: 'Soldador',
          sexo: 'M',
        },
        {
          cedula: '13774419',
          nombre: 'Alexis Peralta',
          empresa: 'Polyplast',
          cargo: 'Soldador',
          sexo: 'M',
        },
        {
          cedula: '26502828',
          nombre: 'Alexis Peralta',
          empresa: 'Polyplast',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '10764646',
          nombre: 'Alexis Vargas',
          empresa: 'Polyplast',
          cargo: 'Supervisor',
          sexo: 'F',
        },
        {
          cedula: '9553090',
          nombre: 'Alfredo Medina',
          empresa: 'Polyplast',
          cargo: 'Vigilante',
          sexo: 'M',
        },
        {
          cedula: '15427595',
          nombre: 'Antonio Rojas',
          empresa: 'Polyplast',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '23836227',
          nombre: 'Carlos Aguilar',
          empresa: 'Polyplast',
          cargo: 'Montacarguista',
          sexo: 'M',
        },
        {
          cedula: '13791017',
          nombre: 'Carmen Artahona',
          empresa: 'Polyplast',
          cargo: 'Mantenimiento',
          sexo: 'F',
        },
        {
          cedula: '23481082',
          nombre: 'Luis Rangel',
          empresa: 'Polyplast',
          cargo: 'Vigilante',
          sexo: 'M',
        },
        {
          cedula: '25834946',
          nombre: 'Eslisaul Piña',
          empresa: 'Polyplast',
          cargo: 'Soldador',
          sexo: 'M',
        },
        {
          cedula: '11615866',
          nombre: 'Henry Viloria',
          empresa: 'Polyplast',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '12860602',
          nombre: 'Jarrison Caripa',
          empresa: 'Polyplast',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '18103551',
          nombre: 'Jesús Colmenarez',
          empresa: 'Polyplast',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '19640594',
          nombre: 'Jesus Perez',
          empresa: 'Polyplast',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '27831438',
          nombre: 'José Alfredo León',
          empresa: 'Polyplast',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '25648560',
          nombre: 'Luis Maldonado',
          empresa: 'Polyplast',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '16001131',
          nombre: 'Mayreli Ramones',
          empresa: 'Polyplast',
          cargo: 'Obrero',
          sexo: 'F',
        },
        {
          cedula: '10955003',
          nombre: 'Olirio Perez',
          empresa: 'Polyplast',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '16277388',
          nombre: 'Sandis Medina',
          empresa: 'Polyplast',
          cargo: 'Vigilante',
          sexo: 'M',
        },
        {
          cedula: '24613047',
          nombre: 'Sorangel Gomez',
          empresa: 'Polyplast',
          cargo: 'Asistente Administrativo',
          sexo: 'F',
        },
        {
          cedula: '18526091',
          nombre: 'Yennys Riera',
          empresa: 'Polyplast',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '28055660',
          nombre: 'Yoiber Pimentel',
          empresa: 'Polyplast',
          cargo: 'Soldador',
          sexo: 'M',
        },
        {
          cedula: '5935954',
          nombre: 'Bella Pacheco',
          empresa: 'Prosfiga',
          cargo: 'Asistente de Administracion',
          sexo: 'F',
        },
        {
          cedula: '13543353',
          nombre: 'Jordono Jimenez',
          empresa: 'Prosfiga',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '13774252',
          nombre: 'José Garrido',
          empresa: 'Prosfiga',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '7939858',
          nombre: 'Maritza Arteaga',
          empresa: 'Prosfiga',
          cargo: 'Asistente de Administracion',
          sexo: 'F',
        },
        {
          cedula: '28245748',
          nombre: 'Pablo Torres',
          empresa: 'Prosfiga',
          cargo: 'Obrero',
          sexo: 'M',
        },
        {
          cedula: '4192479',
          nombre: 'Ramón Camacaro',
          empresa: 'Prosfiga',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '16530157',
          nombre: 'Jairo Mujica',
          empresa: 'Sugeven',
          cargo: 'Soldador',
          sexo: 'M',
        },
        {
          cedula: '27397834',
          nombre: 'Francisco Lopez',
          empresa: 'Sugeven',
          cargo: 'Soldador',
          sexo: 'M',
        },
        {
          cedula: '24162568',
          nombre: 'Jhonny Rodriguez',
          empresa: 'Sugeven',
          cargo: 'Servicios Generales',
          sexo: 'M',
        },
        {
          cedula: '16003327',
          nombre: 'Alexander Peña',
          empresa: 'Sugeven',
          cargo: 'Servicios Generales',
          sexo: 'M',
        },
        {
          cedula: '23487576',
          nombre: 'Brayan Teran',
          empresa: 'Sugeven',
          cargo: 'Servicios Generales',
          sexo: 'M',
        },
        {
          cedula: '12031173',
          nombre: 'Reyes Arias',
          empresa: 'Sugeven',
          cargo: 'Montacarga',
          sexo: 'M',
        },
        {
          cedula: '15961418',
          nombre: 'Deisy Castañeda',
          empresa: 'Sugeven',
          cargo: 'Mantenimiento',
          sexo: 'F',
        },
        {
          cedula: '19240463',
          nombre: 'Aquiles Gil',
          empresa: 'Sugeven',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '13991772',
          nombre: 'Claudio Camejo',
          empresa: 'Sugeven',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '11428255',
          nombre: 'Luis Boquilla',
          empresa: 'Sugeven',
          cargo: 'Servicios Generales',
          sexo: 'M',
        },
        {
          cedula: '16585133',
          nombre: 'Joel Moncada',
          empresa: 'Sugeven',
          cargo: 'Electromecanico',
          sexo: 'M',
        },
        {
          cedula: '9615525',
          nombre: 'Geremias Duran',
          empresa: 'Sugeven',
          cargo: 'Servicios Generales',
          sexo: 'M',
        },
        {
          cedula: '22189935',
          nombre: 'Jesus Peña',
          empresa: 'Sugeven',
          cargo: 'Soldador',
          sexo: 'M',
        },
        {
          cedula: '7421152',
          nombre: 'Jose Luis Silva',
          empresa: 'Sugeven',
          cargo: 'Ayudante Operario',
          sexo: 'M',
        },
        {
          cedula: '10476095',
          nombre: 'Marcos Miquilena',
          empresa: 'Sugeven',
          cargo: 'Supervisor',
          sexo: 'M',
        },
        {
          cedula: '12020760',
          nombre: 'Guillermo Mora',
          empresa: 'Sugeven',
          cargo: 'Servicios Generales',
          sexo: 'M',
        },
        {
          cedula: '14270706',
          nombre: 'Mariely Castañeda',
          empresa: 'Sugeven',
          cargo: 'Administración',
          sexo: 'F',
        },
        {
          cedula: '13775847',
          nombre: 'Julio Cesar Rojas',
          empresa: 'Sugeven',
          cargo: 'Montacarga',
          sexo: 'M',
        },
        {
          cedula: '15425457',
          nombre: 'Jose Moncada',
          empresa: 'Sugeven',
          cargo: 'Jefe de Planta',
          sexo: 'M',
        },
        {
          cedula: '24400732',
          nombre: 'Genesis Gomez',
          empresa: 'Sugeven',
          cargo: 'Asistente de Administracion',
          sexo: 'F',
        },
        {
          cedula: '13855167',
          nombre: 'Heidy Pérez',
          empresa: 'Sugeven',
          cargo: 'Asistente Administrativo',
          sexo: 'F',
        },
        {
          cedula: '9618281',
          nombre: 'Adelis Castillo',
          empresa: 'Servicompresores',
          cargo: 'Operario',
          sexo: 'M',
        },
        {
          cedula: '11597862',
          nombre: 'Angel Omar Sanchez',
          empresa: 'Servicompresores',
          cargo: 'Gerente de Soporte Tecnico',
          sexo: 'M',
        },
        {
          cedula: '20666228',
          nombre: 'Carina Alvarez',
          empresa: 'Servicompresores',
          cargo: 'Coordinador de Normalizacion',
          sexo: 'F',
        },
        {
          cedula: '9574479',
          nombre: 'Clemente Herrera',
          empresa: 'Servicompresores',
          cargo: 'Tecnico Cnc',
          sexo: 'M',
        },
        {
          cedula: '17814213',
          nombre: 'Darvin Rojas',
          empresa: 'Servicompresores',
          cargo: 'Operador de Torno',
          sexo: 'M',
        },
        {
          cedula: '18527015',
          nombre: 'Darwin Sanchez',
          empresa: 'Servicompresores',
          cargo: 'Especialista en Soporte Tecnico',
          sexo: 'M',
        },
        {
          cedula: '10802197',
          nombre: 'Eddy Yepez',
          empresa: 'Servicompresores',
          cargo: 'Supervisor de Sha',
          sexo: 'M',
        },
        {
          cedula: '11432818',
          nombre: 'Elsy Palacios',
          empresa: 'Servicompresores',
          cargo: 'Gerente General',
          sexo: 'F',
        },
        {
          cedula: '14269644',
          nombre: 'Emil Martinez',
          empresa: 'Servicompresores',
          cargo: 'Representante de Soporte Tecnico',
          sexo: 'M',
        },
        {
          cedula: '23491733',
          nombre: 'Emilys Guedez',
          empresa: 'Servicompresores',
          cargo: 'Planificador de Produccion',
          sexo: 'F',
        },
        {
          cedula: '12536492',
          nombre: 'Francisco Garcia',
          empresa: 'Servicompresores',
          cargo: 'Tecnico de Calidad',
          sexo: 'M',
        },
        {
          cedula: '9545525',
          nombre: 'Hector Perozo',
          empresa: 'Servicompresores',
          cargo: 'Coordinador de Operaciones',
          sexo: 'M',
        },
        {
          cedula: '12241448',
          nombre: 'Javier Sira',
          empresa: 'Servicompresores',
          cargo: 'Operador Integral',
          sexo: 'M',
        },
        {
          cedula: '7341301',
          nombre: 'José Gregorio Díaz',
          empresa: 'Servicompresores',
          cargo: 'Operario',
          sexo: 'M',
        },
        {
          cedula: '9570327',
          nombre: 'José Miguel Perez',
          empresa: 'Servicompresores',
          cargo: 'Sub Gerente de Logistica',
          sexo: 'M',
        },
        {
          cedula: '14442906',
          nombre: 'Julio Velandria',
          empresa: 'Servicompresores',
          cargo: 'Esp. de Petroleo y Mineria',
          sexo: 'M',
        },
        {
          cedula: '9602556',
          nombre: 'Luis Medina',
          empresa: 'Servicompresores',
          cargo: 'Técnico de Calidad',
          sexo: 'M',
        },
        {
          cedula: '15856887',
          nombre: 'Luisa Contreras',
          empresa: 'Servicompresores',
          cargo: 'Analista Administrativo',
          sexo: 'F',
        },
        {
          cedula: '25961489',
          nombre: 'Maria Rondon',
          empresa: 'Servicompresores',
          cargo: 'Analista de Rrhh',
          sexo: 'F',
        },
        {
          cedula: '20671031',
          nombre: 'Niocar Puerta',
          empresa: 'Servicompresores',
          cargo: 'Analista',
          sexo: 'F',
        },
        {
          cedula: '10907908',
          nombre: 'Norma Carrasquero',
          empresa: 'Servicompresores',
          cargo: 'Gerente Administrativo',
          sexo: 'F',
        },
        {
          cedula: '7381582',
          nombre: 'Pastor Terán',
          empresa: 'Servicompresores',
          cargo: 'Operario',
          sexo: 'M',
        },
        {
          cedula: '12700730',
          nombre: 'Pedro Vargas',
          empresa: 'Servicompresores',
          cargo: 'Subgerente de Calidad',
          sexo: 'M',
        },
        {
          cedula: '14981699',
          nombre: 'Renzo Jaimes',
          empresa: 'Servicompresores',
          cargo: 'Operador Tecnico',
          sexo: 'M',
        },
        {
          cedula: '10775989',
          nombre: 'Robert Gomez',
          empresa: 'Servicompresores',
          cargo: 'Subgerente de Planificación',
          sexo: 'M',
        },
        {
          cedula: '7327344',
          nombre: 'Victor Martinez',
          empresa: 'Servicompresores',
          cargo: 'Operario',
          sexo: 'M',
        },
        {
          cedula: '11266690',
          nombre: 'Yraida Perez',
          empresa: 'Servicompresores',
          cargo: 'Mantenimiento',
          sexo: 'F',
        },
        {
          cedula: '4342172',
          nombre: 'Pedro Sira',
          empresa: 'Taelinca',
          cargo: 'Coordinador de Soldadura',
          sexo: 'M',
        },
        {
          cedula: '7397698',
          nombre: 'Alexander Piña',
          empresa: 'Taelinca',
          cargo: 'Mensajero',
          sexo: 'M',
        },
        {
          cedula: '9116053',
          nombre: 'Alexis Daza',
          empresa: 'Taelinca',
          cargo: 'Seguridad',
          sexo: 'M',
        },
        {
          cedula: '9617004',
          nombre: 'Ali Mosquera',
          empresa: 'Taelinca',
          cargo: 'Soldador',
          sexo: 'M',
        },
        {
          cedula: '9557902',
          nombre: 'Argimiro Hernandez',
          empresa: 'Taelinca',
          cargo: 'Operador de Maquina',
          sexo: 'M',
        },
        {
          cedula: '9116055',
          nombre: 'Carlos Daza',
          empresa: 'Taelinca',
          cargo: 'Seguridad',
          sexo: 'M',
        },
        {
          cedula: '15886042',
          nombre: 'Carmen Rojas',
          empresa: 'Taelinca',
          cargo: 'Ayudante de Servicio General',
          sexo: 'F',
        },
        {
          cedula: '9557838',
          nombre: 'Cirilo Catari',
          empresa: 'Taelinca',
          cargo: 'Operador de Maquina',
          sexo: 'M',
        },
        {
          cedula: '9540883',
          nombre: 'Douglas Rodriguez',
          empresa: 'Taelinca',
          cargo: 'Coordinador de Taller',
          sexo: 'M',
        },
        {
          cedula: '11883983',
          nombre: 'Eloiza Rodríguez',
          empresa: 'Taelinca',
          cargo: 'Contabilidad',
          sexo: 'F',
        },
        {
          cedula: '9618143',
          nombre: 'Henry Martinez',
          empresa: 'Taelinca',
          cargo: 'Jefe de Mantenimiento',
          sexo: 'F',
        },
        {
          cedula: '10841750',
          nombre: 'Heriberto González',
          empresa: 'Taelinca',
          cargo: 'Coordinador de Pintura',
          sexo: 'M',
        },
        {
          cedula: '12022284',
          nombre: 'Hernán Miranda',
          empresa: 'Taelinca',
          cargo: 'Operador Maquina Pau',
          sexo: 'M',
        },
        {
          cedula: '17728363',
          nombre: 'Jaime Peña',
          empresa: 'Taelinca',
          cargo: 'Operador de Maquina',
          sexo: 'M',
        },
        {
          cedula: '9554294',
          nombre: 'Jhonny Sánchez',
          empresa: 'Taelinca',
          cargo: 'Electromecanico',
          sexo: 'M',
        },
        {
          cedula: '9623823',
          nombre: 'José Gutierrez',
          empresa: 'Taelinca',
          cargo: 'Ensamblador',
          sexo: 'M',
        },
        {
          cedula: '13268249',
          nombre: 'José Pérez',
          empresa: 'Taelinca',
          cargo: 'Ensamblador',
          sexo: 'M',
        },
        {
          cedula: '10773688',
          nombre: 'Juan B Frias',
          empresa: 'Taelinca',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '11877338',
          nombre: 'Juan Daza',
          empresa: 'Taelinca',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '10848755',
          nombre: 'Keiler López',
          empresa: 'Taelinca',
          cargo: 'Coordinador de Ventas',
          sexo: 'M',
        },
        {
          cedula: '7388179',
          nombre: 'Marlene Querales',
          empresa: 'Taelinca',
          cargo: 'Ayudante de Almacen',
          sexo: 'F',
        },
        {
          cedula: '4274113',
          nombre: 'Maxewel Marquez',
          empresa: 'Taelinca',
          cargo: 'Ensamblador',
          sexo: 'M',
        },
        {
          cedula: '11427124',
          nombre: 'Nelson González',
          empresa: 'Taelinca',
          cargo: 'Operador Maquina Pau',
          sexo: 'M',
        },
        {
          cedula: '7359557',
          nombre: 'Omar Guédez',
          empresa: 'Taelinca',
          cargo: 'Tornero',
          sexo: 'M',
        },
        {
          cedula: '7424873',
          nombre: 'Regulo Gutiérrez',
          empresa: 'Taelinca',
          cargo: 'Coordinador de Torneria',
          sexo: 'M',
        },
        {
          cedula: '6811341',
          nombre: 'Reina Gonzalez',
          empresa: 'Taelinca',
          cargo: 'Recursos Humanos',
          sexo: 'F',
        },
        {
          cedula: '9622623',
          nombre: 'Sandra Parra',
          empresa: 'Taelinca',
          cargo: 'Asistente de Planta',
          sexo: 'F',
        },
        {
          cedula: '11882794',
          nombre: 'Trijilio Piña',
          empresa: 'Taelinca',
          cargo: 'Operador de Maquina',
          sexo: 'M',
        },
        {
          cedula: '11877674',
          nombre: 'Luis Palencia',
          empresa: 'Taelinca',
          cargo: 'Asistente Administrativo',
          sexo: 'M',
        },
        {
          cedula: '16137274',
          nombre: 'Willian Oliveros',
          empresa: 'Taelinca',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '9848054',
          nombre: 'Alvaro Guitierrez',
          empresa: 'Venfood',
          cargo: 'Supervisor de Almacén',
          sexo: 'M',
        },
        {
          cedula: '25630312',
          nombre: 'Andrea Linarez',
          empresa: 'Venfood',
          cargo: 'Analista Contable',
          sexo: 'F',
        },
        {
          cedula: '15389502',
          nombre: 'Andres Ledezma',
          empresa: 'Venfood',
          cargo: 'Supervisor de Ventas',
          sexo: 'M',
        },
        {
          cedula: '21503065',
          nombre: 'Angel Torres',
          empresa: 'Venfood',
          cargo: 'Ayudante de Mantenimiento',
          sexo: 'M',
        },
        {
          cedula: '7319146',
          nombre: 'Argenis Aldana',
          empresa: 'Venfood',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '22196530',
          nombre: 'Branyeliz Mora',
          empresa: 'Venfood',
          cargo: 'Analista de Operaciones',
          sexo: 'M',
        },
        {
          cedula: '17306648',
          nombre: 'Christian Alnvis',
          empresa: 'Venfood',
          cargo: 'Jefe de Planta',
          sexo: 'M',
        },
        {
          cedula: '19697056',
          nombre: 'Danisnel Davidad Timaure',
          empresa: 'Venfood',
          cargo: 'Analista de Cxp',
          sexo: 'M',
        },
        {
          cedula: '25149414',
          nombre: 'Deysi Montero',
          empresa: 'Venfood',
          cargo: 'Analista de Operaciones',
          sexo: 'F',
        },
        {
          cedula: '19433384',
          nombre: 'Edgar Domoromo',
          empresa: 'Venfood',
          cargo: 'Ayudante de Chofer',
          sexo: 'M',
        },
        {
          cedula: '15306196',
          nombre: 'Edgardo Sosa',
          empresa: 'Venfood',
          cargo: 'Supervisor de Produccion',
          sexo: 'M',
        },
        {
          cedula: '26502519',
          nombre: 'Eliecer Namia',
          empresa: 'Venfood',
          cargo: 'Trade Marketing',
          sexo: 'M',
        },
        {
          cedula: '7437350',
          nombre: 'Ernesto Garcia',
          empresa: 'Venfood',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '11786823',
          nombre: 'Gadielis Rodriguez',
          empresa: 'Venfood',
          cargo: 'Supervisor de Control de Calidad',
          sexo: 'F',
        },
        {
          cedula: '7426507',
          nombre: 'Gloria Sánchez',
          empresa: 'Venfood',
          cargo: 'Mantenimiento',
          sexo: 'F',
        },
        {
          cedula: '23836271',
          nombre: 'Henber Rojas',
          empresa: 'Venfood',
          cargo: 'Analista Cuentas por Pagar',
          sexo: 'M',
        },
        {
          cedula: '12536221',
          nombre: 'Henry Suárez',
          empresa: 'Venfood',
          cargo: 'Asesor de Ventas',
          sexo: 'M',
        },
        {
          cedula: '9550590',
          nombre: 'Jackeline Vasquez',
          empresa: 'Venfood',
          cargo: 'Mantenimiento',
          sexo: 'M',
        },
        {
          cedula: '13189170',
          nombre: 'Jenifer Soto',
          empresa: 'Venfood',
          cargo: 'Jefe de Operaciones',
          sexo: 'F',
        },
        {
          cedula: '15003514',
          nombre: 'Jhon Paredes',
          empresa: 'Venfood',
          cargo: 'Estadista de Venta',
          sexo: 'M',
        },
        {
          cedula: '22200863',
          nombre: 'Jhony Rodríguez',
          empresa: 'Venfood',
          cargo: 'Ayudante de Chofer',
          sexo: 'M',
        },
        {
          cedula: '10771857',
          nombre: 'Jimmy Peña',
          empresa: 'Venfood',
          cargo: 'Vigilante',
          sexo: 'M',
        },
        {
          cedula: '23811665',
          nombre: 'Jose Mirabal',
          empresa: 'Venfood',
          cargo: 'Ayudante de Chofer',
          sexo: 'M',
        },
        {
          cedula: '12433684',
          nombre: 'Juan Carlos Juarez',
          empresa: 'Venfood',
          cargo: 'Coordinador de Almacen',
          sexo: 'M',
        },
        {
          cedula: '9556386',
          nombre: 'Julio Brito',
          empresa: 'Venfood',
          cargo: 'Supervisor de Ventas',
          sexo: 'M',
        },
        {
          cedula: '15444857',
          nombre: 'Julio Ortega',
          empresa: 'Venfood',
          cargo: 'Mantenimiento',
          sexo: 'M',
        },
        {
          cedula: '21503064',
          nombre: 'Kevin Valera',
          empresa: 'Venfood',
          cargo: 'Analista de Operaciones',
          sexo: 'M',
        },
        {
          cedula: '24325485',
          nombre: 'Marcelis Dun',
          empresa: 'Venfood',
          cargo: 'Analista Cxc',
          sexo: 'F',
        },
        {
          cedula: '14649808',
          nombre: 'María Quero',
          empresa: 'Venfood',
          cargo: 'Analista de Egreso',
          sexo: 'F',
        },
        {
          cedula: '19636615',
          nombre: 'Maria V Ruiz',
          empresa: 'Venfood',
          cargo: 'Supervisor de Produccion',
          sexo: 'F',
        },
        {
          cedula: '12247272',
          nombre: 'Marielbis Baez',
          empresa: 'Venfood',
          cargo: 'Asesor de Ventas',
          sexo: 'M',
        },
        {
          cedula: '13921660',
          nombre: 'Nacarit Pastora Valenzuela',
          empresa: 'Venfood',
          cargo: 'Analista de Crédito y Cobranza',
          sexo: 'F',
        },
        {
          cedula: '9543514',
          nombre: 'Nelson Montes',
          empresa: 'Venfood',
          cargo: 'Vigilante',
          sexo: 'M',
        },
        {
          cedula: '21128941',
          nombre: 'Oralis Garcia',
          empresa: 'Venfood',
          cargo: 'Analista Cxc',
          sexo: 'F',
        },
        {
          cedula: '16794672',
          nombre: 'Rossana Lanza',
          empresa: 'Venfood',
          cargo: 'Vendedor',
          sexo: 'F',
        },
        {
          cedula: '12248429',
          nombre: 'Ruben Antonio Pineda',
          empresa: 'Venfood',
          cargo: 'Vendedor',
          sexo: 'M',
        },
        {
          cedula: '19779882',
          nombre: 'Victor Vásquez',
          empresa: 'Venfood',
          cargo: 'Montacarguista',
          sexo: 'M',
        },
        {
          cedula: '17828749',
          nombre: 'Williams Valera',
          empresa: 'Venfood',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '30480198',
          nombre: 'Wilman Torrealba',
          empresa: 'Venfood',
          cargo: 'Analista de Cxp',
          sexo: 'M',
        },
        {
          cedula: '9620860',
          nombre: 'Wilmer Cordero',
          empresa: 'Venfood',
          cargo: 'Vendedor',
          sexo: 'M',
        },
        {
          cedula: '21296923',
          nombre: 'Yonathan Aguilar',
          empresa: 'Venfood',
          cargo: 'Analista de Operaciones',
          sexo: 'M',
        },
        {
          cedula: '29831288',
          nombre: 'Gabriel Hernandez',
          empresa: 'Venfood',
          cargo: 'Ayudante de Almacen',
          sexo: 'M',
        },
        {
          cedula: '19105253',
          nombre: 'Jhon Griman',
          empresa: 'Venfood',
          cargo: 'Ayudante de Almacén',
          sexo: 'M',
        },
        {
          cedula: '25149094',
          nombre: 'Alvis Vasquez',
          empresa: 'Venfood',
          cargo: 'Electricista',
          sexo: 'M',
        },
        {
          cedula: '24680836',
          nombre: 'Kimberly Gil',
          empresa: 'Venfood',
          cargo: 'Supervisor de Produccion',
          sexo: 'F',
        },
        {
          cedula: '17873167',
          nombre: 'Yudeirys Mendoza',
          empresa: 'Venfood',
          cargo: 'Analista Contable',
          sexo: 'F',
        },
        {
          cedula: '12019350',
          nombre: 'Luis Brandt',
          empresa: 'Venfood',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '10483427',
          nombre: 'Willian Nelo',
          empresa: 'Venfood',
          cargo: 'Supervisor',
          sexo: 'M',
        },
        {
          cedula: '17196472',
          nombre: 'Elieser Figueroa',
          empresa: 'Venfood',
          cargo: 'Ayudante de Chofer',
          sexo: 'M',
        },
        {
          cedula: '13084081',
          nombre: 'Raquel Principal',
          empresa: 'Venfood',
          cargo: 'Analista Contable',
          sexo: 'F',
        },
        {
          cedula: '8637348',
          nombre: 'Humberto Rodriguez',
          empresa: 'Venfood',
          cargo: 'Supervisor de Control de Calidad',
          sexo: 'M',
        },
        {
          cedula: '8637507',
          nombre: 'Gilberto Ramos',
          empresa: 'Venfood',
          cargo: 'Electomecanico',
          sexo: 'M',
        },
        {
          cedula: '10778668',
          nombre: 'Yelitza Martinez',
          empresa: 'Venfood',
          cargo: 'Jefe de Credito y Cobranza',
          sexo: 'F',
        },
        {
          cedula: '19639578',
          nombre: 'Erika Gomez',
          empresa: 'Venfood',
          cargo: 'Analista C y C',
          sexo: 'F',
        },
        {
          cedula: '15351760',
          nombre: 'Wilmary Yedra',
          empresa: 'Venfood',
          cargo: 'Analista de Ventas',
          sexo: 'F',
        },
        {
          cedula: '7382255',
          nombre: 'Pastor Reyes',
          empresa: 'Venfood',
          cargo: 'Escolta',
          sexo: 'M',
        },
        {
          cedula: '19726878',
          nombre: 'Katty Alvarado',
          empresa: 'Venfood',
          cargo: 'Analista de Operaciones',
          sexo: 'F',
        },
        {
          cedula: '29517993',
          nombre: 'Nataly Perez',
          empresa: 'Venfood',
          cargo: 'Analista Rrhh',
          sexo: 'F',
        },
        {
          cedula: '24326661',
          nombre: 'Luis Campos',
          empresa: 'Venfood',
          cargo: 'Analista de Operaciones',
          sexo: 'M',
        },
        {
          cedula: '30075546',
          nombre: 'Anderson Colmenarez',
          empresa: 'Venfood',
          cargo: 'Analista Cxp',
          sexo: 'M',
        },
        {
          cedula: '19887232',
          nombre: 'Yixy Morlet',
          empresa: 'Venfood',
          cargo: 'Analista C y C',
          sexo: 'F',
        },
        {
          cedula: '16585281',
          nombre: 'Omar Alvarez',
          empresa: 'Venfood',
          cargo: 'Ayudante',
          sexo: 'M',
        },
        {
          cedula: '17468119',
          nombre: 'Reyna Castillo',
          empresa: 'Venfood',
          cargo: 'Analista Cxc',
          sexo: 'F',
        },
        {
          cedula: '13084658',
          nombre: 'Rafael Perez',
          empresa: 'Venfood',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '7432677',
          nombre: 'Jhansen Baez',
          empresa: 'Venfood',
          cargo: 'Trabajador Tipo I',
          sexo: 'M',
        },
        {
          cedula: '24679871',
          nombre: 'Belsy Garrido',
          empresa: 'Venfood',
          cargo: 'Analista Cxc',
          sexo: 'F',
        },
        {
          cedula: '11784090',
          nombre: 'Franny Romero',
          empresa: 'Venfood',
          cargo: 'Supervisor de Almacén',
          sexo: 'F',
        },
        {
          cedula: '5970535',
          nombre: 'Edgar Grooscors',
          empresa: 'Venfood',
          cargo: 'Jefe de Planta',
          sexo: 'M',
        },
        {
          cedula: '15425618',
          nombre: 'Jose Angola',
          empresa: 'Venfood',
          cargo: 'Ayudante de Almacen',
          sexo: 'M',
        },
        {
          cedula: '27142612',
          nombre: 'Diego Unda',
          empresa: 'Venfood',
          cargo: 'Analista de Cuentas por Cobrar',
          sexo: 'M',
        },
        {
          cedula: '19347927',
          nombre: 'Alejandro Barrios',
          empresa: 'Venfood',
          cargo: 'Ayudante de Almacén',
          sexo: 'M',
        },
        {
          cedula: '10848709',
          nombre: 'Nelson Gil',
          empresa: 'Venfood',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '12703328',
          nombre: 'Yadira Sánchez',
          empresa: 'Venfood',
          cargo: 'Vendedor',
          sexo: 'F',
        },
        {
          cedula: '19264671',
          nombre: 'Luis Sequera',
          empresa: 'Venfood',
          cargo: 'Promotor de Ventas',
          sexo: 'M',
        },
        {
          cedula: '25469551',
          nombre: 'Franyelis Pereira',
          empresa: 'Venfood',
          cargo: 'Analista de Cxc',
          sexo: 'F',
        },
        {
          cedula: '16385700',
          nombre: 'Raymer París',
          empresa: 'Venfood',
          cargo: 'Vendedor',
          sexo: 'M',
        },
        {
          cedula: '17104710',
          nombre: 'Karelys Arrieche',
          empresa: 'Venfood',
          cargo: 'Vendedor',
          sexo: 'F',
        },
        {
          cedula: '26964746',
          nombre: 'José Peña',
          empresa: 'Venfood',
          cargo: 'Vendedor',
          sexo: 'M',
        },
        {
          cedula: '13206171',
          nombre: 'Jakson Umbría',
          empresa: 'Venfood',
          cargo: 'Chofer',
          sexo: 'M',
        },
        {
          cedula: '23537141',
          nombre: 'Luzyenmar Azuaje',
          empresa: 'Venfood',
          cargo: 'Promotor de Ventas',
          sexo: 'F',
        },
        {
          cedula: '28381651',
          nombre: 'Cristobal Lopez',
          empresa: 'Venfood',
          cargo: 'Ayudante de Chofer',
          sexo: 'M',
        },
        {
          cedula: '18737802',
          nombre: 'Eliasib Silva',
          empresa: 'Zootek',
          cargo: 'Aseguramiento de Calidad',
          sexo: 'M',
        },
        {
          cedula: '15732578',
          nombre: 'Jesika Paredes',
          empresa: 'Zootek',
          cargo: 'Jefe Jr. de Operaciones',
          sexo: 'F',
        },
        {
          cedula: '11593502',
          nombre: 'José Luis Ortiz',
          empresa: 'Zootek',
          cargo: 'Operario',
          sexo: 'M',
        },
        {
          cedula: '15108735',
          nombre: 'Leidy Marin',
          empresa: 'Zootek',
          cargo: 'Jefe Jr. de Operaciones',
          sexo: 'F',
        },
        {
          cedula: '13855701',
          nombre: 'Luis Antonio Aponte',
          empresa: 'Zootek',
          cargo: 'Operario',
          sexo: 'M',
        },
        {
          cedula: '15732976',
          nombre: 'Sanny Melendez',
          empresa: 'Zootek',
          cargo: 'Asistente Administrativo',
          sexo: 'F',
        },
        {
          cedula: '20669438',
          nombre: 'Omaria Lopez',
          empresa: 'Zootek',
          cargo: 'Supervisor de Contabilidad',
          sexo: 'F',
        },
        {
          cedula: '18262553',
          nombre: 'Yulimar Alvarez',
          empresa: 'Zootek',
          cargo: 'Coordinadora de Costos',
          sexo: 'F',
        },
        {
          cedula: '196933',
          nombre: 'Maryorie Briceño',
          empresa: 'Megasuspensiones',
          cargo: 'Secretario',
          sexo: 'F',
        },
        {
          cedula: '12249785',
          nombre: 'Luis Enrique Piña',
          empresa: 'Megasuspensiones',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '3559688',
          nombre: 'Juan David Unda',
          empresa: 'Megasuspensiones',
          cargo: 'Mecanico',
          sexo: 'M',
        },
        {
          cedula: '18057069',
          nombre: 'Carolina Sequera',
          empresa: 'Concaribe',
          cargo: 'Mantenimiento',
          sexo: 'F',
        },
        {
          cedula: '26006996',
          nombre: 'Eriana Nieto',
          empresa: 'Concaribe',
          cargo: 'Analista Administrativo',
          sexo: 'F',
        },
        {
          cedula: '32432279',
          nombre: 'Josue Pérez',
          empresa: 'Concaribe',
          cargo: 'Técnico de Sci',
          sexo: 'M',
        },
        {
          cedula: '16001513',
          nombre: 'Javier Vásquez',
          empresa: 'Concaribe',
          cargo: 'Operador',
          sexo: 'M',
        },
        {
          cedula: '32200181',
          nombre: 'Crissairys Angulo',
          empresa: 'Concaribe',
          cargo: 'Analista de o y S',
          sexo: 'F',
        },
        {
          cedula: '30405395',
          nombre: 'Reibert Duno',
          empresa: 'Concaribe',
          cargo: 'Técnico de Sci',
          sexo: 'M',
        },
        {
          cedula: '24325434',
          nombre: 'Sabrina Gómez',
          empresa: 'Concaribe',
          cargo: 'Sup. Operaciones',
          sexo: 'F',
        },
        {
          cedula: '15960286',
          nombre: 'Rosana Carolina Alvarado Rodríguez',
          empresa: 'Concaribe',
          cargo: 'Analista Administrativo',
          sexo: 'F',
        },
        {
          cedula: '28259658',
          nombre: 'María De Los Ángeles Burgos González',
          empresa: 'Concaribe',
          cargo: 'Analista en Higiene y Seguridad Laboral',
          sexo: 'F',
        },
        {
          cedula: '30266743',
          nombre: 'Rainer David Camacaro Sánchez',
          empresa: 'Concaribe',
          cargo: 'Tecnico en Informatica',
          sexo: 'M',
        },
        {
          cedula: '29778099',
          nombre: 'Enmanuel Antonio Duno Brizon',
          empresa: 'Concaribe',
          cargo: 'Técnico de Mantenimiento',
          sexo: 'M',
        },
        {
          cedula: '27524260',
          nombre: 'Jolver José Ereu Ereu',
          empresa: 'Concaribe',
          cargo: 'Ayudante de Mecánica',
          sexo: 'M',
        },
        {
          cedula: '25526624',
          nombre: 'Kristina Alejandra Heredia Castañeda',
          empresa: 'Concaribe',
          cargo: 'Asistente Técnico',
          sexo: 'F',
        },
        {
          cedula: '28286941',
          nombre: 'Alexa De Los Ángeles Jiménez Morales',
          empresa: 'Concaribe',
          cargo: 'Técnico de Mantenimiento',
          sexo: 'F',
        },
        {
          cedula: '13881854',
          nombre: 'Anyomar María Piedra Rodríguez',
          empresa: 'Concaribe',
          cargo: 'Analista Administrativo Integral',
          sexo: 'F',
        },
        {
          cedula: '22333909',
          nombre: 'Jalimar Evelin Pérez Hidalgo',
          empresa: 'Concaribe',
          cargo: 'Supervisor de Mantenimiento Sci',
          sexo: 'F',
        },
        {
          cedula: '29873367',
          nombre: 'Cristian José Quintero García',
          empresa: 'Concaribe',
          cargo: 'Técnico de Mantenimiento',
          sexo: 'M',
        },
        {
          cedula: '25141389',
          nombre: 'José Humberto Rivas Suarez',
          empresa: 'Concaribe',
          cargo: 'Técnico de Mantenimiento',
          sexo: 'M',
        },
        {
          cedula: '28454219',
          nombre: 'Efraín Javier Rodríguez Pineda',
          empresa: 'Concaribe',
          cargo: 'Ayudante de Mecánica',
          sexo: 'M',
        },
        {
          cedula: '26608104',
          nombre: 'Félix Eliezer Sequera Martínez',
          empresa: 'Concaribe',
          cargo: 'Técnico de Mantenimiento',
          sexo: 'M',
        },
        {
          cedula: '7326190',
          nombre: 'Jovito Antonio Vásquez',
          empresa: 'Concaribe',
          cargo: 'Mecánico',
          sexo: 'M',
        },
        {
          cedula: '29805724',
          nombre: 'Brian Abniel Vegas Chávez',
          empresa: 'Concaribe',
          cargo: 'Mecánico',
          sexo: 'M',
        },
        {
          cedula: '18949569',
          nombre: 'Eduardo Pérez',
          empresa: 'Concaribe',
          cargo: 'Técnico de Mantenimiento',
          sexo: 'M',
        },
        {
          cedula: '7399010',
          nombre: 'Yusmary Yépez',
          empresa: 'Concaribe',
          cargo: 'Auxiliar de Almacén',
          sexo: 'F',
        },
        {
          cedula: '5249270',
          nombre: 'Simón Paradas',
          empresa: 'Concaribe',
          cargo: 'Gerente de Operaciones',
          sexo: 'M',
        },
      ];

      // Filtrar cédulas inválidas
      const validWorkers = RAW_WORKERS.filter((w) => /^\d+$/.test(w.cedula));

      // Mapa de nombre de empresa → RIF (en orden de primera aparición)
      const companyRifMap = new Map<string, string>();
      let rifCounter = 1;
      for (const w of validWorkers) {
        if (!companyRifMap.has(w.empresa)) {
          companyRifMap.set(w.empresa, `J-00000000-${rifCounter++}`);
        }
      }

      // Insertar empresas y guardar IDs
      const companyIdMap = new Map<string, string>();
      for (const [nombre, rif] of companyRifMap.entries()) {
        const [inserted] = await db
          .insert(companies)
          .values({
            name: nombre,
            rif,
            address: 'Dirección no especificada',
            contact: `0412-${String(companyRifMap.size + rifCounter).padStart(7, '0')}`,
          })
          .onConflictDoUpdate({ target: companies.rif, set: { name: nombre } })
          .returning({ id: companies.id });
        companyIdMap.set(nombre, inserted.id);
        console.log(`  ✓ Empresa: ${nombre} (${rif})`);
      }

      // Insertar cargos por empresa (dedup case-insensitive) y guardar IDs
      const positionIdMap = new Map<string, string>(); // key: `${companyId}::${cargoLower}`
      for (const [nombre, companyId] of companyIdMap.entries()) {
        const cargosDeEstaEmpresa = [
          ...new Map(
            validWorkers
              .filter((w) => w.empresa === nombre)
              .map((w) => [w.cargo.toUpperCase(), w.cargo]),
          ).values(),
        ];
        for (const cargo of cargosDeEstaEmpresa) {
          const existing = await db
            .select({ id: positions.id })
            .from(positions)
            .where(
              and(
                eq(positions.companyId, companyId),
                eq(positions.name, cargo),
              ),
            )
            .limit(1);
          let posId: string;
          if (existing.length > 0) {
            posId = existing[0].id;
          } else {
            const [ins] = await db
              .insert(positions)
              .values({ name: cargo, companyId })
              .returning({ id: positions.id });
            posId = ins.id;
          }
          positionIdMap.set(`${companyId}::${cargo.toUpperCase()}`, posId);
        }
      }

      // Insertar pacientes
      let insertedCount = 0;
      let skippedCount = 0;
      for (const w of validWorkers) {
        const companyId = companyIdMap.get(w.empresa);
        const positionId = positionIdMap.get(
          `${companyId}::${w.cargo.toUpperCase()}`,
        );
        const nameParts = w.nombre.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;
        const result = await db
          .insert(patients)
          .values({
            cedula: w.cedula,
            firstName,
            lastName,
            companyId,
            positionId,
            sex: w.sexo,
          })
          .onConflictDoNothing({ target: patients.cedula });
        if ((result.rowCount ?? 0) > 0) {
          insertedCount++;
        } else {
          skippedCount++;
        }
      }
      console.log(
        `  ✓ Pacientes insertados: ${insertedCount}, omitidos (duplicados): ${skippedCount}`,
      );
    } // fin else (DB vacía)
  }
  // ── FIN BLOQUE WORKERS ─────────────────────────────────────────────────────

  // Crear tipos de riesgo (uno por cada tipo, usando riskType como nombre)
  console.log('\n⚠️  Creando tipos de riesgo...');
  for (const riskType of RISK_TYPES) {
    await db
      .insert(riskExposureCategories)
      .values({ riskType, name: riskType })
      .onConflictDoNothing({ target: riskExposureCategories.riskType });
    console.log(`  ✓ ${riskType}`);
  }

  // Crear indicadores psicológicos por defecto
  console.log('\n🧠 Creando indicadores psicológicos...');
  const PSYCH_INDICATORS_DATA = [
    {
      name: 'Ansiedad',
      sortOrder: 0,
      values: ['Ausente', 'Leve', 'Moderado', 'Alto'],
    },
    {
      name: 'Depresión',
      sortOrder: 1,
      values: ['Ausente', 'Leve', 'Moderado', 'Alto'],
    },
    {
      name: 'Estrés',
      sortOrder: 2,
      values: ['Ausente', 'Leve', 'Moderado', 'Alto'],
    },
    {
      name: 'Agotamiento',
      sortOrder: 3,
      values: ['Ausente', 'Leve', 'Moderado', 'Alto'],
    },
  ];

  for (const indData of PSYCH_INDICATORS_DATA) {
    const [inserted] = await db
      .insert(psychologicalIndicators)
      .values({ name: indData.name, sortOrder: indData.sortOrder })
      .onConflictDoNothing({ target: psychologicalIndicators.name })
      .returning();

    // Obtener el indicador (sea recién insertado o existente)
    const [existing] = await db
      .select()
      .from(psychologicalIndicators)
      .where(eq(psychologicalIndicators.name, indData.name));

    const indicator = inserted ?? existing;
    if (!indicator) continue;

    console.log(`  ✓ Indicador: ${indData.name}`);

    for (let vi = 0; vi < indData.values.length; vi++) {
      const valueName = indData.values[vi];
      await db
        .insert(psychologicalIndicatorValues)
        .values({
          indicatorId: indicator.id,
          name: valueName,
          sortOrder: vi,
        })
        .onConflictDoNothing({ target: [psychologicalIndicatorValues.indicatorId, psychologicalIndicatorValues.name] });
      console.log(`    ✓ Valor: ${valueName}`);
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
