import { Box, Typography, Button, CircularProgress, Grid, Paper, Chip, Stack, Divider } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import { useParams, useNavigate } from '@tanstack/react-router';
import { AppLayout } from '@/components/AppLayout';
import { useAttendConsultation } from '@/features/consultations/hooks/useAttendConsultation';
import { useUsers } from '@/features/users/hooks/useUsers';
import { useDiseaseCategories } from '@/features/catalogs/hooks/useDiseaseCategories';
import { useDiseases } from '@/features/catalogs/hooks/useDiseases';
import { useBodySystems } from '@/features/catalogs/hooks/useBodySystems';
import { useExams } from '@/features/catalogs/hooks/useExams';
import { usePsychometricTests as usePsychometricCatalog } from '@/features/catalogs/hooks/usePsychometricTests';
import { EVALUATION_REASON_LABELS } from '@/features/requests/types';
import { ConsultationResultChip } from '@/features/consultations/components/ConsultationResultChip';

function formatDate(d: string) {
  if (!d) return '—';
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ReadField({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', fontSize: '0.68rem' }}>{label}</Typography>
      <Typography variant="body2" sx={{ mt: 0.25 }}>{value || '—'}</Typography>
    </Box>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h3" sx={{ mb: 2, fontSize: '1rem' }}>{title}</Typography>
      {children}
    </Paper>
  );
}

export function ConsultationDetailPage() {
  const { cedula, id } = useParams({ strict: false }) as { cedula: string; id: string };
  const navigate = useNavigate();
  const { data, isLoading } = useAttendConsultation(id);
  const { data: users = [] } = useUsers();
  const { data: categories = [] } = useDiseaseCategories();
  const { data: diseases = [] } = useDiseases();
  const { data: bodySystems = [] } = useBodySystems();
  const { data: exams = [] } = useExams();
  const { data: psychCatalog = [] } = usePsychometricCatalog();

  if (isLoading || !data) {
    return <AppLayout><Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box></AppLayout>;
  }

  const getName = (list: { id: string; name: string }[], id: string) => list.find((x) => x.id === id)?.name ?? '—';
  const getUserName = (uid?: string | null) => uid ? (users.find((u) => u.id === uid)?.name ?? uid) : '—';

  const physExam = data.physicalExam;
  const bmi = physExam?.weight && physExam?.height && physExam.height > 0
    ? (physExam.weight / ((physExam.height / 100) ** 2)).toFixed(1) : null;

  const result = data.type === 'Medica' ? data.consultationResult : data.psychologicalResult;

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ px: 4, pt: 2.5, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate({ to: '/expedientes/$cedula', params: { cedula } })}>
              Expediente
            </Typography>
            <Typography variant="body2" color="text.secondary">›</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Consulta</Typography>
          </Box>
          <Button variant="contained" startIcon={<EditOutlined />} onClick={() => navigate({ to: '/consultas/$id/atender', params: { id } })}>
            Editar
          </Button>
        </Box>

        {/* Patient info row */}
        <Box sx={{ px: 4, py: 2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.68rem' }}>Paciente</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.patientName} · {data.patientId}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.68rem' }}>Fecha</Typography>
            <Typography variant="body2">{formatDate(data.requestDate)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.68rem' }}>Motivo</Typography>
            <Typography variant="body2">{EVALUATION_REASON_LABELS[data.evaluationReason] ?? data.evaluationReason}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.68rem' }}>Tipo</Typography>
            <Typography variant="body2">{data.type === 'Medica' ? 'Médica' : 'Psicológica'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.68rem' }}>Resultado</Typography>
            <ConsultationResultChip result={result} />
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {data.type === 'Medica' ? (
            <Grid container spacing={3}>
              <Grid size={7}>
                <Stack spacing={3}>
                  {/* Información general */}
                  <SectionCard title="Información General">
                    <Stack spacing={2}>
                      <ReadField label="Tratamiento Actual" value={data.currentTreatment} />
                      {data.patientDiseases.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', fontSize: '0.68rem' }}>Enfermedades Crónicas</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {data.patientDiseases.map((d) => <Chip key={d.id} label={d.name} size="small" />)}
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </SectionCard>

                  {/* Examen físico */}
                  {physExam && (
                    <SectionCard title="Examen Físico">
                      <Grid container spacing={2}>
                        <Grid size={4}><ReadField label="Peso (kg)" value={physExam.weight?.toString()} /></Grid>
                        <Grid size={4}><ReadField label="Talla (cm)" value={physExam.height?.toString()} /></Grid>
                        <Grid size={4}><ReadField label="IMC" value={bmi ?? undefined} /></Grid>
                        <Grid size={3}><ReadField label="P.A. Sistólica" value={physExam.systolicPressure?.toString()} /></Grid>
                        <Grid size={3}><ReadField label="P.A. Diastólica" value={physExam.diastolicPressure?.toString()} /></Grid>
                        <Grid size={3}><ReadField label="Frec. Cardíaca" value={physExam.heartRate?.toString()} /></Grid>
                        <Grid size={3}><ReadField label="Frec. Respiratoria" value={physExam.respiratoryRate?.toString()} /></Grid>
                        <Grid size={4}><ReadField label="Sat. O₂ (%)" value={physExam.oxygenSaturation?.toString()} /></Grid>
                        {physExam.notes && <Grid size={12}><ReadField label="Notas" value={physExam.notes} /></Grid>}
                      </Grid>
                    </SectionCard>
                  )}

                  {/* Resultados de exámenes */}
                  {data.examResults.length > 0 && (
                    <SectionCard title="Resultados de Exámenes">
                      <Stack spacing={1}>
                        {data.examResults.map((er) => (
                          <Box key={er.id} sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{getName(exams, er.examId)}</Typography>
                            <Typography variant="caption" color="text.secondary">{er.resultValue} {er.result ? `· ${er.result}` : ''} {er.observation ? `· ${er.observation}` : ''}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </SectionCard>
                  )}
                </Stack>
              </Grid>

              <Grid size={5}>
                <Stack spacing={3}>
                  {/* Diagnóstico */}
                  <SectionCard title="Diagnóstico">
                    <Stack spacing={2}>
                      {data.consultationDiagnostics.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.68rem' }}>Diagnósticos</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {data.consultationDiagnostics.map((d) => (
                              <Chip key={d.id} size="small" label={`${getName(categories, d.categoryId)} · ${getName(diseases, d.diseaseId)}${d.bodySystemId ? ` · ${getName(bodySystems, d.bodySystemId)}` : ''}`} />
                            ))}
                          </Box>
                        </Box>
                      )}
                      <ReadField label="Descripción" value={data.diagnosisDescription} />
                    </Stack>
                  </SectionCard>

                  {/* Recomendaciones */}
                  {(data.recommendations?.suggestedPPE || data.recommendations?.medicalAdequacyMeasures) && (
                    <SectionCard title="Recomendaciones">
                      <Stack spacing={2}>
                        <ReadField label="EPP Sugerido" value={data.recommendations?.suggestedPPE} />
                        <ReadField label="Medidas de Adecuación Médica" value={data.recommendations?.medicalAdequacyMeasures} />
                        {data.observations?.medica && <ReadField label="Observaciones Médicas" value={data.observations.medica} />}
                      </Stack>
                    </SectionCard>
                  )}

                  {/* Atendido por */}
                  <SectionCard title="Atendido por">
                    <Stack spacing={1.5} divider={<Divider />}>
                      <ReadField label="Registrado en sistema por" value={getUserName(data.systemAttendedById)} />
                      <ReadField label="Atendido presencialmente (Médica)" value={getUserName(data.medicalAttendedById)} />
                    </Stack>
                  </SectionCard>
                </Stack>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              <Grid size={8}>
                <Stack spacing={3}>
                  <SectionCard title="Evaluación Psicológica">
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.68rem' }}>Resultado</Typography>
                        <Box sx={{ mt: 0.5 }}><ConsultationResultChip result={data.psychologicalResult} /></Box>
                      </Box>
                      <ReadField label="Entrevista realizada" value={data.interviewConducted ? 'Sí' : 'No'} />
                      {data.psychometricTests.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.68rem' }}>Tests Psicométricos</Typography>
                          <Stack spacing={1} sx={{ mt: 0.5 }}>
                            {data.psychometricTests.map((pt) => (
                              <Box key={pt.id} sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{getName(psychCatalog, pt.catalogTestId)}</Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                      {data.observations?.psicologica && <ReadField label="Observaciones Psicológicas" value={data.observations.psicologica} />}
                    </Stack>
                  </SectionCard>
                </Stack>
              </Grid>
              <Grid size={4}>
                <SectionCard title="Atendido por">
                  <Stack spacing={1.5} divider={<Divider />}>
                    <ReadField label="Registrado en sistema por" value={getUserName(data.systemAttendedById)} />
                    <ReadField label="Atendido presencialmente (Psicológica)" value={getUserName(data.psychologicalAttendedById)} />
                  </Stack>
                </SectionCard>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </AppLayout>
  );
}
