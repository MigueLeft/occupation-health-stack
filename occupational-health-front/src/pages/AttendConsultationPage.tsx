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
import { restPeriodsService } from '@/features/consultations/services/rest-periods.service';
import { referralsService } from '@/features/consultations/services/referrals.service';
import { patientsService } from '@/features/patients/services/patients.service';
import { PatientInfoBar } from '@/features/consultations/components/attend/PatientInfoBar';
import { PhysicalExamSection } from '@/features/consultations/components/attend/PhysicalExamSection';
import { DiagnosticSection } from '@/features/consultations/components/attend/DiagnosticSection';
import { ExamResultsSection } from '@/features/consultations/components/attend/ExamResultsSection';
import { PsicologicaSection } from '@/features/consultations/components/attend/PsicologicaSection';
import { ChronicDiseasesSection } from '@/features/consultations/components/attend/ChronicDiseasesSection';
import { PatientInitialDataSection } from '@/features/consultations/components/attend/PatientInitialDataSection';
import { AttendedBySection } from '@/features/consultations/components/attend/AttendedBySection';
import { ReferralSection } from '@/features/consultations/components/attend/ReferralSection';
import { ExposureRisksBar } from '@/features/consultations/components/attend/ExposureRisksBar';
import { useMedicalSpecialties } from '@/features/catalogs/hooks/useMedicalSpecialties';
import { SavePartialModal } from '@/features/consultations/components/attend/SavePartialModal';
import type { PhysicalExamPayload, ConsultationDiagnostic, ExamResult, PsychometricTestResult } from '@/features/consultations/services/sub-entities.service';
import type { ConsultationResult, ConsultationType, PsychologicalResult, PsychologicalAptitude } from '@/features/consultations/types';

type LocalDiagnostic = ConsultationDiagnostic & { _isNew?: true };
type LocalExamResult = ExamResult & { _isNew?: true };
type LocalPsychTest = PsychometricTestResult & { _isNew?: true };

interface Props { editMode?: boolean; }

