import { TableRow, TableCell, Avatar, Box, Typography, IconButton, Tooltip } from '@mui/material';
import { VisibilityOutlined, EditOutlined, PersonRemoveOutlined } from '@mui/icons-material';
import type { AppRequestWithPatient } from '../types';
import { EVALUATION_REASON_LABELS, CONSULTATION_TYPE_LABELS } from '../types';
import { RequestStatusChip } from './RequestStatusChip';

interface Props {
  request: AppRequestWithPatient;
  onEdit: (request: AppRequestWithPatient) => void;
  onNoAsistio: (request: AppRequestWithPatient) => void;
  onView: (request: AppRequestWithPatient) => void;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export function RequestRow({ request, onEdit, onNoAsistio, onView }: Props) {
  const isConsulta = request.evaluationReason === 'Consulta';

  return (
    <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', color: 'primary.main', fontSize: '0.8rem' }}>
            {getInitials(request.patientName)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{request.patientName}</Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">{formatDate(request.requestDate)}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {EVALUATION_REASON_LABELS[request.evaluationReason] ?? request.evaluationReason}
        </Typography>
      </TableCell>
      <TableCell>
        {isConsulta && request.scheduledConsultationType ? (
          <Typography variant="body2" color="text.secondary">
            {CONSULTATION_TYPE_LABELS[request.scheduledConsultationType]}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">—</Typography>
        )}
      </TableCell>
      <TableCell>
        <RequestStatusChip status={request.status} />
      </TableCell>
      <TableCell align="right">
        <Tooltip title="Ver detalles">
          <IconButton size="small" onClick={() => onView(request)} sx={{ color: 'text.secondary' }}>
            <VisibilityOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
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
      </TableCell>
    </TableRow>
  );
}
