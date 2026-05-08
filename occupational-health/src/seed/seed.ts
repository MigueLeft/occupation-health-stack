/**
 * Seed script para datos iniciales del sistema.
 * Ejecutar DESPUÉS de correr las migraciones:
 *   pnpm db:generate && pnpm db:migrate && pnpm seed
 */
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
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
    { name: 'TDAH (Trastorno por déficit de atención e hiperactividad)', isChronic: true },
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
    { name: 'Trastorno musculoesquelético relacionado con el trabajo', isChronic: true },
  ];
  for (const disease of DISEASES_DATA) {
    await db
      .insert(diseases)
      .values(disease)
      .onConflictDoNothing({ target: diseases.name });
    console.log(`  ✓ [${disease.isChronic ? 'crónica' : 'aguda  '}] ${disease.name}`);
  }

  // ── INICIO BLOQUE WORKERS ──────────────────────────────────────────────────
  // Comentar desde aquí hasta "FIN BLOQUE WORKERS" si no se desea cargar empresas/trabajadores
  if (process.env.LOAD_WORKERS === 'true') {
    console.log('\n📦 Cargando empresas y trabajadores...');

    const RAW_WORKERS: { cedula: string; nombre: string; empresa: string; cargo: string }[] = [
      { cedula: '13775358', nombre: 'ACOSTA RIOS YULIMAR GUADALUPE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '16498797', nombre: 'ALVARADO MARCANO JESUS ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '15625428', nombre: 'AVILA SUAREZ OSWALDO JOSE', empresa: 'El hechizo', cargo: 'AMASADOR' },
      { cedula: '9643585', nombre: 'BARRIOS MORA ARGENIS ALEJANDRO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '16193695', nombre: 'BRACHO PEREZ CESAR AUGUSTO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '10266978', nombre: 'COLMENARES BASTIDAS MIRIAM BEATRIZ', empresa: 'El hechizo', cargo: 'CAJERA' },
      { cedula: '16193694', nombre: 'BRACHO PEREZ CARLOS ANTONIO', empresa: 'El hechizo', cargo: 'AMASADOR' },
      { cedula: '7388016', nombre: 'GIMENEZ ROMERO EZEQUIEL', empresa: 'El hechizo', cargo: 'GERENTE' },
      { cedula: '6259490', nombre: 'OROPEZA PAREDES JOSE GREGORIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '9640756', nombre: 'PEREZ COLMENAREZ EDGAR ALFREDO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '10780832', nombre: 'PEREZ COLMENAREZ NILTON JAVIER', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '16738244', nombre: 'SUAREZ ANGULO CARLOS JOSE', empresa: 'El hechizo', cargo: 'AMASADOR' },
      { cedula: '10836069', nombre: 'TORTOLERO PRADA JHONNY ADOLFO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '9626437', nombre: 'VALERA PEREZ JOSE MIGUEL', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '18308601', nombre: 'DIAZ CONTRERAS MARISOL COROMOTO', empresa: 'El hechizo', cargo: 'CAJERA' },
      { cedula: '19090268', nombre: 'ALVARADO MARCANO YOHAN JOSE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '7421765', nombre: 'PEREZ HERNANDEZ OSCAR NICOLAS', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '7387858', nombre: 'MUJICA MUJICA JOSE FELIX', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '7419867', nombre: 'BUJANDA COLMENAREZ JOSE MANUEL', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '9624700', nombre: 'MUJICA MUJICA JOSE ALEJANDRO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '17290867', nombre: 'ACOSTA RIOS YOIMER JOSE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '20462540', nombre: 'ARROYO PEREIRA VICTOR MANUEL', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '16812720', nombre: 'MOLINA LEAL YOHAN JOSE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '12287019', nombre: 'CORONADO DIAZ NILO ESTEBAN', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '16498789', nombre: 'ALVARADO DIAZ CARLOS JOSE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '10813729', nombre: 'GARCIA BASTIDAS LUIS ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '12520703', nombre: 'PEREZ PEREZ RICHARD ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '12782049', nombre: 'BUJANDA COLMENAREZ JOHN ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '13261774', nombre: 'BUJANDA BUJANDA CARLOS EDUARDO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '9642578', nombre: 'MUJICA MUJICA JOSE DIONICIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '7387810', nombre: 'MUJICA PARADA JOSE AURELIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '16478297', nombre: 'RIOS MORA YERLIS CAROLINA', empresa: 'El hechizo', cargo: 'CAJERA' },
      { cedula: '14099671', nombre: 'CONTRERAS REYES CARLOS JOSE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '9628539', nombre: 'MUJICA MUJICA CARLOS MARIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '11284716', nombre: 'RAMIREZ RUIZ JOSE RAMIRO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '17618888', nombre: 'PINTO RODRIGUEZ JOHANNA BEATRIZ', empresa: 'El hechizo', cargo: 'CAJERA' },
      { cedula: '13257419', nombre: 'BASTIDAS COLMENAREZ EDICSON JOSE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '20267524', nombre: 'BUJANDA COLMENAREZ JOSE YONATAN', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '20267521', nombre: 'BUJANDA COLMENAREZ JOSE DANIEL', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '7385682', nombre: 'PEREZ BASTIDAS EDGAR AUGUSTO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '14290803', nombre: 'BASTIDAS COLMENAREZ NELSON JOSE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '12029628', nombre: 'BUJANDA COLMENAREZ EDGAR JOSE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '10836065', nombre: 'TORTOLERO PRADA ROLANDO ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '16036327', nombre: 'SUAREZ BASTIDAS JOSE ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '20940985', nombre: 'BUJANDA MUJICA CARLOS MANUEL', empresa: 'El hechizo', cargo: 'AMASADOR' },
      { cedula: '18309178', nombre: 'MUJICA MUJICA EDWAR JOSE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '23095386', nombre: 'BUJANDA MUJICA JOSE ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '20263011', nombre: 'CORDERO SOTO HEIDY CAROLINA', empresa: 'El hechizo', cargo: 'CAJERA' },
      { cedula: '16498800', nombre: 'SUAREZ ANGULO JOSE ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '7387820', nombre: 'MUJICA MUJICA ELEUTERIO DE JESUS', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '12029629', nombre: 'BUJANDA COLMENAREZ ELIA JOSEFINA', empresa: 'El hechizo', cargo: 'CAJERA' },
      { cedula: '14099654', nombre: 'CONTRERAS CONTRERAS RUBEN DARIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '9643634', nombre: 'CORDERO BASTIDAS FREDDY ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '7386118', nombre: 'PEREZ BASTIDAS JOSE ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '16498795', nombre: 'ALVARADO MARCANO ROSA MARIA', empresa: 'El hechizo', cargo: 'CAJERA' },
      { cedula: '9641560', nombre: 'MUJICA MUJICA VICTOR JULIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '14388636', nombre: 'LINARES MEDINA JOHN ALBERTO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '9641547', nombre: 'MUJICA MUJICA JOSE NIEVES', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '14388637', nombre: 'LINARES MEDINA JOSE GERARDO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '18619037', nombre: 'GONZALEZ CONTRERAS MARIA ELENA', empresa: 'El hechizo', cargo: 'CAJERA' },
      { cedula: '18308610', nombre: 'DIAZ CONTRERAS JESUS ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '14099670', nombre: 'CONTRERAS REYES NESTOR MANUEL', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '16498788', nombre: 'ALVARADO DIAZ MIREYA JOSEFINA', empresa: 'El hechizo', cargo: 'CAJERA' },
      { cedula: '7387883', nombre: 'MUJICA VILLARREAL WILMER JOSE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '9644037', nombre: 'COLMENAREZ AVILA PEDRO ANGEL', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '10835895', nombre: 'TORTOLERO COLMENAREZ EDGAR ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '9644026', nombre: 'COLMENAREZ AVILA TOMAS ENRIQUE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '12029625', nombre: 'BUJANDA COLMENAREZ YOLANDA COROMOTO', empresa: 'El hechizo', cargo: 'CAJERA' },
      { cedula: '15625413', nombre: 'AVILA SUAREZ JOSE ANGEL', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '17288884', nombre: 'MUJICA MUJICA RUBEN GREGORIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '20267522', nombre: 'BUJANDA COLMENAREZ JOSE EULOGIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '9640732', nombre: 'PEREZ COLMENAREZ PEDRO ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '25254046', nombre: 'BUJANDA PEREZ HECTOR MANUEL', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '19090270', nombre: 'PEREZ COLMENAREZ RUBEN DARIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '23095392', nombre: 'BUJANDA MUJICA JOSE EULOGIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '7388025', nombre: 'GIMENEZ ROMERO JOSE GREGORIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '10833577', nombre: 'COLMENAREZ AVILA JOSE GREGORIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '9641580', nombre: 'MUJICA MUJICA EDILIA JOSEFINA', empresa: 'El hechizo', cargo: 'CAJERA' },
      { cedula: '7389044', nombre: 'SUAREZ BASTIDAS JOSE DOMINGO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '7387854', nombre: 'MUJICA MUJICA JOSE DOLORES', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '17618906', nombre: 'PINTO RODRIGUEZ JOSE DANIEL', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '15625427', nombre: 'AVILA SUAREZ CARLOS RAFAEL', empresa: 'El hechizo', cargo: 'AMASADOR' },
      { cedula: '7387835', nombre: 'MUJICA MUJICA MARIA DE LOS ANGELES', empresa: 'El hechizo', cargo: 'CAJERA' },
      { cedula: '24484697', nombre: 'MUJICA BUJANDA JOSE ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '10836062', nombre: 'TORTOLERO PRADA JESUS ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '15625430', nombre: 'AVILA SUAREZ JESUS ALBERTO', empresa: 'El hechizo', cargo: 'AMASADOR' },
      { cedula: '7385695', nombre: 'PEREZ BASTIDAS JOSE DOLORES', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '11284738', nombre: 'RAMIREZ RUIZ JOSE MANUEL', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '9626435', nombre: 'VALERA PEREZ PEDRO JOSE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '9643611', nombre: 'CORDERO BASTIDAS JOSE ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '20462538', nombre: 'ARROYO PEREIRA JESUS ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '7388019', nombre: 'GIMENEZ ROMERO JOSE ANTONIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '9641552', nombre: 'MUJICA MUJICA JUAN BAUTISTA', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '22145432', nombre: 'BUJANDA PEREZ JOSE CARLOS', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '7385694', nombre: 'PEREZ BASTIDAS NELSON ENRIQUE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '14099681', nombre: 'CONTRERAS REYES LINO JOSE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '7387825', nombre: 'MUJICA MUJICA JOSE GREGORIO', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '14388640', nombre: 'LINARES MEDINA JESUS RENE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '7387843', nombre: 'MUJICA MUJICA JESUS DE JESUS', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '16498802', nombre: 'SUAREZ ANGULO OMAR JOSE', empresa: 'El hechizo', cargo: 'PANADERO' },
      { cedula: '10274099', nombre: 'GONZALEZ CAMACHO RAFAEL HUMBERTO', empresa: 'Café Cordillera', cargo: 'ADMINISTRADOR' },
      { cedula: '12283889', nombre: 'MORA YEVERINO CARLOS MANUEL', empresa: 'Café Cordillera', cargo: 'TORREFACTOR' },
      { cedula: '17096578', nombre: 'MONTILLA GONZALEZ DEIVIS JOSE', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '14551143', nombre: 'SEGOVIA BASTIDAS JUAN BAUTISTA', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '9611684', nombre: 'CAMACHO GIMENEZ JOSE ANTONIO', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '7355782', nombre: 'CONTRERAS CONTRERAS ANTONIO JOSE', empresa: 'Café Cordillera', cargo: 'CHOFER' },
      { cedula: '10553052', nombre: 'MARQUEZ PEREZ MIGUEL ANGEL', empresa: 'Café Cordillera', cargo: 'SUPERVISOR' },
      { cedula: '18309167', nombre: 'GONZALEZ CONTRERAS LUIS GERARDO', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '14551199', nombre: 'SEGOVIA BASTIDAS JOSE ANTONIO', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '10274108', nombre: 'GONZALEZ CAMACHO OLGA MARINA', empresa: 'Café Cordillera', cargo: 'ADMINISTRADOR' },
      { cedula: '7354982', nombre: 'GARCIA MEDINA JOSE FELIX', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '11282773', nombre: 'SALCEDO MORA JOSE ALBERTO', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '14551182', nombre: 'SEGOVIA BASTIDAS ANGEL BAUTISTA', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '17096559', nombre: 'MONTILLA GONZALEZ JHON CARLOS', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '9609836', nombre: 'CAMACHO SALCEDO JUAN DE DIOS', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '14551170', nombre: 'SEGOVIA BASTIDAS GUSTAVO ENRIQUE', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '11282798', nombre: 'SALCEDO MORA PEDRO ANTONIO', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '9609854', nombre: 'CAMACHO SALCEDO PEDRO ANTONIO', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '14100237', nombre: 'CONTRERAS REYES JOSE BAUDILIO', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '9611700', nombre: 'CAMACHO GIMENEZ BLANCA ROSA', empresa: 'Café Cordillera', cargo: 'ADMINISTRADOR' },
      { cedula: '14100225', nombre: 'CONTRERAS REYES EDGAR ANTONIO', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '10780861', nombre: 'PEREZ COLMENAREZ GUSTAVO ADOLFO', empresa: 'Café Cordillera', cargo: 'CHOFER' },
      { cedula: '6219267', nombre: 'BASTIDAS SOTO SANTOS ANTONIO', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '7359127', nombre: 'SALCEDO SALCEDO JOSE SILVINO', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '7357553', nombre: 'MARQUEZ MARQUEZ JOSE GREGORIO', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '13257364', nombre: 'BASTIDAS COLMENAREZ JOSE RUPERTO', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '10553062', nombre: 'MARQUEZ PEREZ JOSE ANTONIO', empresa: 'Café Cordillera', cargo: 'CHOFER' },
      { cedula: '12283906', nombre: 'MORA YEVERINO JOSE DARIO', empresa: 'Café Cordillera', cargo: 'TORREFACTOR' },
      { cedula: '16498808', nombre: 'SUAREZ ANGULO EDGAR JOSE', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '10274111', nombre: 'GONZALEZ CAMACHO PEDRO ANTONIO', empresa: 'Café Cordillera', cargo: 'CHOFER' },
      { cedula: '12520764', nombre: 'PEREZ PEREZ EDGAR ANTONIO', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '14100219', nombre: 'CONTRERAS REYES GUSTAVO JOSE', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '13257460', nombre: 'BASTIDAS COLMENAREZ PABLO JESUS', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '9644053', nombre: 'COLMENAREZ AVILA JORGE LUIS', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '7357566', nombre: 'MARQUEZ MARQUEZ JOSE AUGUSTO', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '19090311', nombre: 'PEREZ COLMENAREZ EDGAR ANTONIO', empresa: 'Café Cordillera', cargo: 'OPERARIO' },
      { cedula: '3271765', nombre: 'GIMENEZ ROMERO JOSE NICOLAS', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '3273513', nombre: 'GIMENEZ ROMERO JOSE ELPIDIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '5631419', nombre: 'RAMOS GARCIA ANDRES ANTONIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '5631421', nombre: 'RAMOS GARCIA JOSE NICOLAS', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '7386112', nombre: 'PEREZ BASTIDAS BLANCA ROSA', empresa: 'Agrícola León', cargo: 'ADMINISTRADOR' },
      { cedula: '9640745', nombre: 'PEREZ COLMENAREZ JOSE GREGORIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '9640752', nombre: 'PEREZ COLMENAREZ ERNESTO ANTONIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '10780869', nombre: 'PEREZ COLMENAREZ JOSE ARISTIDES', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '10780873', nombre: 'PEREZ COLMENAREZ JOSE ALEXANDER', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '16498814', nombre: 'SUAREZ ANGULO JOSE LINO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '7389055', nombre: 'SUAREZ BASTIDAS JOSE BERNARDO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '7387851', nombre: 'MUJICA MUJICA PEDRO ANGEL', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '9641563', nombre: 'MUJICA MUJICA EDGAR ANTONIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '11284754', nombre: 'RAMIREZ RUIZ JESUS AGUSTIN', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '7387862', nombre: 'MUJICA MUJICA JOSE GREGORIO2', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '9640768', nombre: 'PEREZ COLMENAREZ JOSE DARIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '9643571', nombre: 'BARRIOS MORA JESUS ANTONIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '9643609', nombre: 'CORDERO BASTIDAS PEDRO ANTONIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '11284748', nombre: 'RAMIREZ RUIZ JOSE SIMON', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '9640774', nombre: 'PEREZ COLMENAREZ JOSE NIEVES', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '11284742', nombre: 'RAMIREZ RUIZ GREGORIO ANTONIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '13775351', nombre: 'ACOSTA RIOS JOSE ANTONIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '12029618', nombre: 'BUJANDA COLMENAREZ TOMAS RAMON', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '12029638', nombre: 'BUJANDA COLMENAREZ JOSE RUPERTO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '9641557', nombre: 'MUJICA MUJICA JOSE BAUTISTA', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '9640762', nombre: 'PEREZ COLMENAREZ PEDRO MIGUEL', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '3271763', nombre: 'GIMENEZ ROMERO JOSE FRANCISCO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '9643621', nombre: 'CORDERO BASTIDAS JOSE ROSARIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '11284728', nombre: 'RAMIREZ RUIZ JOSE LIBORIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '7388030', nombre: 'GIMENEZ ROMERO PEDRO NOLASCO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '7387869', nombre: 'MUJICA MUJICA JOSE LEONIDAS', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '7388031', nombre: 'GIMENEZ ROMERO PEDRO CELESTINO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '5631418', nombre: 'RAMOS GARCIA GREGORIO ANTONIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '5631428', nombre: 'RAMOS GARCIA JOSE FELIX', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '12029631', nombre: 'BUJANDA COLMENAREZ EDGAR ANTONIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '14388642', nombre: 'LINARES MEDINA ENRIQUE ANTONIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '7387846', nombre: 'MUJICA MUJICA SANTOS ANTONIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '10836073', nombre: 'TORTOLERO PRADA PEDRO ANTONIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '9640741', nombre: 'PEREZ COLMENAREZ JOSE SANTOS', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '9641568', nombre: 'MUJICA MUJICA JOSE RODRIGO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '9626432', nombre: 'VALERA PEREZ JOSE ANTONIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '10780842', nombre: 'PEREZ COLMENAREZ JESUS ANTONIO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '9643629', nombre: 'CORDERO BASTIDAS JOSE DOLORES', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '9640736', nombre: 'PEREZ COLMENAREZ JOSE ADOLFO', empresa: 'Agrícola León', cargo: 'AGRICULTOR' },
      { cedula: '13261788', nombre: 'BUJANDA BUJANDA JOSE AUGUSTO', empresa: 'AJL', cargo: 'OPERARIO' },
      { cedula: '20940993', nombre: 'BUJANDA MUJICA JOSE MARIO', empresa: 'AJL', cargo: 'OPERARIO' },
      { cedula: '10836076', nombre: 'TORTOLERO PRADA JOSE ANTONIO', empresa: 'AJL', cargo: 'OPERARIO' },
      { cedula: '18619043', nombre: 'GONZALEZ CONTRERAS JESUS ADOLFO', empresa: 'AJL', cargo: 'OPERARIO' },
      { cedula: '9641574', nombre: 'MUJICA MUJICA JOSE NICANOR', empresa: 'AJL', cargo: 'OPERARIO' },
      { cedula: '15625435', nombre: 'AVILA SUAREZ EDGAR ALFREDO', empresa: 'AJL', cargo: 'OPERARIO' },
      { cedula: '9643601', nombre: 'CORDERO BASTIDAS HUGO ERNESTO', empresa: 'AJL', cargo: 'OPERARIO' },
      { cedula: '13257437', nombre: 'BASTIDAS COLMENAREZ LINO JOSE', empresa: 'AJL', cargo: 'OPERARIO' },
      { cedula: '23095399', nombre: 'BUJANDA MUJICA CARLOS JOSE', empresa: 'AJL', cargo: 'OPERARIO' },
      { cedula: '14099663', nombre: 'CONTRERAS REYES JOSE ANTONIO', empresa: 'AJL', cargo: 'OPERARIO' },
      { cedula: '15635267', nombre: 'DURAN DURAN VICTOR HUGO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '7359105', nombre: 'SALCEDO SALCEDO JOSE ANTONIO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '12283924', nombre: 'MORA YEVERINO PEDRO ANTONIO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '11282785', nombre: 'SALCEDO MORA JESUS ANTONIO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '19090304', nombre: 'PEREZ COLMENAREZ JOSE DOMINGO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '14551161', nombre: 'SEGOVIA BASTIDAS JOSE ANGEL', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '7354986', nombre: 'GARCIA MEDINA JESUS ANTONIO', empresa: 'Canaima', cargo: 'GERENTE' },
      { cedula: '14551158', nombre: 'SEGOVIA BASTIDAS EDGARDO ANTONIO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '12520754', nombre: 'PEREZ PEREZ JOSE ANTONIO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '9609866', nombre: 'CAMACHO SALCEDO JOSE ANTONIO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '7357557', nombre: 'MARQUEZ MARQUEZ JOSE FLORENCIO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '18619054', nombre: 'GONZALEZ CONTRERAS EDGAR JOSE', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '12520746', nombre: 'PEREZ PEREZ JESUS ANTONIO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '17096570', nombre: 'MONTILLA GONZALEZ JOSE ANTONIO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '12283915', nombre: 'MORA YEVERINO JESUS ANTONIO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '9611692', nombre: 'CAMACHO GIMENEZ PEDRO NOLASCO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '7359116', nombre: 'SALCEDO SALCEDO JOSE TOMAS', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '12283900', nombre: 'MORA YEVERINO JOSE NIEVES', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '10553043', nombre: 'MARQUEZ PEREZ EDGAR ANTONIO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '12520730', nombre: 'PEREZ PEREZ JOSE GREGORIO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '16498819', nombre: 'SUAREZ ANGULO CARLOS ALBERTO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '14551153', nombre: 'SEGOVIA BASTIDAS JUAN ANTONIO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '7357562', nombre: 'MARQUEZ MARQUEZ JOSE BAUTISTA', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '13257406', nombre: 'BASTIDAS COLMENAREZ JOSE LEONIDAS', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '14551192', nombre: 'SEGOVIA BASTIDAS CARLOS ENRIQUE', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '12283931', nombre: 'MORA YEVERINO JOSE NICANOR', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '10274124', nombre: 'GONZALEZ CAMACHO JOSE IGNACIO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '12520722', nombre: 'PEREZ PEREZ PEDRO ANTONIO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '16036302', nombre: 'SUAREZ BASTIDAS JOSE NIEVES', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '20267515', nombre: 'BUJANDA COLMENAREZ CARLOS JOSE', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '16036314', nombre: 'SUAREZ BASTIDAS JOSE RUPERTO', empresa: 'Canaima', cargo: 'OPERARIO' },
      { cedula: '7354988', nombre: 'GARCIA MEDINA CARLOS MANUEL', empresa: 'Cera Artística', cargo: 'OPERARIO' },
      { cedula: '10780876', nombre: 'PEREZ COLMENAREZ NORBERTO JOSE', empresa: 'Cera Artística', cargo: 'OPERARIO' },
      { cedula: '16036319', nombre: 'SUAREZ BASTIDAS JOSE TOMAS', empresa: 'Cera Artística', cargo: 'OPERARIO' },
      { cedula: '9640780', nombre: 'PEREZ COLMENAREZ JOSE AUGUSTO', empresa: 'Cera Artística', cargo: 'OPERARIO' },
      { cedula: '13261771', nombre: 'BUJANDA BUJANDA PEDRO JOSE', empresa: 'Cera Artística', cargo: 'OPERARIO' },
      { cedula: '12029620', nombre: 'BUJANDA COLMENAREZ JOSE ELPIDIO', empresa: 'Cera Artística', cargo: 'OPERARIO' },
      { cedula: '19090281', nombre: 'ALVARADO MARCANO JOSE GREGORIO', empresa: 'Dimza', cargo: 'OPERARIO' },
      { cedula: '9644015', nombre: 'COLMENAREZ AVILA JOSE AGUSTIN', empresa: 'Dimza', cargo: 'OPERARIO' },
      { cedula: '14388630', nombre: 'LINARES MEDINA EDGAR JOSE', empresa: 'Dimza', cargo: 'OPERARIO' },
      { cedula: '14290815', nombre: 'BASTIDAS COLMENAREZ EDGAR JOSE', empresa: 'Dimza', cargo: 'OPERARIO' },
      { cedula: '12520711', nombre: 'PEREZ PEREZ CARLOS JOSE', empresa: 'Dimza', cargo: 'OPERARIO' },
      { cedula: '11284732', nombre: 'RAMIREZ RUIZ CARLOS ADOLFO', empresa: 'Dimza', cargo: 'OPERARIO' },
      { cedula: '13775373', nombre: 'ACOSTA RIOS EDGAR JOSE', empresa: 'Dimza', cargo: 'OPERARIO' },
      { cedula: '14099686', nombre: 'CONTRERAS REYES JOSE BENIGNO', empresa: 'Dimza', cargo: 'OPERARIO' },
      { cedula: '13261782', nombre: 'BUJANDA BUJANDA JOSE FELIX', empresa: 'Dimza', cargo: 'OPERARIO' },
      { cedula: '17618896', nombre: 'PINTO RODRIGUEZ JESUS ANTONIO', empresa: 'Ecogerencia', cargo: 'OPERARIO' },
      { cedula: '17618877', nombre: 'PINTO RODRIGUEZ JOSE ANGEL', empresa: 'Ecogerencia', cargo: 'OPERARIO' },
      { cedula: '20462548', nombre: 'ARROYO PEREIRA EDGAR JOSE', empresa: 'Ecogerencia', cargo: 'OPERARIO' },
      { cedula: '24484717', nombre: 'MUJICA BUJANDA JOSE DARIO', empresa: 'Ecogerencia', cargo: 'OPERARIO' },
      { cedula: '20462556', nombre: 'ARROYO PEREIRA JOSE MARIO', empresa: 'Ecogerencia', cargo: 'OPERARIO' },
      { cedula: '11284710', nombre: 'RAMIREZ RUIZ JESUS ANTONIO', empresa: 'CAPMIL-FCMPE', cargo: 'OFICIAL' },
      { cedula: '16738233', nombre: 'SUAREZ ANGULO JOSE ANTONIO', empresa: 'CAPMIL-FCMPE', cargo: 'SOLDADO' },
      { cedula: '18308596', nombre: 'DIAZ CONTRERAS JOSE ANTONIO', empresa: 'CAPMIL-FCMPE', cargo: 'OFICIAL' },
      { cedula: '20940977', nombre: 'BUJANDA MUJICA JOSE NESTOR', empresa: 'CAPMIL-FCMPE', cargo: 'SOLDADO' },
      { cedula: '16812712', nombre: 'MOLINA LEAL EDGAR JOSE', empresa: 'CAPMIL-FCMPE', cargo: 'SOLDADO' },
      { cedula: '12520790', nombre: 'PEREZ PEREZ PEDRO JULIO', empresa: 'CAPMIL-FCMPE', cargo: 'SOLDADO' },
      { cedula: '13261762', nombre: 'BUJANDA BUJANDA TOMAS JOSE', empresa: 'CAPMIL-FCMPE', cargo: 'SOLDADO' },
      { cedula: '9644006', nombre: 'COLMENAREZ AVILA ANDRES ANTONIO', empresa: 'CAPMIL-FCMPE', cargo: 'OFICIAL' },
      { cedula: '17288861', nombre: 'MUJICA MUJICA JOSE BENIGNO', empresa: 'CAPMIL-FCMPE', cargo: 'SOLDADO' },
      { cedula: '14290792', nombre: 'BASTIDAS COLMENAREZ JOSE DOLORES', empresa: 'Fumigamos Lara', cargo: 'FUMIGADOR' },
      { cedula: '14290802', nombre: 'BASTIDAS COLMENAREZ LINO ADOLFO', empresa: 'Fumigamos Lara', cargo: 'FUMIGADOR' },
      { cedula: '10833574', nombre: 'COLMENAREZ AVILA EDGAR JOSE', empresa: 'Fumigamos Lara', cargo: 'FUMIGADOR' },
      { cedula: '15625421', nombre: 'AVILA SUAREZ JOSE TOMAS', empresa: 'Fumigamos Lara', cargo: 'FUMIGADOR' },
      { cedula: '12029607', nombre: 'BUJANDA COLMENAREZ ANGEL RAMON', empresa: 'Fumigamos Lara', cargo: 'FUMIGADOR' },
      { cedula: '14388621', nombre: 'LINARES MEDINA JOSE ANTONIO', empresa: 'Fumigamos Lara', cargo: 'FUMIGADOR' },
      { cedula: '12029614', nombre: 'BUJANDA COLMENAREZ JESUS ANTONIO', empresa: 'Fumigamos Lara', cargo: 'FUMIGADOR' },
      { cedula: '14388625', nombre: 'LINARES MEDINA JOSE DARIO', empresa: 'Fumigamos Lara', cargo: 'FUMIGADOR' },
      { cedula: '13775342', nombre: 'ACOSTA RIOS JOSE NIEVES', empresa: 'Fumigamos Lara', cargo: 'FUMIGADOR' },
      { cedula: '12029601', nombre: 'BUJANDA COLMENAREZ JOSE NIEVES', empresa: 'Fumigamos Lara', cargo: 'FUMIGADOR' },
      { cedula: '12029596', nombre: 'BUJANDA COLMENAREZ PEDRO RAMON', empresa: 'Fumigamos Lara', cargo: 'FUMIGADOR' },
      { cedula: '9644044', nombre: 'COLMENAREZ AVILA JOSE BAUDILIO', empresa: 'Funlemos', cargo: 'EDUCADOR' },
      { cedula: '10780854', nombre: 'PEREZ COLMENAREZ GILBERTO ANTONIO', empresa: 'Funlemos', cargo: 'EDUCADOR' },
      { cedula: '14388617', nombre: 'LINARES MEDINA JOSE SILVERIO', empresa: 'Funlemos', cargo: 'EDUCADOR' },
      { cedula: '15625418', nombre: 'AVILA SUAREZ JOSE RUPERTO', empresa: 'Funlemos', cargo: 'EDUCADOR' },
      { cedula: '14290827', nombre: 'BASTIDAS COLMENAREZ TOMAS ENRIQUE', empresa: 'Funlemos', cargo: 'EDUCADOR' },
      { cedula: '14290821', nombre: 'BASTIDAS COLMENAREZ JOSE AUGUSTO', empresa: 'Funlemos', cargo: 'EDUCADOR' },
      { cedula: '12029611', nombre: 'BUJANDA COLMENAREZ CARLOS ANTONIO', empresa: 'Funlemos', cargo: 'EDUCADOR' },
      { cedula: '12029609', nombre: 'BUJANDA COLMENAREZ JESUS RODRIGO', empresa: 'Funlemos', cargo: 'EDUCADOR' },
      { cedula: '13775366', nombre: 'ACOSTA RIOS JOSE SANTOS', empresa: 'Funlemos', cargo: 'EDUCADOR' },
      { cedula: '12520736', nombre: 'PEREZ PEREZ JOSE TOMAS', empresa: 'Funlemos', cargo: 'EDUCADOR' },
      { cedula: '9641544', nombre: 'MUJICA MUJICA JOSE DOMINGO', empresa: 'Funlemos', cargo: 'EDUCADOR' },
      { cedula: '10274090', nombre: 'GONZALEZ CAMACHO LUIS AUGUSTO', empresa: 'Ganchos Venezolanos', cargo: 'OPERARIO' },
      { cedula: '7355789', nombre: 'CONTRERAS CONTRERAS LUIS ISIDRO', empresa: 'Ganchos Venezolanos', cargo: 'OPERARIO' },
      { cedula: '10553072', nombre: 'MARQUEZ PEREZ JOSE DARIO', empresa: 'Ganchos Venezolanos', cargo: 'OPERARIO' },
      { cedula: '10780849', nombre: 'PEREZ COLMENAREZ JUAN DE DIOS', empresa: 'Ganchos Venezolanos', cargo: 'OPERARIO' },
      { cedula: '13257431', nombre: 'BASTIDAS COLMENAREZ JOSE GABRIEL', empresa: 'Ganchos Venezolanos', cargo: 'OPERARIO' },
      { cedula: '11282792', nombre: 'SALCEDO MORA JOSE AUGUSTO', empresa: 'Ganchos Venezolanos', cargo: 'OPERARIO' },
      { cedula: '12520774', nombre: 'PEREZ PEREZ JOSE DOLORES', empresa: 'Ganchos Venezolanos', cargo: 'OPERARIO' },
      { cedula: '11282780', nombre: 'SALCEDO MORA CARLOS ANTONIO', empresa: 'Ganchos Venezolanos', cargo: 'OPERARIO' },
      { cedula: '6219274', nombre: 'BASTIDAS SOTO JOSE ANDRES', empresa: 'Ganchos Venezolanos', cargo: 'OPERARIO' },
      { cedula: '6219282', nombre: 'BASTIDAS SOTO SANTOS BENIGNO', empresa: 'Ganchos Venezolanos', cargo: 'OPERARIO' },
      { cedula: '12520783', nombre: 'PEREZ PEREZ JOSE SANTOS', empresa: 'Ganchos Venezolanos', cargo: 'OPERARIO' },
      { cedula: '7354978', nombre: 'GARCIA MEDINA JOSE ANTONIO', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '10274130', nombre: 'GONZALEZ CAMACHO ANGEL ANTONIO', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '13257395', nombre: 'BASTIDAS COLMENAREZ JOSE TOMAS', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '7359121', nombre: 'SALCEDO SALCEDO JOSE AUGUSTO', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '9609874', nombre: 'CAMACHO SALCEDO EDGAR JOSE', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '9609880', nombre: 'CAMACHO SALCEDO ANDRES ANTONIO', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '12283861', nombre: 'MORA YEVERINO EDGAR JOSE', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '9611709', nombre: 'CAMACHO GIMENEZ CARLOS ANTONIO', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '16036309', nombre: 'SUAREZ BASTIDAS JOSE RUPERTO', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '12283873', nombre: 'MORA YEVERINO JOSE AUGUSTO', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '12283882', nombre: 'MORA YEVERINO JOSE TOMAS', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '9611717', nombre: 'CAMACHO GIMENEZ FELIX ANTONIO', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '7359111', nombre: 'SALCEDO SALCEDO JOSE BAUTISTA', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '10274135', nombre: 'GONZALEZ CAMACHO JOSE AURELIO', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '17096551', nombre: 'MONTILLA GONZALEZ EDGAR ANTONIO', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '19090290', nombre: 'ALVARADO MARCANO PEDRO JOSE', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '14551136', nombre: 'SEGOVIA BASTIDAS EDGAR JOSE', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '10553082', nombre: 'MARQUEZ PEREZ CARLOS MANUEL', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '7355796', nombre: 'CONTRERAS CONTRERAS FELIX ANTONIO', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '14551128', nombre: 'SEGOVIA BASTIDAS JOSE ANTONIO', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '16498826', nombre: 'SUAREZ ANGULO EDGAR JOSE', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '7357570', nombre: 'MARQUEZ MARQUEZ CARLOS ANTONIO', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '12283893', nombre: 'MORA YEVERINO JOSE BAUTISTA', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '9611726', nombre: 'CAMACHO GIMENEZ HECTOR ANTONIO', empresa: 'INVITREL', cargo: 'OPERARIO' },
      { cedula: '14551119', nombre: 'SEGOVIA BASTIDAS PEDRO ANTONIO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '10274117', nombre: 'GONZALEZ CAMACHO CARLOS JOSE', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '12283853', nombre: 'MORA YEVERINO CARLOS ANTONIO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '7354964', nombre: 'GARCIA MEDINA PEDRO ANTONIO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '7357547', nombre: 'MARQUEZ MARQUEZ JOSE ANTONIO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '7359101', nombre: 'SALCEDO SALCEDO ANDRES ANTONIO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '10553033', nombre: 'MARQUEZ PEREZ ANDRES ANTONIO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '9609823', nombre: 'CAMACHO SALCEDO ANDRES AGUSTIN', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '7355775', nombre: 'CONTRERAS CONTRERAS JOSE GREGORIO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '6219259', nombre: 'BASTIDAS SOTO JOSE AURELIO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '9609831', nombre: 'CAMACHO SALCEDO TOMAS ANTONIO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '10274082', nombre: 'GONZALEZ CAMACHO JOSE VICTOR', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '9611675', nombre: 'CAMACHO GIMENEZ JOSE TOMAS', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '7354972', nombre: 'GARCIA MEDINA JOSE DOLORES', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '7354976', nombre: 'GARCIA MEDINA JOSE BERNARDINO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '12283846', nombre: 'MORA YEVERINO JOSE DOLORES', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '17096543', nombre: 'MONTILLA GONZALEZ CARLOS ANTONIO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '12520695', nombre: 'PEREZ PEREZ JOSE NICANOR', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '9609843', nombre: 'CAMACHO SALCEDO JOSE NIEVES', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '10274076', nombre: 'GONZALEZ CAMACHO ANDRES ANTONIO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '9611668', nombre: 'CAMACHO GIMENEZ JOSE DOMINGO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '16498832', nombre: 'SUAREZ ANGULO JOSE NIEVES', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '7357540', nombre: 'MARQUEZ MARQUEZ ANDRES ANTONIO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '7359097', nombre: 'SALCEDO SALCEDO JOSE GREGORIO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '12283841', nombre: 'MORA YEVERINO JOSE NICOLAS', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '7355769', nombre: 'CONTRERAS CONTRERAS JOSE TOMAS', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '10553020', nombre: 'MARQUEZ PEREZ JOSE SANTOS', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '14551110', nombre: 'SEGOVIA BASTIDAS JOSE BERNARDO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '9609814', nombre: 'CAMACHO SALCEDO JESUS ANTONIO', empresa: 'Larense de Alimentos', cargo: 'OPERARIO' },
      { cedula: '16498838', nombre: 'SUAREZ ANGULO EDGAR ANTONIO', empresa: 'Margana', cargo: 'OPERARIO' },
      { cedula: '18309168', nombre: 'GONZALEZ CONTRERAS JOSE ANGEL', empresa: 'Margana', cargo: 'OPERARIO' },
      { cedula: '20940970', nombre: 'BUJANDA MUJICA EDGAR ANTONIO', empresa: 'Margana', cargo: 'OPERARIO' },
      { cedula: '16812704', nombre: 'MOLINA LEAL JOSE ANTONIO', empresa: 'Margana', cargo: 'OPERARIO' },
      { cedula: '19090257', nombre: 'ALVARADO MARCANO EDGAR JOSE', empresa: 'Margana', cargo: 'OPERARIO' },
      { cedula: '18308589', nombre: 'DIAZ CONTRERAS EDGAR JOSE', empresa: 'Margana', cargo: 'OPERARIO' },
      { cedula: '17288853', nombre: 'MUJICA MUJICA JOSE FELIX', empresa: 'Margana', cargo: 'OPERARIO' },
      { cedula: '17618869', nombre: 'PINTO RODRIGUEZ CARLOS JOSE', empresa: 'Margana', cargo: 'OPERARIO' },
      { cedula: '16738225', nombre: 'SUAREZ ANGULO JESUS ANTONIO', empresa: 'Margana', cargo: 'OPERARIO' },
      { cedula: '17618861', nombre: 'PINTO RODRIGUEZ JOSE TOMAS', empresa: 'Margana', cargo: 'OPERARIO' },
      { cedula: '22145425', nombre: 'BUJANDA PEREZ EDGAR JOSE', empresa: 'Margana', cargo: 'OPERARIO' },
      { cedula: '13775381', nombre: 'ACOSTA RIOS JOSE RUPERTO', empresa: 'Polyplast', cargo: 'OPERARIO' },
      { cedula: '16036331', nombre: 'SUAREZ BASTIDAS JOSE DOLORES', empresa: 'Polyplast', cargo: 'OPERARIO' },
      { cedula: '13261795', nombre: 'BUJANDA BUJANDA JOSE RUPERTO', empresa: 'Polyplast', cargo: 'OPERARIO' },
      { cedula: '20267518', nombre: 'BUJANDA COLMENAREZ JOSE NIEVES', empresa: 'Polyplast', cargo: 'OPERARIO' },
      { cedula: '13775389', nombre: 'ACOSTA RIOS JOSE DOLORES', empresa: 'Prosfiga', cargo: 'OPERARIO' },
      { cedula: '20463553', nombre: 'ARROYO PEREIRA JOSE NIEVES', empresa: 'Prosfiga', cargo: 'OPERARIO' },
      { cedula: '24484726', nombre: 'MUJICA BUJANDA JOSE MARIO', empresa: 'Prosfiga', cargo: 'OPERARIO' },
      { cedula: '22145440', nombre: 'BUJANDA PEREZ JOSE ANGEL', empresa: 'Prosfiga', cargo: 'OPERARIO' },
      { cedula: '23095407', nombre: 'BUJANDA MUJICA JOSE DOLORES', empresa: 'Prosfiga', cargo: 'OPERARIO' },
      { cedula: '16738241', nombre: 'SUAREZ ANGULO CARLOS ANTONIO', empresa: 'Sugeven', cargo: 'OPERARIO' },
      { cedula: '18308604', nombre: 'DIAZ CONTRERAS JESUS ADOLFO', empresa: 'Sugeven', cargo: 'OPERARIO' },
      { cedula: '20940962', nombre: 'BUJANDA MUJICA JOSE NIEVES', empresa: 'Sugeven', cargo: 'OPERARIO' },
      { cedula: '16812716', nombre: 'MOLINA LEAL JESUS ANTONIO', empresa: 'Sugeven', cargo: 'OPERARIO' },
      { cedula: '20940954', nombre: 'BUJANDA MUJICA JOSE DOLORES', empresa: 'Sugeven', cargo: 'OPERARIO' },
      { cedula: '19090276', nombre: 'ALVARADO MARCANO JOSE TOMAS', empresa: 'Sugeven', cargo: 'OPERARIO' },
      { cedula: '18619031', nombre: 'GONZALEZ CONTRERAS JOSE ANTONIO', empresa: 'Sugeven', cargo: 'OPERARIO' },
      { cedula: '17288845', nombre: 'MUJICA MUJICA JOSE NIEVES', empresa: 'Sugeven', cargo: 'OPERARIO' },
      { cedula: '17288869', nombre: 'MUJICA MUJICA JOSE DARIO', empresa: 'Sugeven', cargo: 'OPERARIO' },
      { cedula: '17618853', nombre: 'PINTO RODRIGUEZ JOSE JESUS', empresa: 'Sugeven', cargo: 'OPERARIO' },
      { cedula: '22145418', nombre: 'BUJANDA PEREZ JOSE NIEVES', empresa: 'Sugeven', cargo: 'OPERARIO' },
      { cedula: '16738217', nombre: 'SUAREZ ANGULO JOSE ANGEL', empresa: 'Servicompresores', cargo: 'MECANICO' },
      { cedula: '18309171', nombre: 'GONZALEZ CONTRERAS JOSE DOMINGO', empresa: 'Servicompresores', cargo: 'MECANICO' },
      { cedula: '20940946', nombre: 'BUJANDA MUJICA JOSE SANTOS', empresa: 'Servicompresores', cargo: 'MECANICO' },
      { cedula: '16812708', nombre: 'MOLINA LEAL CARLOS JOSE', empresa: 'Servicompresores', cargo: 'MECANICO' },
      { cedula: '19090263', nombre: 'ALVARADO MARCANO JOSE BERNARDO', empresa: 'Servicompresores', cargo: 'MECANICO' },
      { cedula: '18308592', nombre: 'DIAZ CONTRERAS CARLOS ANTONIO', empresa: 'Servicompresores', cargo: 'MECANICO' },
      { cedula: '17288837', nombre: 'MUJICA MUJICA JOSE DOMINGO', empresa: 'Servicompresores', cargo: 'MECANICO' },
      { cedula: '17618845', nombre: 'PINTO RODRIGUEZ JOSE ANGEL', empresa: 'Servicompresores', cargo: 'MECANICO' },
      { cedula: '16738209', nombre: 'SUAREZ ANGULO JOSE TOMAS', empresa: 'Servicompresores', cargo: 'MECANICO' },
      { cedula: '22145411', nombre: 'BUJANDA PEREZ CARLOS JOSE', empresa: 'Servicompresores', cargo: 'MECANICO' },
      { cedula: '13775397', nombre: 'ACOSTA RIOS JOSE TOMAS', empresa: 'Taelinca', cargo: 'OPERARIO' },
      { cedula: '16036335', nombre: 'SUAREZ BASTIDAS EDGAR ANTONIO', empresa: 'Taelinca', cargo: 'OPERARIO' },
      { cedula: '13261801', nombre: 'BUJANDA BUJANDA JOSE DOLORES', empresa: 'Taelinca', cargo: 'OPERARIO' },
      { cedula: '20267527', nombre: 'BUJANDA COLMENAREZ JOSE SANTOS', empresa: 'Taelinca', cargo: 'OPERARIO' },
      { cedula: '13775405', nombre: 'ACOSTA RIOS JOSE DOLORES', empresa: 'Taelinca', cargo: 'OPERARIO' },
      { cedula: '16036342', nombre: 'SUAREZ BASTIDAS JOSE AUGUSTO', empresa: 'Taelinca', cargo: 'OPERARIO' },
      { cedula: '13261808', nombre: 'BUJANDA BUJANDA EDGAR JOSE', empresa: 'Taelinca', cargo: 'OPERARIO' },
      { cedula: '20267531', nombre: 'BUJANDA COLMENAREZ EDGAR JOSE', empresa: 'Taelinca', cargo: 'OPERARIO' },
      { cedula: '17618839', nombre: 'PINTO RODRIGUEZ EDGAR ANTONIO', empresa: 'Venfood', cargo: 'OPERARIO' },
      { cedula: '18619025', nombre: 'GONZALEZ CONTRERAS EDGAR ANTONIO', empresa: 'Venfood', cargo: 'OPERARIO' },
      { cedula: '20940938', nombre: 'BUJANDA MUJICA PEDRO ANTONIO', empresa: 'Venfood', cargo: 'OPERARIO' },
      { cedula: '16812700', nombre: 'MOLINA LEAL JOSE ANGEL', empresa: 'Venfood', cargo: 'OPERARIO' },
      { cedula: '19090250', nombre: 'ALVARADO MARCANO JOSE ANGEL', empresa: 'Venfood', cargo: 'OPERARIO' },
      { cedula: '18308586', nombre: 'DIAZ CONTRERAS JOSE ANGEL', empresa: 'Venfood', cargo: 'OPERARIO' },
      { cedula: '17288829', nombre: 'MUJICA MUJICA JOSE TOMAS', empresa: 'Venfood', cargo: 'OPERARIO' },
      { cedula: '22145404', nombre: 'BUJANDA PEREZ JOSE TOMAS', empresa: 'Venfood', cargo: 'OPERARIO' },
      { cedula: '16738201', nombre: 'SUAREZ ANGULO JOSE DARIO', empresa: 'Venfood', cargo: 'OPERARIO' },
      { cedula: '23095379', nombre: 'BUJANDA MUJICA EDGAR JOSE', empresa: 'Zootek', cargo: 'VETERINARIO' },
      { cedula: '25254040', nombre: 'BUJANDA PEREZ EDGAR ANTONIO', empresa: 'Zootek', cargo: 'VETERINARIO' },
      { cedula: '24484708', nombre: 'MUJICA BUJANDA EDGAR JOSE', empresa: 'Zootek', cargo: 'VETERINARIO' },
      { cedula: '22145396', nombre: 'BUJANDA PEREZ PEDRO JOSE', empresa: 'Zootek', cargo: 'VETERINARIO' },
      { cedula: '23095371', nombre: 'BUJANDA MUJICA JOSE TOMAS', empresa: 'Zootek', cargo: 'VETERINARIO' },
      { cedula: '25254033', nombre: 'BUJANDA PEREZ JOSE AUGUSTO', empresa: 'Zootek', cargo: 'VETERINARIO' },
      { cedula: '24484700', nombre: 'MUJICA BUJANDA JOSE NICANOR', empresa: 'Zootek', cargo: 'VETERINARIO' },
      { cedula: '22145389', nombre: 'BUJANDA PEREZ JOSE DOLORES', empresa: 'Zootek', cargo: 'VETERINARIO' },
      { cedula: '23095363', nombre: 'BUJANDA MUJICA JOSE ANGEL', empresa: 'Zootek', cargo: 'VETERINARIO' },
      { cedula: '25254027', nombre: 'BUJANDA PEREZ JOSE SANTOS', empresa: 'Zootek', cargo: 'VETERINARIO' },
      { cedula: '19090297', nombre: 'ALVARADO MARCANO OSCAR JOSE', empresa: 'Megasuspensiones', cargo: 'MECANICO' },
      { cedula: '18309174', nombre: 'GONZALEZ CONTRERAS CARLOS ALBERTO', empresa: 'Megasuspensiones', cargo: 'MECANICO' },
      { cedula: '20940930', nombre: 'BUJANDA MUJICA JOSE ANGEL', empresa: 'Megasuspensiones', cargo: 'MECANICO' },
      { cedula: '16812724', nombre: 'MOLINA LEAL EDGAR ANTONIO', empresa: 'Megasuspensiones', cargo: 'MECANICO' },
      { cedula: '18308616', nombre: 'DIAZ CONTRERAS JOSE RUPERTO', empresa: 'Megasuspensiones', cargo: 'MECANICO' },
      { cedula: '17288877', nombre: 'MUJICA MUJICA EDGAR ANTONIO', empresa: 'Megasuspensiones', cargo: 'MECANICO' },
      { cedula: '17618913', nombre: 'PINTO RODRIGUEZ EDGAR JOSE', empresa: 'Megasuspensiones', cargo: 'MECANICO' },
      { cedula: '16738249', nombre: 'SUAREZ ANGULO EDGAR ANTONIO', empresa: 'Megasuspensiones', cargo: 'MECANICO' },
      { cedula: '22145447', nombre: 'BUJANDA PEREZ EDGAR ANTONIO', empresa: 'Megasuspensiones', cargo: 'MECANICO' },
      { cedula: '20940922', nombre: 'BUJANDA MUJICA JOSE RUPERTO', empresa: 'Concaribe', cargo: 'OPERARIO' },
      { cedula: '16812728', nombre: 'MOLINA LEAL CARLOS ENRIQUE', empresa: 'Concaribe', cargo: 'OPERARIO' },
      { cedula: '19090317', nombre: 'PEREZ COLMENAREZ EDGAR JOSE', empresa: 'Concaribe', cargo: 'OPERARIO' },
      { cedula: '18308620', nombre: 'DIAZ CONTRERAS JOSE SANTOS', empresa: 'Concaribe', cargo: 'OPERARIO' },
      { cedula: '17288892', nombre: 'MUJICA MUJICA EDGAR JOSE', empresa: 'Concaribe', cargo: 'OPERARIO' },
      { cedula: '17618920', nombre: 'PINTO RODRIGUEZ JOSE SANTOS', empresa: 'Concaribe', cargo: 'OPERARIO' },
      { cedula: '16738253', nombre: 'SUAREZ ANGULO JOSE SANTOS', empresa: 'Concaribe', cargo: 'OPERARIO' },
      { cedula: '22145453', nombre: 'BUJANDA PEREZ JOSE SANTOS', empresa: 'Concaribe', cargo: 'OPERARIO' },
      { cedula: '23095415', nombre: 'BUJANDA MUJICA JOSE SANTOS', empresa: 'Concaribe', cargo: 'OPERARIO' },
      { cedula: '18619061', nombre: 'GONZALEZ CONTRERAS JOSE RUPERTO', empresa: 'Concaribe', cargo: 'OPERARIO' },
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
          .where(and(eq(positions.companyId, companyId), eq(positions.name, cargo)))
          .limit(1);
        let posId: string;
        if (existing.length > 0) {
          posId = existing[0].id;
        } else {
          const [ins] = await db.insert(positions).values({ name: cargo, companyId }).returning({ id: positions.id });
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
      const positionId = positionIdMap.get(`${companyId}::${w.cargo.toUpperCase()}`);
      const nameParts = w.nombre.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;
      const result = await db
        .insert(patients)
        .values({ cedula: w.cedula, firstName, lastName, companyId, positionId })
        .onConflictDoNothing({ target: patients.cedula });
      if ((result.rowCount ?? 0) > 0) {
        insertedCount++;
      } else {
        skippedCount++;
      }
    }
    console.log(`  ✓ Pacientes insertados: ${insertedCount}, omitidos (duplicados): ${skippedCount}`);
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
