import { TableRow, TableCell, Avatar, Box, Typography, Button, Tooltip } from '@mui/material';
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

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export function ConsultationRow({ consultation }: Props) {
  const navigate = useNavigate();
  const canAttend = consultation.requestStatus !== 'Finalizada' && consultation.requestStatus !== 'No asistio';
  const reasonLabel = EVALUATION_REASON_LABELS[consultation.evaluationReason] ?? consultation.evaluationReason;

  const empresaLabel = [consultation.companyName, consultation.positionName].filter(Boolean).join(' · ') || '—';

  return (
    <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
      <TableCell sx={{ maxWidth: 200 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Avatar sx={{ width: 36, height: 36, flexShrink: 0, bgcolor: 'primary.light', color: 'primary.main', fontSize: '0.8rem' }}>
            {getInitials(consultation.patientName)}
          </Avatar>
          <Tooltip title={consultation.patientName} placement="top-start">
            <Typography variant="body2" sx={{ fontWeight: 600, ...TRUNCATE }}>
              {consultation.patientName}
            </Typography>
          </Tooltip>
        </Box>
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
      <TableCell sx={{ maxWidth: 180 }}>
        <Tooltip title={empresaLabel} placement="top-start">
          <Typography variant="body2" color="text.secondary" sx={TRUNCATE}>
            {empresaLabel}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}><ConsultationTypeChip type={consultation.type} /></TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}><RequestStatusChip status={consultation.requestStatus} /></TableCell>
      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
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
