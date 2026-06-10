import { TableRow, TableCell, Box, Typography, Button, Tooltip } from '@mui/material';
import { MedicalServicesOutlined } from '@mui/icons-material';
import { useNavigate } from '@tanstack/react-router';
import { RequestStatusChip } from '@/features/requests/components/RequestStatusChip';
import { EVALUATION_REASON_LABELS } from '@/features/requests/types';
import type { ConsultationWithDetails } from '../types';
import { ConsultationTypeChip } from './ConsultationTypeChip';

interface Props {
  consultation: ConsultationWithDetails;
}

const TRUNCATE = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const;

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ConsultationRow({ consultation }: Props) {
  const navigate = useNavigate();
  const canAttend = consultation.requestStatus !== 'Finalizada' && consultation.requestStatus !== 'No asistio';
  const reasonLabel = EVALUATION_REASON_LABELS[consultation.evaluationReason] ?? consultation.evaluationReason;

  return (
    <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
      <TableCell sx={{ maxWidth: 200 }}>
        <Tooltip title={consultation.patientName} placement="top-start">
          <Typography variant="body2" sx={{ fontWeight: 600, ...TRUNCATE }}>
            {consultation.patientName}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2" color="text.secondary">{formatDate(consultation.requestDate)}</Typography>
      </TableCell>
      <TableCell sx={{ maxWidth: 160 }}>
        <Tooltip title={reasonLabel} placement="top-start">
          <Typography variant="body2" color="text.secondary" sx={TRUNCATE}>
            {reasonLabel}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ maxWidth: 180, overflow: 'hidden' }}>
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Tooltip title={consultation.companyName ?? ''} placement="top-start">
            <Typography variant="body2" sx={{ fontWeight: 500, ...TRUNCATE }}>
              {consultation.companyName || '—'}
            </Typography>
          </Tooltip>
          {consultation.positionName && (
            <Tooltip title={consultation.positionName} placement="top-start">
              <Typography variant="caption" color="text.secondary" sx={TRUNCATE}>
                {consultation.positionName}
              </Typography>
            </Tooltip>
          )}
        </Box>
      </TableCell>
      <TableCell><ConsultationTypeChip type={consultation.type} /></TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}><RequestStatusChip status={consultation.requestStatus} /></TableCell>
      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
        {canAttend && (
          <Button variant="contained" size="medium"
            startIcon={<MedicalServicesOutlined />}
            onClick={() => navigate({ to: '/consultas/$id/atender', params: { id: consultation.id } })}
            sx={{ textTransform: 'none' }}
          >
            Atender
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
