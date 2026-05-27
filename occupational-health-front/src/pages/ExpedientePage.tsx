import { Box, Typography, Avatar, CircularProgress, Chip, Table, TableHead, TableBody, TableRow, TableCell, IconButton, Tooltip } from '@mui/material';
import { usePageTitle } from '@/hooks/usePageTitle';
import { VisibilityOutlined } from '@mui/icons-material';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/AppLayout';
import { usePatient } from '@/features/patients/hooks/usePatient';
import { useConsultations } from '@/features/consultations/hooks/useConsultations';
import { consultationDisabilitiesService } from '@/features/consultations/services/disabilities.service';
import { ConsultationTypeChip } from '@/features/consultations/components/ConsultationTypeChip';
import { ConsultationResultChip } from '@/features/consultations/components/ConsultationResultChip';
import { RequestStatusChip } from '@/features/requests/components/RequestStatusChip';
import { EVALUATION_REASON_LABELS } from '@/features/requests/types';

function calcAge(birthDate: string): number {
  const [y, m, d] = birthDate.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
  return age;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatBirthDate(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const HAND_LABELS: Record<string, string> = { right: 'Derecha', left: 'Izquierda', both: 'Ambas' };
const SEX_LABELS: Record<string, string> = { M: 'Masculino (M)', Masculino: 'Masculino (M)', F: 'Femenino (F)', Femenino: 'Femenino (F)' };

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  const isString = typeof value === 'string';
  return (
    <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider', minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.68rem' }}>
        {label}
      </Typography>
      {isString ? (
        <Tooltip title={value.length > 48 ? value : ''} placement="top-start" disableHoverListener={value.length <= 48}>
          <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value}
          </Typography>
        </Tooltip>
      ) : (
        <Box sx={{ mt: 0.25 }}>{value}</Box>
      )}
    </Box>
  );
}

export function ExpedientePage() {
  usePageTitle('Expediente');

  const { cedula } = useParams({ strict: false }) as { cedula: string };
  const navigate = useNavigate();
  const { data: patient, isLoading: patientLoading } = usePatient(cedula);
  const { data: consultations = [], isLoading: consultLoading } = useConsultations();
  const { data: patientDisabilities = [] } = useQuery({
    queryKey: ['patient-disabilities', cedula],
    queryFn: () => consultationDisabilitiesService.getByPatient(cedula),
  });

  const patientConsultations = consultations.filter((c) => c.patientId === cedula);
  const isLoading = patientLoading || consultLoading;

  if (isLoading) {
    return <AppLayout><Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box></AppLayout>;
  }

  if (!patient) {
    return (
      <AppLayout>
        <Box sx={{ px: 4, pt: 4 }}>
          <Typography color="text.secondary">Paciente no encontrado.</Typography>
        </Box>
      </AppLayout>
    );
  }

  const initials = `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase();
  const age = patient.birthDate ? calcAge(patient.birthDate) : null;

  return (
    <AppLayout>
      <Box sx={{ px: 4, pt: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate({ to: '/pacientes' })}>
          Pacientes
        </Typography>
        <Typography variant="body2" color="text.secondary">›</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>Expediente</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, p: 3, alignItems: 'flex-start' }}>
        {/* Left panel */}
        <Box sx={{ width: 320, flexShrink: 0 }}>
          {/* Patient card */}
          <Box sx={{ bgcolor: 'primary.main', borderRadius: 3, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 0 }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '1.5rem', mb: 1.5 }}>
              {initials}
            </Avatar>
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', textAlign: 'center' }}>
              {patient.firstName} {patient.lastName}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{patient.cedula}</Typography>
          </Box>

          {/* Info fields */}
          <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
            <InfoField label="Empresa" value={patient.company?.name ?? '—'} />
            <InfoField label="Cargo" value={patient.position?.name ?? '—'} />
            <InfoField label="Fecha de Nacimiento" value={patient.birthDate ? `${formatBirthDate(patient.birthDate)}${age !== null ? `  (${age} años)` : ''}` : '—'} />
            <InfoField label="Sexo" value={patient.sex ? (SEX_LABELS[patient.sex] ?? patient.sex) : '—'} />
            <InfoField label="Grupo Sanguíneo / Mano Dom." value={`${patient.bloodType ?? '—'} / ${HAND_LABELS[patient.dominantHand ?? ''] ?? patient.dominantHand ?? '—'}`} />
            <InfoField label="Usa lentes" value={patient.usesGlasses == null ? '—' : patient.usesGlasses ? 'Sí' : 'No'} />
            <InfoField label="Contacto de Emergencia" value={
              patient.emergencyContact
                ? `${patient.emergencyContact.name} (${patient.emergencyContact.relationship}) — ${patient.emergencyContact.phone}`
                : '—'
            } />
            <InfoField
              label="Alergias"
              value={
                patient.allergies?.length
                  ? <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>{patient.allergies.map((a) => <Chip key={a.id} label={a.name} size="small" />)}</Box>
                  : <Typography variant="caption" color="text.disabled">Sin alergias registradas</Typography>
              }
            />
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.68rem' }}>
                Enfermedades Crónicas
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                {patient.diseases?.length
                  ? <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{patient.diseases.map((d) => <Chip key={d.id} label={d.name} size="small" />)}</Box>
                  : <Typography variant="caption" color="text.disabled">Sin enfermedades registradas</Typography>
                }
              </Box>
            </Box>
            {patientDisabilities.length > 0 && (
              <Box sx={{ px: 2.5, py: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.68rem' }}>
                  Discapacidades
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {patientDisabilities.map((d) => <Chip key={d.id} label={d.name} size="small" />)}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right panel */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h2" sx={{ fontSize: '1.15rem' }}>Historial de Consultas</Typography>
            <Chip label={`${patientConsultations.length} consulta${patientConsultations.length !== 1 ? 's' : ''}`} size="small" sx={{ bgcolor: 'primary.50', color: 'primary.main', fontWeight: 600 }} />
          </Box>

          <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  {['Fecha', 'Motivo', 'Tipo', 'Resultado', 'Estatus', 'Acc.'].map((h) => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 600, py: 1.5, borderBottom: 'none' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {patientConsultations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      Sin consultas registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  patientConsultations.map((c) => (
                    <TableRow key={c.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell><Typography variant="body2" color="text.secondary">{formatDate(c.requestDate)}</Typography></TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{EVALUATION_REASON_LABELS[c.evaluationReason] ?? c.evaluationReason}</Typography></TableCell>
                      <TableCell><ConsultationTypeChip type={c.type} /></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {c.consultationResult && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 18 }}>M:</Typography>
                              <ConsultationResultChip result={c.consultationResult} />
                            </Box>
                          )}
                          {c.psychologicalAptitude && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 18 }}>P:</Typography>
                              <ConsultationResultChip result={c.psychologicalAptitude as import('@/features/consultations/types').ConsultationResultUnion} />
                            </Box>
                          )}
                          {!c.consultationResult && !c.psychologicalAptitude && (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell><RequestStatusChip status={c.requestStatus} /></TableCell>
                      <TableCell>
                        <Tooltip title="Ver consulta">
                          <IconButton size="small" onClick={() => navigate({ to: '/expedientes/$cedula/consultas/$id', params: { cedula, id: c.id } })} sx={{ color: 'text.secondary' }}>
                            <VisibilityOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        </Box>
      </Box>
    </AppLayout>
  );
}
