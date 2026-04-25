import { Chip } from '@mui/material';
import type { RequestStatus } from '../types';
import { REQUEST_STATUS_LABELS } from '../types';

const STATUS_STYLES: Record<RequestStatus, { color: string; bgcolor: string }> = {
  'Pendiente':  { color: '#D97706', bgcolor: '#FEF3C7' },
  'En Proceso': { color: '#7C3AED', bgcolor: '#EDE9FE' },
  'Finalizada': { color: '#059669', bgcolor: '#D1FAE5' },
  'No asistio': { color: '#DC2626', bgcolor: '#FEE2E2' },
};

interface Props {
  status: RequestStatus;
}

export function RequestStatusChip({ status }: Props) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES['Pendiente'];
  return (
    <Chip
      label={`● ${REQUEST_STATUS_LABELS[status]}`}
      size="small"
      sx={{ bgcolor: style.bgcolor, color: style.color, fontWeight: 600, fontSize: '0.75rem' }}
    />
  );
}
