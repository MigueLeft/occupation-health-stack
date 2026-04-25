import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, CircularProgress, Paper, TextField } from '@mui/material';
import { SaveOutlined } from '@mui/icons-material';
import { useParams, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { AppLayout } from '@/components/AppLayout';
import { useAttendConsultation } from '@/features/consultations/hooks/useAttendConsultation';
import { useExams } from '@/features/catalogs/hooks/useExams';
import { useDiseases } from '@/features/catalogs/hooks/useDiseases';
import { useDiseaseCategories } from '@/features/catalogs/hooks/useDiseaseCategories';
import { useBodySystems } from '@/features/catalogs/hooks/useBodySystems';
import { usePsychometricTests as usePsychometricCatalog } from '@/features/catalogs/hooks/usePsychometricTests';
import { useAllergies } from '@/features/catalogs/hooks/useAllergies';
import { useUsers } from '@/features/users/hooks/useUsers';
import { useAuth } from '@/features/auth';
import { consultationsService } from '@/features/consultations/services/consultations.service';
import { physicalExamService, diagnosticsService, examResultsService, psychometricTestsService } from '@/features/consultations/services/sub-entities.service';
import { patientsService } from '@/features/patients/services/patients.service';
import { PatientInfoBar } from '@/features/consultations/components/attend/PatientInfoBar';
import { PhysicalExamSection } from '@/features/consultations/components/attend/PhysicalExamSection';
import { DiagnosticSection } from '@/features/consultations/components/attend/DiagnosticSection';
import { ExamResultsSection } from '@/features/consultations/components/attend/ExamResultsSection';
import { PsicologicaSection } from '@/features/consultations/components/attend/PsicologicaSection';
import { ChronicDiseasesSection } from '@/features/consultations/components/attend/ChronicDiseasesSection';
import { PatientInitialDataSection } from '@/features/consultations/components/attend/PatientInitialDataSection';
import { AttendedBySection } from '@/features/consultations/components/attend/AttendedBySection';
import type { PhysicalExamPayload } from '@/features/consultations/services/sub-entities.service';
import type { ConsultationResult, PsychologicalResult } from '@/features/consultations/types';

export function AttendConsultationPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data, isLoading, refetch } = useAttendConsultation(id);

  const [activeTab, setActiveTab] = useState<'medica' | 'psicologica'>('medica');
  const [isSaving, setIsSaving] = useState(false);
  const [treatment, setTreatment] = useState('');
  const [physExam, setPhysExam] = useState<PhysicalExamPayload>({});
  const [consultResult, setConsultResult] = useState<ConsultationResult | ''>('');
  const [diagDescription, setDiagDescription] = useState('');
  const [recommendations, setRecommendations] = useState({ suggestedPPE: '', medicalAdequacyMeasures: '', psychologicalAdequacyMeasures: '' });
  const [medObservations, setMedObservations] = useState('');
  const [psychResult, setPsychResult] = useState<PsychologicalResult | ''>('');
  const [interviewDone, setInterviewDone] = useState(false);
  const [psychObservations, setPsychObservations] = useState('');
  const [medicalAttendedById, setMedicalAttendedById] = useState('');
  const [psychologicalAttendedById, setPsychologicalAttendedById] = useState('');
  const [initialized, setInitialized] = useState(false);

  const { data: exams = [] } = useExams();
  const { data: diseases = [] } = useDiseases();
  const { data: categories = [] } = useDiseaseCategories();
  const { data: bodySystems = [] } = useBodySystems();
  const { data: psychCatalog = [] } = usePsychometricCatalog();
  const { data: allergies = [] } = useAllergies();
  const { data: users = [] } = useUsers();

  // Auto-register system attended by on first open
  useEffect(() => {
    if (data && !data.systemAttendedById && currentUser?.id) {
      consultationsService.update(id, { systemAttendedById: currentUser.id }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, currentUser?.id]);

  if (data && !initialized) {
    setConsultResult((data.consultationResult ?? '') as ConsultationResult | '');
    setPsychResult((data.psychologicalResult ?? '') as PsychologicalResult | '');
    setInterviewDone(data.interviewConducted ?? false);
    setMedicalAttendedById(data.medicalAttendedById ?? '');
    setPsychologicalAttendedById(data.psychologicalAttendedById ?? '');
    setInitialized(true);
  }

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);
    try {
      await consultationsService.update(id, {
        currentTreatment: treatment || undefined,
        consultationResult: consultResult || undefined,
        psychologicalResult: psychResult || undefined,
        diagnosisDescription: diagDescription || undefined,
        recommendations: { suggestedPPE: recommendations.suggestedPPE || undefined, medicalAdequacyMeasures: recommendations.medicalAdequacyMeasures || undefined, psychologicalAdequacyMeasures: recommendations.psychologicalAdequacyMeasures || undefined },
        interviewConducted: interviewDone,
        observations: { medica: medObservations || undefined, psicologica: psychObservations || undefined },
        medicalAttendedById: medicalAttendedById || undefined,
        psychologicalAttendedById: psychologicalAttendedById || undefined,
      });
      if (data.physicalExam) {
        await physicalExamService.update(data.physicalExam.id, physExam);
      } else if (Object.values(physExam).some(Boolean)) {
        await physicalExamService.create({ ...physExam, consultationId: id, id: '' });
      }
      toast.success('Consulta guardada exitosamente.');
      refetch();
    } catch {
      toast.error('Error al guardar la consulta');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddChronicDisease = async (diseaseId: string) => {
    if (!data) return;
    const current = data.patientDiseases.map((d) => d.id);
    await patientsService.update(data.patientId, { diseaseIds: [...current, diseaseId] });
    refetch();
  };

  const handleRemoveChronicDisease = async (diseaseId: string) => {
    if (!data) return;
    const updated = data.patientDiseases.filter((d) => d.id !== diseaseId).map((d) => d.id);
    await patientsService.update(data.patientId, { diseaseIds: updated });
    refetch();
  };

  const handleSavePatientInitialData = async (patch: { bloodType?: string; dominantHand?: string; usesGlasses?: boolean; allergyIds?: string[] }) => {
    if (!data) return;
    await patientsService.update(data.patientId, patch);
    refetch();
  };

  const systemAttendedByName = users.find((u) => u.id === data?.systemAttendedById)?.name;

  if (isLoading || !data) {
    return <AppLayout><Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box></AppLayout>;
  }

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ px: 4, pt: 2.5, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate({ to: '/consultas' })}>Consultas</Typography>
            <Typography variant="body2" color="text.secondary">›</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Atender Consulta</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="outlined" onClick={() => navigate({ to: '/consultas' })}>Cancelar</Button>
            <Button variant="contained" startIcon={<SaveOutlined />} onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Consulta'}
            </Button>
          </Box>
        </Box>

        <PatientInfoBar patientName={data.patientName} patientId={data.patientId} company={(data as { company?: string }).company ?? ''} position={(data as { position?: string }).position ?? ''} evaluationReason={data.evaluationReason} requestDate={data.requestDate} activeTab={activeTab} onTabChange={setActiveTab} />

        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {activeTab === 'medica' ? (
            <Grid container spacing={3}>
              <Grid size={7}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h3" sx={{ mb: 2, fontSize: '1rem' }}>Información General</Typography>
                  {data.patient && (
                    <PatientInitialDataSection
                      bloodType={data.patient.bloodType}
                      dominantHand={data.patient.dominantHand}
                      usesGlasses={data.patient.usesGlasses}
                      currentAllergies={data.patient.allergies ?? []}
                      allAllergies={allergies}
                      onSave={handleSavePatientInitialData}
                    />
                  )}
                  <TextField label="Tratamiento Actual" fullWidth multiline rows={3} value={treatment} onChange={(e) => setTreatment(e.target.value)} placeholder="Describa el tratamiento actual del paciente..." sx={{ mt: 2.5 }} />
                  <ChronicDiseasesSection patientDiseases={data.patientDiseases} allDiseases={diseases} onAdd={handleAddChronicDisease} onRemove={handleRemoveChronicDisease} />
                </Paper>
                <Box sx={{ mt: 3 }}>
                  <PhysicalExamSection value={physExam} onChange={setPhysExam} />
                </Box>
                <Box sx={{ mt: 3 }}>
                  <ExamResultsSection examResults={data.examResults} exams={exams}
                    onAdd={(examId, resultValue, observation, result) => examResultsService.create({ consultationId: id, examId, resultValue, observation, url: null, result: result || null }).then(() => refetch())}
                    onRemove={(erId) => examResultsService.remove(erId).then(() => refetch())}
                  />
                </Box>
              </Grid>
              <Grid size={5}>
                <DiagnosticSection diagnostics={data.consultationDiagnostics} categories={categories} diseases={diseases} bodySystems={bodySystems}
                  onAddDiagnostic={(row) => diagnosticsService.create({ ...row, consultationId: id }).then(() => refetch())}
                  onRemoveDiagnostic={(dId) => diagnosticsService.remove(dId).then(() => refetch())}
                  result={consultResult} onResultChange={setConsultResult}
                  description={diagDescription} onDescriptionChange={setDiagDescription}
                />
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mt: 3 }}>
                  <Typography variant="h3" sx={{ mb: 2.5, fontSize: '1rem' }}>Recomendaciones</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="EPP Sugerido" size="small" fullWidth multiline rows={2} placeholder="Equipos de protección personal recomendados..." value={recommendations.suggestedPPE} onChange={(e) => setRecommendations((p) => ({ ...p, suggestedPPE: e.target.value }))} />
                    <TextField label="Medidas de Adecuación Médica" size="small" fullWidth multiline rows={2} value={recommendations.medicalAdequacyMeasures} onChange={(e) => setRecommendations((p) => ({ ...p, medicalAdequacyMeasures: e.target.value }))} />
                    <TextField label="Observaciones Médicas" size="small" fullWidth multiline rows={2} value={medObservations} onChange={(e) => setMedObservations(e.target.value)} />
                  </Box>
                </Paper>
                <Box sx={{ mt: 3 }}>
                  <AttendedBySection tab="medica" systemAttendedByName={systemAttendedByName} medicalAttendedById={medicalAttendedById} psychologicalAttendedById={psychologicalAttendedById} onMedicalChange={setMedicalAttendedById} onPsychologicalChange={setPsychologicalAttendedById} users={users} />
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              <Grid size={8}>
                <PsicologicaSection psychologicalResult={psychResult} onResultChange={setPsychResult} interviewConducted={interviewDone} onInterviewChange={setInterviewDone} observations={psychObservations} onObservationsChange={setPsychObservations}
                  psychometricTests={data.psychometricTests} catalogTests={psychCatalog}
                  onAddTest={(catalogTestId) => psychometricTestsService.create({ consultationId: id, catalogTestId, selectedInterpretation: '' }).then(() => refetch())}
                  onRemoveTest={(ptId) => psychometricTestsService.remove(ptId).then(() => refetch())}
                />
              </Grid>
              <Grid size={4}>
                <AttendedBySection tab="psicologica" systemAttendedByName={systemAttendedByName} medicalAttendedById={medicalAttendedById} psychologicalAttendedById={psychologicalAttendedById} onMedicalChange={setMedicalAttendedById} onPsychologicalChange={setPsychologicalAttendedById} users={users} />
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </AppLayout>
  );
}