export function AttendConsultationPage({ editMode = false }: Props) {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { data, isLoading, isReferralLoading, isPsychometricFetching, refetchPatient } = useAttendConsultation(id);

  const [activeTab, setActiveTab] = useState<'medica' | 'psicologica'>('medica');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveEmptySection, setSaveEmptySection] = useState<'medica' | 'psicologica'>('psicologica');

  const [treatment, setTreatment] = useState('');
  const [physExam, setPhysExam] = useState<PhysicalExamPayload>({});
  const [consultResult, setConsultResult] = useState<ConsultationResult | ''>('');
  const [diagDescription, setDiagDescription] = useState('');
  const [recommendations, setRecommendations] = useState({ suggestedPPE: '', medicalAdequacyMeasures: '', psychologicalAdequacyMeasures: '' });
  const [medObservations, setMedObservations] = useState('');
  const [psychResult, setPsychResult] = useState<PsychologicalResult | ''>('');
  const [psychAptitude, setPsychAptitude] = useState<PsychologicalAptitude | ''>('');
  const [psychAptitudeDetails, setPsychAptitudeDetails] = useState('');
  const [interviewDone, setInterviewDone] = useState(false);
  const [psychObservations, setPsychObservations] = useState('');
  const [medicalAttendedById, setMedicalAttendedById] = useState('');
  const [psychologicalAttendedById, setPsychologicalAttendedById] = useState('');
  const [isHealthy, setIsHealthy] = useState(false);

  // Estado del reposo médico (vinculado al diagnóstico)
  const [requiresRest, setRequiresRest] = useState(false);
  const [restDays, setRestDays] = useState<number | ''>('');
  const [restCategoryId, setRestCategoryId] = useState('');
  const [restDiseaseId, setRestDiseaseId] = useState('');
  const [restBodySystemId, setRestBodySystemId] = useState('');

  const [requiresReferral, setRequiresReferral] = useState(false);
  const [referralSpecialtyId, setReferralSpecialtyId] = useState('');

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
  const { data: medicalSpecialties = [] } = useMedicalSpecialties();

  useEffect(() => {
    if (!data || !currentUser?.id) return;
    if (!data.systemAttendedById) {
      consultationsService.update(id, { systemAttendedById: currentUser.id }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, currentUser?.id]);

  // Espera a que todos los datos —incluida la referencia— estén cargados antes de inicializar
  useEffect(() => {
    if (!data || isPsychometricFetching || isReferralLoading || initialized) return;
    setConsultResult((data.consultationResult ?? '') as ConsultationResult | '');
    setPsychResult((data.psychologicalResult ?? '') as PsychologicalResult | '');
    setPsychAptitude((data.psychologicalAptitude ?? '') as PsychologicalAptitude | '');
    setIsHealthy(data.isHealthy ?? false);
    setInterviewDone(data.interviewConducted ?? false);
    setMedicalAttendedById(data.medicalAttendedById ?? '');
    setPsychologicalAttendedById(data.psychologicalAttendedById ?? '');
    setTreatment(data.currentTreatment ?? '');
    setDiagDescription(data.diagnosisDescription ?? '');
    setMedObservations((data.observations as { medica?: string } | null)?.medica ?? '');
    setPsychObservations((data.observations as { psicologica?: string } | null)?.psicologica ?? '');
    setPsychAptitudeDetails((data.observations as { aptitudeDetails?: string } | null)?.aptitudeDetails ?? '');
    setRecommendations({
      suggestedPPE: data.recommendations?.suggestedPPE ?? '',
      medicalAdequacyMeasures: data.recommendations?.medicalAdequacyMeasures ?? '',
      psychologicalAdequacyMeasures: data.recommendations?.psychologicalAdequacyMeasures ?? '',
    });
    if (data.physicalExam) {
      const { id: _id, consultationId: _cid, ...physExamFields } = data.physicalExam;
      setPhysExam(physExamFields);
    }
    if (data.restPeriod) {
      setRequiresRest(data.restPeriod.requiresRest);
      setRestDays(data.restPeriod.days ?? '');
      setRestCategoryId(data.restPeriod.categoryId ?? '');
      setRestDiseaseId(data.restPeriod.diseaseId ?? '');
      setRestBodySystemId(data.restPeriod.bodySystemId ?? '');
    }
    if (data.referral) {
      setRequiresReferral(data.referral.requiresReferral);
      setReferralSpecialtyId(data.referral.specialtyId ?? '');
    }
    setLocalDiagnostics(data.consultationDiagnostics);
    setLocalExamResults(data.examResults);
    setLocalPsychTests(data.psychometricTests);
    setLocalDiseases(data.patientDiseases);

    if (!editMode) {
      if (data.status === 'En Proceso' && data.type === 'Medica' && data.consultationResult) {
        setActiveTab('psicologica');
      } else if (data.status === 'En Proceso' && data.type === 'Psicologica' && data.psychologicalResult) {
        setActiveTab('medica');
      }
    }

    setInitialized(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, isPsychometricFetching, isReferralLoading]);

  const handleAddDiagnostic = (
    { categoryId, diseaseId, bodySystemId }: { categoryId: string; diseaseId: string; bodySystemId?: string },
    isRest: boolean,
    days: number | '',
  ) => {
    const tempId = `new-${Date.now()}`;
    setLocalDiagnostics((prev) => [...prev, { id: tempId, consultationId: id, categoryId, diseaseId, bodySystemId: bodySystemId ?? null, _isNew: true }]);
    if (isRest) {
      setRequiresRest(true);
      setRestDays(days);
      setRestCategoryId(categoryId);
      setRestDiseaseId(diseaseId);
      setRestBodySystemId(bodySystemId ?? '');
    }
  };

  const handleRemoveDiagnostic = (itemId: string) => {
    const item = localDiagnostics.find((d) => d.id === itemId);
    if (item && !item._isNew) setRemovedDiagnosticIds((prev) => [...prev, itemId]);
    // Si se elimina el diagnóstico de reposo, limpiar el estado
    if (item && item.categoryId === restCategoryId && item.diseaseId === restDiseaseId && (item.bodySystemId ?? '') === restBodySystemId) {
      setRequiresRest(false);
      setRestDays('');
      setRestCategoryId('');
      setRestDiseaseId('');
      setRestBodySystemId('');
    }
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
    setLocalPsychTests((prev) => [...prev, { id: tempId, consultationId: id, catalogTestId, observations: null, _isNew: true }]);
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

  const handleSavePatientInitialData = async (patch: { bloodType?: string; dominantHand?: string; usesGlasses?: boolean; allergyIds?: string[] }) => {
    if (!data) return;
    await patientsService.update(data.patientId, patch);
    await queryClient.invalidateQueries({ queryKey: ['patient', data.patientId] });
    refetchPatient();
  };

  const performSave = async (type: ConsultationType, status: 'Finalizada' | 'En Proceso') => {
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
          psychometricTestsService.create({ consultationId: id, catalogTestId: t.catalogTestId }),
        ),
        ...removedPsychTestIds.map((tId) => psychometricTestsService.remove(tId)),
      ]);

      await patientsService.update(data.patientId, { diseaseIds: localDiseases.map((d) => d.id) });

      if (data.physicalExam) {
        await physicalExamService.update(data.physicalExam.id, physExam);
      } else if (Object.values(physExam).some(Boolean)) {
        await physicalExamService.create({ ...physExam, consultationId: id });
      }

      if (data.restPeriod) {
        await restPeriodsService.update(data.restPeriod.id, {
          requiresRest,
          days: requiresRest && restDays !== '' ? Number(restDays) : null,
          categoryId: requiresRest && restCategoryId ? restCategoryId : null,
          diseaseId: requiresRest && restDiseaseId ? restDiseaseId : null,
          bodySystemId: requiresRest && restBodySystemId ? restBodySystemId : null,
        });
      } else if (requiresRest) {
        await restPeriodsService.create({
          consultationId: id,
          requiresRest: true,
          days: restDays !== '' ? Number(restDays) : undefined,
          categoryId: restCategoryId || undefined,
          diseaseId: restDiseaseId || undefined,
          bodySystemId: restBodySystemId || undefined,
        });
      }

      await referralsService.upsert({
        consultationId: id,
        requiresReferral,
        specialtyId: requiresReferral && referralSpecialtyId ? referralSpecialtyId : undefined,
      });

      await consultationsService.update(id, {
        type,
        status,
        currentTreatment: treatment || undefined,
        consultationResult: consultResult || undefined,
        psychologicalResult: psychResult || undefined,
        psychologicalAptitude: psychAptitude || undefined,
        isHealthy,
        diagnosisDescription: diagDescription || undefined,
        recommendations: {
          suggestedPPE: recommendations.suggestedPPE || undefined,
          medicalAdequacyMeasures: recommendations.medicalAdequacyMeasures || undefined,
          psychologicalAdequacyMeasures: recommendations.psychologicalAdequacyMeasures || undefined,
        },
        interviewConducted: interviewDone,
        observations: {
          medica: medObservations || undefined,
          psicologica: psychObservations || undefined,
          aptitudeDetails: psychAptitudeDetails || undefined,
        },
        medicalAttendedById: medicalAttendedById || undefined,
        psychologicalAttendedById: psychologicalAttendedById || undefined,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['consultations'] }),
        queryClient.invalidateQueries({ queryKey: ['consultation', id] }),
        queryClient.invalidateQueries({ queryKey: ['consultation-diagnostics', id] }),
        queryClient.invalidateQueries({ queryKey: ['consultation-referral', id] }),
        queryClient.invalidateQueries({ queryKey: ['requests'] }),
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: ['patient', data.patientId] }),
        queryClient.invalidateQueries({ queryKey: ['psychometric-tests', id] }),
      ]);

      toast.success(status === 'Finalizada' ? 'Consulta guardada exitosamente.' : 'Sección guardada. La consulta quedó En Proceso.');
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

  const handleSave = async () => {
    if (!data) return;

    const isPartialSave = data.status === 'En Proceso' &&
      ((data.type === 'Medica' && !!data.consultationResult) ||
       (data.type === 'Psicologica' && !!data.psychologicalResult));

    if (data.type === 'Medica/Psicologica' && !isPartialSave) {
      const hasMedResult = !!consultResult || isHealthy;
      const hasPsychAptitude = !!psychAptitude;

      if (hasMedResult && !hasPsychAptitude) {
        setSaveEmptySection('psicologica');
        setShowSaveModal(true);
        return;
      }
      if (!hasMedResult && hasPsychAptitude) {
        setSaveEmptySection('medica');
        setShowSaveModal(true);
        return;
      }
    }

    const medicalDone = !!consultResult || isHealthy;
    const psychDone = !!psychResult;
    const type: ConsultationType =
      medicalDone && psychDone ? 'Medica/Psicologica'
      : medicalDone ? 'Medica'
      : psychDone ? 'Psicologica'
      : data.type;

    await performSave(type, 'Finalizada');
  };

  const systemAttendedByName = users.find((u) => u.id === data?.systemAttendedById)?.name;

  const hiddenTab: 'medica' | 'psicologica' | undefined = editMode
    ? undefined
    : data?.status === 'En Proceso' && data.type === 'Medica' && !!data.consultationResult
    ? 'medica'
    : data?.status === 'En Proceso' && data.type === 'Psicologica' && !!data.psychologicalResult
    ? 'psicologica'
    : undefined;

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
          hiddenTab={hiddenTab}
        />

        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {data.positionRisks.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <ExposureRisksBar risks={data.positionRisks} />
            </Box>
          )}

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
                  isHealthy={isHealthy} onIsHealthyChange={setIsHealthy}
                  restCategoryId={restCategoryId}
                  restDiseaseId={restDiseaseId}
                  restBodySystemId={restBodySystemId}
                  restDays={restDays}
                />
                <Box sx={{ mt: 3 }}>
                  <ReferralSection
                    requiresReferral={requiresReferral}
                    onRequiresReferralChange={setRequiresReferral}
                    specialtyId={referralSpecialtyId}
                    onSpecialtyIdChange={setReferralSpecialtyId}
                    specialties={medicalSpecialties}
                  />
                </Box>
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
                  psychologicalAptitude={psychAptitude} onAptitudeChange={setPsychAptitude}
                  aptitudeDetails={psychAptitudeDetails} onAptitudeDetailsChange={setPsychAptitudeDetails}
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
      <SavePartialModal
        open={showSaveModal}
        emptySection={saveEmptySection}
        isSaving={isSaving}
        onFinalize={() => {
          setShowSaveModal(false);
          const type: ConsultationType = saveEmptySection === 'psicologica' ? 'Medica' : 'Psicologica';
          performSave(type, 'Finalizada');
        }}
        onSavePartial={() => {
          setShowSaveModal(false);
          const type: ConsultationType = saveEmptySection === 'psicologica' ? 'Medica' : 'Psicologica';
          performSave(type, 'En Proceso');
        }}
        onCancel={() => setShowSaveModal(false)}
      />
    </AppLayout>
  );
}
