/**
 * Test seed: crea empresa → cargo → paciente → solicitud → consulta → examen físico
 * Ejecutar con: npx ts-node -r tsconfig-paths/register src/seed/test-consultation.seed.ts
 */
import axios from 'axios';

const BASE = 'http://localhost:3000';
const api = axios.create({ baseURL: BASE, validateStatus: () => true });

function log(label: string, data: unknown) {
  console.log(`\n✅ ${label}:`, JSON.stringify(data, null, 2));
}

function fail(label: string, res: { status: number; data: unknown }) {
  console.error(
    `\n❌ ${label} [${res.status}]:`,
    JSON.stringify(res.data, null, 2),
  );
  process.exit(1);
}

async function run() {
  console.log('🚀 Iniciando test de flujo completo de consulta...\n');
  const ts = Date.now().toString().slice(-6);

  // 1. Crear empresa
  const companyRes = await api.post('/companies', {
    name: `TechVenezuela C.A. ${ts}`,
    address: 'Av. Principal, Caracas',
    rif: `J-3009${ts}-0`,
    contact: '0212-5551234',
  });
  if (companyRes.status !== 201) fail('Crear empresa', companyRes);
  const company = companyRes.data.company;
  log('Empresa creada', { id: company.id, name: company.name });

  // 2. Crear cargo
  const positionRes = await api.post('/positions', {
    name: 'Enfermera Jefe',
    description: 'Responsable del área de enfermería',
    companyId: company.id,
  });
  if (positionRes.status !== 201) fail('Crear cargo', positionRes);
  const position = positionRes.data.position;
  log('Cargo creado', { id: position.id, name: position.name });

  // 3. Crear paciente
  const patientRes = await api.post('/patients', {
    cedula: `V-${ts}00`,
    firstName: 'Ana',
    lastName: 'Gómez',
    birthDate: '1990-05-15',
    email: 'ana.gomez@test.com',
    bloodType: 'O+',
    dominantHand: 'right',
    usesGlasses: false,
    companyId: company.id,
    positionId: position.id,
    emergencyContact: {
      name: 'Carlos Gómez',
      phone: '0414-5551234',
      relationship: 'Esposo',
    },
  });
  if (patientRes.status !== 201) fail('Crear paciente', patientRes);
  const patient = patientRes.data.patient;
  log('Paciente creado', {
    cedula: patient.cedula,
    name: `${patient.firstName} ${patient.lastName}`,
  });

  // 4. Crear solicitud
  const requestRes = await api.post('/requests', {
    requestDate: new Date().toISOString().split('T')[0],
    evaluationReason: 'Pre-empleo',
    patientId: patient.cedula,
  });
  if (requestRes.status !== 201) fail('Crear solicitud', requestRes);
  const request = requestRes.data.request;
  log('Solicitud creada', {
    id: request.id,
    reason: request.evaluationReason,
    status: request.status,
  });

  // 5. Actualizar solicitud a "En Proceso"
  const updReqRes = await api.patch(`/requests/${request.id}`, {
    status: 'En Proceso',
  });
  if (updReqRes.status !== 200) fail('Actualizar solicitud', updReqRes);
  log('Solicitud → En Proceso', { status: updReqRes.data.request.status });

  // 6. Crear consulta
  const consultationRes = await api.post('/consultations', {
    requestId: request.id,
    type: 'Medica',
    currentTreatment: 'Ninguno',
  });
  if (consultationRes.status !== 201) fail('Crear consulta', consultationRes);
  const consultation = consultationRes.data.consultation;
  log('Consulta creada', { id: consultation.id, type: consultation.type });

  // 7. Crear examen físico
  const physExamRes = await api.post('/physical-exams', {
    consultationId: consultation.id,
    systolicPressure: 120,
    diastolicPressure: 80,
    heartRate: 72,
    weight: 65,
    height: 165,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    notes: 'Examen físico inicial - paciente en buen estado general',
  });
  if (physExamRes.status !== 201) fail('Crear examen físico', physExamRes);
  log('Examen físico creado', physExamRes.data.physicalExam);

  // 8. Actualizar consulta con resultado
  const updConsultRes = await api.patch(`/consultations/${consultation.id}`, {
    consultationResult: 'Apto',
    diagnosisDescription: 'Paciente en óptimas condiciones para el cargo.',
    recommendations: {
      suggestedPPE: 'Guantes de nitrilo, mascarilla N95',
      medicalAdequacyMeasures: 'Seguimiento semestral',
    },
    observations: {
      medica: 'Paciente colaboradora y sin antecedentes relevantes.',
    },
  });
  if (updConsultRes.status !== 200) fail('Actualizar consulta', updConsultRes);
  log('Consulta actualizada', {
    result: updConsultRes.data.consultation.consultationResult,
  });

  console.log('\n🎉 Flujo completo ejecutado exitosamente.');
  console.log(`\n📋 IDs para pruebas:`);
  console.log(`   Empresa:    ${company.id}`);
  console.log(`   Cargo:      ${position.id}`);
  console.log(`   Paciente:   ${patient.cedula}`);
  console.log(`   Solicitud:  ${request.id}`);
  console.log(`   Consulta:   ${consultation.id}`);
  console.log(
    `\n🔗 Atender consulta: http://localhost:5173/consultas/${consultation.id}/atender`,
  );
}

run().catch((err) => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
