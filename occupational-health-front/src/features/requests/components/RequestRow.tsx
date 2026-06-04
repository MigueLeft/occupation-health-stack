import { TableRow, TableCell, Avatar, Box, Typography, IconButton, Tooltip } from '@mui/material';
import { EditOutlined, PersonRemoveOutlined } from '@mui/icons-material';
import type { AppRequestWithPatient } from '../types';
import { EVALUATION_REASON_LABELS, CONSULTATION_TYPE_LABELS } from '../types';
import { RequestStatusChip } from './RequestStatusChip';

interface Props {
  request: AppRequestWithPatient;
  onEdit: (request: AppRequestWithPatient) => void;
  onNoAsistio: (request: AppRequestWithPatient) => void;
  canEdit?: boolean;
}

const TRUNCATE = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const;

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export function RequestRow({ request, onEdit, onNoAsistio, canEdit = true }: Props) {
  const isConsulta = request.evaluationReason === 'Consulta';
  const reasonLabel = EVALUATION_REASON_LABELS[request.evaluationReason] ?? request.evaluationReason;
  const isActionable = request.status !== 'En Proceso' && request.status !== 'Finalizada';

  return (
    <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
      <TableCell sx={{ maxWidth: 200 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Avatar sx={{ width: 36, height: 36, flexShrink: 0, bgcolor: 'primary.light', color: 'primary.main', fontSize: '0.8rem' }}>
            {getInitials(request.patientName)}
          </Avatar>
          <Tooltip title={request.patientName} placement="top-start">
            <Typography variant="body2" sx={{ fontWeight: 600, ...TRUNCATE }}>
              {request.patientName}
            </Typography>
          </Tooltip>
        </Box>
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2" color="text.secondary">{formatDate(request.requestDate)}</Typography>
      </TableCell>
      <TableCell sx={{ maxWidth: 160 }}>
        <Tooltip title={reasonLabel} placement="top-start">
          <Typography variant="body2" color="text.secondary" sx={TRUNCATE}>
            {reasonLabel}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ maxWidth: 160 }}>
        {isConsulta && request.scheduledConsultationType ? (
          <Tooltip title={CONSULTATION_TYPE_LABELS[request.scheduledConsultationType]} placement="top-start">
            <Typography variant="body2" color="text.secondary" sx={TRUNCATE}>
              {CONSULTATION_TYPE_LABELS[request.scheduledConsultationType]}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.disabled">—</Typography>
        )}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <RequestStatusChip status={request.status} />
      </TableCell>
      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
        {canEdit && isActionable && (
          <>
            <Tooltip title="Editar">
              <IconButton size="small" onClick={() => onEdit(request)} sx={{ color: 'text.secondary' }}>
                <EditOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Marcar como No asistió">
              <IconButton size="small" onClick={() => onNoAsistio(request)} sx={{ color: 'text.secondary' }}>
                <PersonRemoveOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </TableCell>
    </TableRow>
  );
}
