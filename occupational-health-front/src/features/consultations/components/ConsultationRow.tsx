import { TableRow, TableCell, Avatar, Box, Typography, Button } from '@mui/material';
import { MedicalServicesOutlined } from '@mui/icons-material';
import { useNavigate } from '@tanstack/react-router';
import { RequestStatusChip } from '@/features/requests/components/RequestStatusChip';
import { EVALUATION_REASON_LABELS } from '@/features/requests/types';
import type { ConsultationWithDetails } from '../types';
import { ConsultationTypeChip } from './ConsultationTypeChip';
import { ConsultationResultChip } from './ConsultationResultChip';

interface Props {
  consultation: ConsultationWithDetails;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export function ConsultationRow({ consultation }: Props) {
  const navigate = useNavigate();
  const result = consultation.type === 'Medica'
    ? consultation.consultationResult
    : consultation.psychologicalResult;

  const canAttend = consultation.requestStatus !== 'Finalizada' && consultation.requestStatus !== 'No asistio';

  return (
    <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', color: 'primary.main', fontSize: '0.8rem' }}>
            {getInitials(consultation.patientName)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{consultation.patientName}</Typography>
        </Box>
      </TableCell>
      <TableCell><Typography variant="body2" color="text.secondary">{formatDate(consultation.requestDate)}</Typography></TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {EVALUATION_REASON_LABELS[consultation.evaluationReason] ?? consultation.evaluationReason}
        </Typography>
      </TableCell>
      <TableCell><ConsultationTypeChip type={consultation.type} /></TableCell>
      <TableCell><ConsultationResultChip result={result} /></TableCell>
      <TableCell><RequestStatusChip status={consultation.requestStatus} /></TableCell>
      <TableCell align="right">
        {canAttend && (
          <Button variant="contained" size="small"
            startIcon={<MedicalServicesOutlined fontSize="small" />}
            onClick={() => navigate({ to: '/consultas/$id/atender', params: { id: consultation.id } })}
            sx={{ textTransform: 'none', fontSize: '0.8rem' }}
          >
            Atender
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
