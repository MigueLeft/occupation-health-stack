import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, CircularProgress, Paper, TextField } from '@mui/material';
import { usePageTitle } from '@/hooks/usePageTitle';
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
import { useAccidentTypes } from '@/features/catalogs/hooks/useAccidentTypes';
import { useUsers } from '@/features/users/hooks/useUsers';
import { useAuth, usePermissions } from '@/features/auth';
import { consultationsService } from '@/features/consultations/services/consultations.service';
import { physicalExamService, diagnosticsService, examResultsService, psychometricTestsService } from '@/features/consultations/services/sub-entities.service';
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
import { DisabilitySection } from '@/features/consultations/components/attend/DisabilitySection';
import { ExposureRisksBar } from '@/features/consultations/components/attend/ExposureRisksBar';
import { useMedicalSpecialties } from '@/features/catalogs/hooks/useMedicalSpecialties';
import { useDisabilities } from '@/features/catalogs/hooks/useDisabilities';
import { consultationDisabilitiesService } from '@/features/consultations/services/disabilities.service';
import { SavePartialModal } from '@/features/consultations/components/attend/SavePartialModal';
import { PsychologicalIndicatorsSection } from '@/features/consultations/components/attend/PsychologicalIndicatorsSection';
import { usePsychologicalIndicators } from '@/features/psychological-indicators';
import type { PsychologicalIndicatorResult } from '@/features/psychological-indicators';
import type { PhysicalExamPayload, ConsultationDiagnostic, ExamResult, PsychometricTestResult } from '@/features/consultations/services/sub-entities.service';
import type { ConsultationResult, ConsultationType, PsychologicalResult, PsychologicalAptitude } from '@/features/consultations/types';

type LocalDiagnostic = ConsultationDiagnostic & { _isNew?: true };
type LocalExamResult = ExamResult & { _isNew?: true };
type LocalPsychTest = PsychometricTestResult & { _isNew?: true };

interface Props { editMode?: boolean; }

