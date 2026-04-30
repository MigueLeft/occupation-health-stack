import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, CircularProgress, Paper, TextField } from '@mui/material';
import { SaveOutlined } from '@mui/icons-material';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
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
import type { PhysicalExamPayload, ConsultationDiagnostic, ExamResult, PsychometricTestResult } from '@/features/consultations/services/sub-entities.service';
import type { ConsultationResult, PsychologicalResult } from '@/features/consultations/types';

type LocalDiagnostic = ConsultationDiagnostic & { _isNew?: true };
type LocalExamResult = ExamResult & { _isNew?: true };
type LocalPsychTest = PsychometricTestResult & { _isNew?: true };

interface Props { editMode?: boolean; }

export function AttendConsultationPage({ editMode = false }: Props) {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { data, isLoading, refetchPatient } = useAttendConsultation(id);

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

  // Local lists — changes are only persisted when "Guardar Consulta" is clicked
  const [localDiagnostics, setLocalDiagnostics] = useState<LocalDiagnostic[]>([]);
  const [localExamResults, setLocalExamResults] = useState<LocalExamResult[]>([]);
  const [localPsychTests, setLocalPsychTests] = useState<LocalPsychTest[]>([]);
  const [localDiseases, setLocalDiseases] = useState<{ id: string; name: string }[]>([]);
  const [removedDiagnosticIds, setRemovedDiagnosticIds] = useState<string[]>([]);
  const [removedExamResultIds, setRemovedExamResultIds] = useState<string[]>([]);
  const [removedPsychTestIds, setRemovedPsychTestIds] = useState<string[]>([]);

  const [initialized, setInitialized] = useState(false);

  const { data: exams = [] } = useExams();
  const { data: diseases = [] } = useDiseases();
  const { data: categories = [] } = useDiseaseCategories();
  const { data: bodySystems = [] } = useBodySystems();
  const { data: psychCatalog = [] } = usePsychometricCatalog();
  const { data: allergies = [] } = useAllergies();
  const { data: users = [] } = useUsers();

  useEffect(() => {
    if (!data || !currentUser?.id) return;
    const patch: Parameters<typeof consultationsService.update>[1] = {};
    if (!data.systemAttendedById) patch.systemAttendedById = currentUser.id;
    if (data.status === 'Pendiente') patch.status = 'En Proceso';
    if (Object.keys(patch).length > 0) {
      consultationsService.update(id, patch).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, currentUser?.id]);

  if (data && !initialized) {
    setConsultResult((data.consultationResult ?? '') as ConsultationResult | '');
    setPsychResult((data.psychologicalResult ?? '') as PsychologicalResult | '');
    setInterviewDone(data.interviewConducted ?? false);
    setMedicalAttendedById(data.medicalAttendedById ?? '');
    setPsychologicalAttendedById(data.psychologicalAttendedById ?? '');
    setTreatment(data.currentTreatment ?? '');
    setDiagDescription(data.diagnosisDescription ?? '');
    setMedObservations((data.observations as { medica?: string } | null)?.medica ?? '');
    setPsychObservations((data.observations as { psicologica?: string } | null)?.psicologica ?? '');
    setRecommendations({
      suggestedPPE: data.recommendations?.suggestedPPE ?? '',
      medicalAdequacyMeasures: data.recommendations?.medicalAdequacyMeasures ?? '',
      psychologicalAdequacyMeasures: data.recommendations?.psychologicalAdequacyMeasures ?? '',
    });
    if (data.physicalExam) {
      const { id: _id, consultationId: _cid, ...physExamFields } = data.physicalExam;
      setPhysExam(physExamFields);
    }
    setLocalDiagnostics(data.consultationDiagnostics);
    setLocalExamResults(data.examResults);
    setLocalPsychTests(data.psychometricTests);
    setLocalDiseases(data.patientDiseases);
    setInitialized(true);
  }

  // ─── Local-only add/remove handlers (reactive, no API calls) ─────────────
  const handleAddDiagnostic = ({ categoryId, diseaseId, bodySystemId }: { categoryId: string; diseaseId: string; bodySystemId?: string }) => {
    const tempId = `new-${Date.now()}`;
    setLocalDiagnostics((prev) => [...prev, { id: tempId, consultationId: id, categoryId, diseaseId, bodySystemId: bodySystemId ?? null, _isNew: true }]);
  };

  const handleRemoveDiagnostic = (itemId: string) => {
    const item = localDiagnostics.find((d) => d.id === itemId);
    if (item && !item._isNew) setRemovedDiagnosticIds((prev) => [...prev, itemId]);
    setLocalDiagnostics((prev) => prev.filter((d) => d.id !== itemId));
  };

  const handleAddExamResult = (examId: string, resultValue: string, observation: string, result: 'Normal' | 'Anormal' | '') => {
    const tempId = `new-${Date.now()}`;
    setLocalExamResults((prev) => [
      ...prev,
      { id: tempId, consultationId: id, examId, resultValue: resultValue || null, observation: observation || null, url: null, result: (result || null) as 'Normal' | 'Anormal' | null, _isNew: true },
    ]);
  };

  const handleRemoveExamResult = (itemId: string) => {
    const item = localExamResults.find((er) => er.id === itemId);
    if (item && !item._isNew) setRemovedExamResultIds((prev) => [...prev, itemId]);
    setLocalExamResults((prev) => prev.filter((er) => er.id !== itemId));
  };

  const handleAddPsychTest = (catalogTestId: string) => {
    const tempId = `new-${Date.now()}`;
    setLocalPsychTests((prev) => [...prev, { id: tempId, consultationId: id, catalogTestId, selectedInterpretation: null, observations: null, _isNew: true }]);
  };

  const handleRemovePsychTest = (itemId: string) => {
    const item = localPsychTests.find((t) => t.id === itemId);
    if (item && !item._isNew) setRemovedPsychTestIds((prev) => [...prev, itemId]);
    setLocalPsychTests((prev) => prev.filter((t) => t.id !== itemId));
  };

  const handleAddChronicDisease = (diseaseId: string) => {
    const disease = diseases.find((d) => d.id === diseaseId);
    if (!disease) return;
    setLocalDiseases((prev) => [...prev, { id: disease.id, name: disease.name }]);
  };

  const handleRemoveChronicDisease = (diseaseId: string) => {
    setLocalDiseases((prev) => prev.filter((d) => d.id !== diseaseId));
  };

  // Patient initial data has its own save button — persisted immediately
  const handleSavePatientInitialData = async (patch: { bloodType?: string; dominantHand?: string; usesGlasses?: boolean; allergyIds?: string[] }) => {
    if (!data) return;
    await patientsService.update(data.patientId, patch);
    refetchPatient();
  };

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);
    try {
      await Promise.all([
        ...localDiagnostics.filter((d) => d._isNew).map((d) =>
          diagnosticsService.create({ categoryId: d.categoryId, diseaseId: d.diseaseId, bodySystemId: d.bodySystemId ?? undefined, consultationId: id }),
        ),
        ...removedDiagnosticIds.map((dId) => diagnosticsService.remove(dId)),
        ...localExamResults.filter((er) => er._isNew).map((er) =>
          examResultsService.create({ consultationId: id, examId: er.examId, resultValue: er.resultValue, observation: er.observation, url: null, result: er.result ?? null }),
        ),
        ...removedExamResultIds.map((erId) => examResultsService.remove(erId)),
        ...localPsychTests.filter((t) => t._isNew).map((t) =>
          psychometricTestsService.create({ consultationId: id, catalogTestId: t.catalogTestId, selectedInterpretation: '' }),
        ),
        ...removedPsychTestIds.map((tId) => psychometricTestsService.remove(tId)),
      ]);

      await patientsService.update(data.patientId, { diseaseIds: localDiseases.map((d) => d.id) });

      if (data.physicalExam) {
        await physicalExamService.update(data.physicalExam.id, physExam);
      } else if (Object.values(physExam).some(Boolean)) {
        await physicalExamService.create({ ...physExam, consultationId: id });
      }

      // Auto-detect consultation type based on which results were filled in
      let detectedType = data.type;
      if (consultResult && psychResult) {
        detectedType = 'Medica/Psicologica';
      } else if (consultResult) {
        detectedType = 'Medica';
      } else if (psychResult) {
        detectedType = 'Psicologica';
      }

      await consultationsService.update(id, {
        type: detectedType,
        currentTreatment: treatment || undefined,
        consultationResult: consultResult || undefined,
        psychologicalResult: psychResult || undefined,
        diagnosisDescription: diagDescription || undefined,
        recommendations: {
          suggestedPPE: recommendations.suggestedPPE || undefined,
          medicalAdequacyMeasures: recommendations.medicalAdequacyMeasures || undefined,
          psychologicalAdequacyMeasures: recommendations.psychologicalAdequacyMeasures || undefined,
        },
        interviewConducted: interviewDone,
        observations: { medica: medObservations || undefined, psicologica: psychObservations || undefined },
        medicalAttendedById: medicalAttendedById || undefined,
        psychologicalAttendedById: psychologicalAttendedById || undefined,
        status: 'Finalizada',
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['consultations'] }),
        queryClient.invalidateQueries({ queryKey: ['requests'] }),
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
      ]);

      toast.success('Consulta guardada exitosamente.');
      if (editMode && data) {
        navigate({ to: '/expedientes/$cedula', params: { cedula: data.patientId } });
      } else {
        navigate({ to: '/consultas' });
      }
    } catch {
      toast.error('Error al guardar la consulta');
    } finally {
      setIsSaving(false);
    }
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
            <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
              onClick={() => editMode && data ? navigate({ to: '/expedientes/$cedula', params: { cedula: data.patientId } }) : navigate({ to: '/consultas' })}>
              {editMode ? 'Expediente' : 'Consultas'}
            </Typography>
            <Typography variant="body2" color="text.secondary">›</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{editMode ? 'Editar Consulta' : 'Atender Consulta'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="outlined" onClick={() => editMode && data ? navigate({ to: '/expedientes/$cedula', params: { cedula: data.patientId } }) : navigate({ to: '/consultas' })}>Cancelar</Button>
            <Button variant="contained" startIcon={<SaveOutlined />} onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Consulta'}
            </Button>
          </Box>
        </Box>

        <PatientInfoBar
          patientName={data.patientName}
          patientId={data.patientId}
          company={(data as { company?: string }).company ?? ''}
          position={(data as { position?: string }).position ?? ''}
          evaluationReason={data.evaluationReason}
          requestDate={data.requestDate}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

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
                  <TextField
                    label="Tratamiento Actual" fullWidth multiline rows={3} value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    placeholder="Describa el tratamiento actual del paciente..."
                    sx={{ mt: 2.5 }}
                  />
                  <ChronicDiseasesSection patientDiseases={localDiseases} allDiseases={diseases.filter((d) => d.isChronic)} onAdd={handleAddChronicDisease} onRemove={handleRemoveChronicDisease} />
                </Paper>
                <Box sx={{ mt: 3 }}>
                  <PhysicalExamSection value={physExam} onChange={setPhysExam} />
                </Box>
                <Box sx={{ mt: 3 }}>
                  <ExamResultsSection examResults={localExamResults} exams={exams} onAdd={handleAddExamResult} onRemove={handleRemoveExamResult} />
                </Box>
              </Grid>
              <Grid size={5}>
                <DiagnosticSection
                  diagnostics={localDiagnostics} categories={categories} diseases={diseases} bodySystems={bodySystems}
                  onAddDiagnostic={handleAddDiagnostic}
                  onRemoveDiagnostic={handleRemoveDiagnostic}
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
                <PsicologicaSection
                  psychologicalResult={psychResult} onResultChange={setPsychResult}
                  interviewConducted={interviewDone} onInterviewChange={setInterviewDone}
                  observations={psychObservations} onObservationsChange={setPsychObservations}
                  psychometricTests={localPsychTests}
                  catalogTests={psychCatalog}
                  onAddTest={handleAddPsychTest}
                  onRemoveTest={handleRemovePsychTest}
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
