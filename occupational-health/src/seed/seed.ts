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
import { bodySystems } from '../body-systems/body-systems.schema';
import { diseaseCategories } from '../disease-categories/disease-categories.schema';
import { diseases } from '../diseases/diseases.schema';

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

  // Crear categorías de enfermedades (capítulos CIE-10)
  console.log('\n📂 Creando categorías de enfermedades (CIE-10)...');
  const DISEASE_CATEGORIES_DATA = [
    { name: 'Enfermedades Infecciosas y Parasitarias' },
    { name: 'Neoplasias' },
    { name: 'Enfermedades de la Sangre y Órganos Hematopoyéticos' },
    { name: 'Enfermedades Endocrinas, Nutricionales y Metabólicas' },
    { name: 'Trastornos Mentales y del Comportamiento' },
    { name: 'Enfermedades del Sistema Nervioso' },
    { name: 'Enfermedades del Ojo y sus Anexos' },
    { name: 'Enfermedades del Oído' },
    { name: 'Enfermedades del Aparato Circulatorio' },
    { name: 'Enfermedades del Aparato Respiratorio' },
    { name: 'Enfermedades del Aparato Digestivo' },
    { name: 'Enfermedades de la Piel y Tejido Subcutáneo' },
    { name: 'Enfermedades del Sistema Musculoesquelético y Tejido Conjuntivo' },
    { name: 'Enfermedades del Aparato Genitourinario' },
    { name: 'Embarazo, Parto y Puerperio' },
    { name: 'Malformaciones Congénitas y Anomalías Cromosómicas' },
    { name: 'Traumatismos, Envenenamientos y Causas Externas' },
    { name: 'Factores que Influyen en el Estado de Salud' },
    { name: 'Síntomas, Signos y Hallazgos Anormales' },
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