export function AttendConsultationPage({ editMode = false }: Props) {
  usePageTitle(editMode ? 'Editar Consulta' : 'Atender Consulta');

  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { can } = usePermissions();
  const { data, isLoading, isReferralLoading, isDisabilitiesLoading, isPsychometricFetching, refetchPatient, patientDisabilities } = useAttendConsultation(id);

  const hasMedicoRole = can('es-medico', 'view');
  const hasPsicologoRole = can('es-psicologo', 'view');
  const canSeeMedical = hasMedicoRole;
  const canSeePsychological = hasPsicologoRole;

  const [activeTab, setActiveTab] = useState<'medica' | 'psicologica'>(() =>
    !can('es-medico', 'view') && can('es-psicologo', 'view') ? 'psicologica' : 'medica',
  );
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
  const [medicalAttendedByFreeText, setMedicalAttendedByFreeText] = useState('');
  const [psychologicalAttendedById, setPsychologicalAttendedById] = useState('');
  const [psychologicalAttendedByFreeText, setPsychologicalAttendedByFreeText] = useState('');
  const [isHealthy, setIsHealthy] = useState(false);

  // Reposo médico general — un único valor de días compartido entre todos los diagnósticos seleccionados
  const [restEnabled, setRestEnabled] = useState(false);
  const [restDays, setRestDays] = useState<number | ''>('');
  const [restDiagIds, setRestDiagIds] = useState<Set<string>>(new Set());

  const [requiresReferral, setRequiresReferral] = useState(false);
  const [referralSpecialtyId, setReferralSpecialtyId] = useState('');

  const [localDisabilities, setLocalDisabilities] = useState<{ id: string; consultationId: string; disabilityId: string; _isNew?: boolean }[]>([]);
  const [removedDisabilityIds, setRemovedDisabilityIds] = useState<string[]>([]);

  const [localDiagnostics, setLocalDiagnostics] = useState<LocalDiagnostic[]>([]);
  const [localExamResults, setLocalExamResults] = useState<LocalExamResult[]>([]);
  const [localPsychTests, setLocalPsychTests] = useState<LocalPsychTest[]>([]);
  const [localDiseases, setLocalDiseases] = useState<{ id: string; name: string }[]>([]);
  const [psychIndicatorResults, setPsychIndicatorResults] = useState<PsychologicalIndicatorResult[]>([]);
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
  const { data: disabilities = [] } = useDisabilities();
  const { data: accidentTypes = [] } = useAccidentTypes();
  const { data: psychIndicatorsCatalog = [] } = usePsychologicalIndicators();

  useEffect(() => {
    if (!data || !currentUser?.id) return;
    if (!data.systemAttendedById) {
      consultationsService.update(id, { systemAttendedById: currentUser.id }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, currentUser?.id]);

  // Espera a que todos los datos —incluida la referencia y discapacidades— estén cargados antes de inicializar
  useEffect(() => {
    if (!data || isPsychometricFetching || isReferralLoading || isDisabilitiesLoading || initialized) return;
    setConsultResult((data.consultationResult ?? '') as ConsultationResult | '');
    setPsychResult((data.psychologicalResult ?? '') as PsychologicalResult | '');
    setPsychAptitude((data.psychologicalAptitude ?? '') as PsychologicalAptitude | '');
    setIsHealthy(data.isHealthy ?? false);
    setInterviewDone(data.interviewConducted ?? false);
    setMedicalAttendedById(data.medicalAttendedById ?? '');
    setMedicalAttendedByFreeText(data.medicalAttendedByFreeText ?? '');
    setPsychologicalAttendedById(data.psychologicalAttendedById ?? '');
    setPsychologicalAttendedByFreeText(data.psychologicalAttendedByFreeText ?? '');
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
    // Inicializar estado de reposo desde diagnósticos existentes
    const diagsWithRest = data.consultationDiagnostics.filter((d) => d.requiresRest && d.restDays);
    if (diagsWithRest.length > 0) {
      setRestEnabled(true);
      setRestDays(diagsWithRest[0].restDays!); // todos tienen los mismos días en el nuevo modelo
      setRestDiagIds(new Set(diagsWithRest.map((d) => d.id)));
    } else if (data.restPeriod?.requiresRest && data.restPeriod.days) {
      // Compatibilidad con datos legados: asignar reposo al primer diagnóstico
      setRestEnabled(true);
      setRestDays(data.restPeriod.days);
      const firstDiag = data.consultationDiagnostics[0];
      if (firstDiag) setRestDiagIds(new Set([firstDiag.id]));
    }
    if (data.referral) {
      setRequiresReferral(data.referral.requiresReferral);
      setReferralSpecialtyId(data.referral.specialtyId ?? '');
    }
    setLocalDisabilities(data.disabilities);
    setLocalDiagnostics(data.consultationDiagnostics);
    setLocalExamResults(data.examResults);
    setLocalPsychTests(data.psychometricTests);
    setLocalDiseases(data.patientDiseases);
    setPsychIndicatorResults(data.psychologicalIndicatorResults ?? []);

    if (!editMode) {
      if (data.status === 'En Proceso' && data.type === 'Medica' && data.consultationResult) {
        setActiveTab('psicologica');
      } else if (data.status === 'En Proceso' && data.type === 'Psicologica' && data.psychologicalResult) {
        setActiveTab('medica');
      }
    }

    setInitialized(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, isPsychometricFetching, isReferralLoading, isDisabilitiesLoading]);

  const handleAddDiagnostic = (
    { categoryId, diseaseId, accidentTypeId, bodySystemId }: { categoryId: string; diseaseId?: string; accidentTypeId?: string; bodySystemId?: string },
  ) => {
    const tempId = `new-${Date.now()}`;
    setLocalDiagnostics((prev) => [
      ...prev,
      { id: tempId, consultationId: id, categoryId, diseaseId: diseaseId ?? null, accidentTypeId: accidentTypeId ?? null, bodySystemId: bodySystemId ?? null, requiresRest: false, restDays: null, _isNew: true },
    ]);
  };

  const handleRemoveDiagnostic = (itemId: string) => {
    const item = localDiagnostics.find((d) => d.id === itemId);
    if (item && !item._isNew) setRemovedDiagnosticIds((prev) => [...prev, itemId]);
    setRestDiagIds((prev) => { const next = new Set(prev); next.delete(itemId); return next; });
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

  const handleAddDisability = (disabilityId: string) => {
    const tempId = `new-${Date.now()}`;
    setLocalDisabilities((prev) => [...prev, { id: tempId, consultationId: id, disabilityId, _isNew: true }]);
  };

  const handleRemoveDisability = (recordId: string) => {
    const item = localDisabilities.find((d) => d.id === recordId);
    if (item && !item._isNew) setRemovedDisabilityIds((prev) => [...prev, recordId]);
    setLocalDisabilities((prev) => prev.filter((d) => d.id !== recordId));
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
      const generalDays = restEnabled && restDays !== '' ? Number(restDays) : null;
      await Promise.all([
        ...localDiagnostics.filter((d) => d._isNew).map((d) => {
          const hasRest = restEnabled && restDiagIds.has(d.id);
          return diagnosticsService.create({
            categoryId: d.categoryId,
            diseaseId: d.diseaseId ?? undefined,
            accidentTypeId: d.accidentTypeId ?? undefined,
            bodySystemId: d.bodySystemId ?? undefined,
            consultationId: id,
            requiresRest: hasRest,
            restDays: hasRest ? generalDays ?? undefined : undefined,
          });
        }),
        ...localDiagnostics.filter((d) => !d._isNew).map((d) => {
          const hasRest = restEnabled && restDiagIds.has(d.id);
          const restChanged = hasRest !== (d.requiresRest ?? false) || (hasRest && generalDays !== (d.restDays ?? null));
          if (!restChanged) return Promise.resolve();
          return diagnosticsService.update(d.id, { requiresRest: hasRest, restDays: hasRest ? generalDays : null });
        }),
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

      await referralsService.upsert({
        consultationId: id,
        requiresReferral,
        specialtyId: requiresReferral && referralSpecialtyId ? referralSpecialtyId : undefined,
      });

      await Promise.all([
        ...localDisabilities.filter((d) => d._isNew).map((d) =>
          consultationDisabilitiesService.add({ consultationId: id, disabilityId: d.disabilityId }),
        ),
        ...removedDisabilityIds.map((dId) => consultationDisabilitiesService.remove(dId)),
      ]);

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
        medicalAttendedByFreeText: medicalAttendedByFreeText || undefined,
        psychologicalAttendedById: psychologicalAttendedById || undefined,
        psychologicalAttendedByFreeText: psychologicalAttendedByFreeText || undefined,
        chronicDiseasesSnapshot: localDiseases,
        psychologicalIndicatorResults: psychIndicatorResults,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['consultations'] }),
        queryClient.invalidateQueries({ queryKey: ['consultation', id] }),
        queryClient.invalidateQueries({ queryKey: ['consultation-diagnostics', id] }),
        queryClient.invalidateQueries({ queryKey: ['consultation-referral', id] }),
        queryClient.invalidateQueries({ queryKey: ['consultation-disability', id] }),
        queryClient.invalidateQueries({ queryKey: ['patient-disabilities', data.patientId] }),
        queryClient.invalidateQueries({ queryKey: ['requests'] }),
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: ['patient', data.patientId] }),
        queryClient.invalidateQueries({ queryKey: ['psychometric-tests', id] }),
      ]);

      toast.success(status === 'Finalizada' ? 'Consulta guardada exitosamente.' : 'Sección guardada. La consulta quedó En Proceso.');
      if (editMode && data) {
        navigate({ to: '/expedientes/$cedula/consultas/$id', params: { cedula: data.patientId, id } });
      } else {
        navigate({ to: '/consultas' });
      }
    } catch {
      toast.error('Error al guardar la consulta');
    } finally {
      setIsSaving(false);
    }
  };

  const hasMedResult = !!consultResult || isHealthy;
  const hasPsychDone = !!psychResult || !!psychAptitude;
  const isPartialSaveScenario = !!data && data.status === 'En Proceso' &&
    ((data.type === 'Medica' && !!data.consultationResult) ||
     (data.type === 'Psicologica' && !!data.psychologicalResult));
  const isSaveDisabled = isSaving || (!hasMedResult && !hasPsychDone && !isPartialSaveScenario);

  const handleSave = async () => {
    if (!data) return;

    if (requiresReferral && !referralSpecialtyId) {
      toast.error('Debe seleccionar una especialidad médica para la referencia a especialista.');
      return;
    }

    if (!isPartialSaveScenario) {
      if (hasMedResult && !hasPsychDone) {
        setSaveEmptySection('psicologica');
        setShowSaveModal(true);
        return;
      }
      if (!hasMedResult && hasPsychDone) {
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

  // En modo edición solo se muestran las discapacidades de esta consulta; en modo atender se muestra el historial del paciente como referencia
  const previousPatientDisabilities = !editMode
    ? patientDisabilities.filter((pd) => !localDisabilities.some((ld) => ld.disabilityId === pd.id))
    : [];

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
              onClick={() => editMode && data ? navigate({ to: '/expedientes/$cedula/consultas/$id', params: { cedula: data.patientId, id } }) : navigate({ to: '/consultas' })}>
              {editMode ? 'Expediente' : 'Consultas'}
            </Typography>
            <Typography variant="body2" color="text.secondary">›</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{editMode ? 'Editar Consulta' : 'Atender Consulta'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="outlined" onClick={() => editMode && data ? navigate({ to: '/expedientes/$cedula/consultas/$id', params: { cedula: data.patientId, id } }) : navigate({ to: '/consultas' })}>Cancelar</Button>
            <Button variant="contained" startIcon={<SaveOutlined />} onClick={handleSave} disabled={isSaveDisabled}>
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
          canSeeMedical={canSeeMedical}
          canSeePsychological={canSeePsychological}
        />

        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {data.positionRisks.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <ExposureRisksBar risks={data.positionRisks} />
            </Box>
          )}

          {activeTab === 'medica' && canSeeMedical ? (
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
                  accidentTypes={accidentTypes}
                  onAddDiagnostic={handleAddDiagnostic}
                  onRemoveDiagnostic={handleRemoveDiagnostic}
                  result={consultResult} onResultChange={setConsultResult}
                  description={diagDescription} onDescriptionChange={setDiagDescription}
                  isHealthy={isHealthy} onIsHealthyChange={setIsHealthy}
                  restEnabled={restEnabled} onRestEnabledChange={setRestEnabled}
                  restDays={restDays} onRestDaysChange={setRestDays}
                  restDiagIds={restDiagIds} onRestDiagIdsChange={setRestDiagIds}
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
                <Box sx={{ mt: 3 }}>
                  <DisabilitySection
                    localDisabilities={localDisabilities}
                    allDisabilities={disabilities}
                    onAdd={handleAddDisability}
                    onRemove={handleRemoveDisability}
                    previousPatientDisabilities={previousPatientDisabilities}
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
                  <AttendedBySection tab="medica"medicalAttendedById={medicalAttendedById} medicalAttendedByFreeText={medicalAttendedByFreeText} psychologicalAttendedById={psychologicalAttendedById} psychologicalAttendedByFreeText={psychologicalAttendedByFreeText} onMedicalChange={setMedicalAttendedById} onMedicalFreeTextChange={setMedicalAttendedByFreeText} onPsychologicalChange={setPsychologicalAttendedById} onPsychologicalFreeTextChange={setPsychologicalAttendedByFreeText} users={users} />
                </Box>
              </Grid>
            </Grid>
          ) : canSeePsychological ? (
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
                {(data.evaluationReason === 'Pre-vacacional' || data.evaluationReason === 'Post-vacacional') && (
                  <PsychologicalIndicatorsSection
                    indicators={psychIndicatorsCatalog}
                    results={psychIndicatorResults}
                    onChange={setPsychIndicatorResults}
                  />
                )}
              </Grid>
              <Grid size={4}>
                <AttendedBySection tab="psicologica"medicalAttendedById={medicalAttendedById} medicalAttendedByFreeText={medicalAttendedByFreeText} psychologicalAttendedById={psychologicalAttendedById} psychologicalAttendedByFreeText={psychologicalAttendedByFreeText} onMedicalChange={setMedicalAttendedById} onMedicalFreeTextChange={setMedicalAttendedByFreeText} onPsychologicalChange={setPsychologicalAttendedById} onPsychologicalFreeTextChange={setPsychologicalAttendedByFreeText} users={users} />
              </Grid>
            </Grid>
          ) : null}
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
          performSave('Medica/Psicologica', 'En Proceso');
        }}
        onCancel={() => setShowSaveModal(false)}
      />
    </AppLayout>
  );
}
