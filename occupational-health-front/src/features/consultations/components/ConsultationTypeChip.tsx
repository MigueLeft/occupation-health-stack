import { Chip } from '@mui/material';
import type { ConsultationType } from '../types';
import { CONSULTATION_TYPE_LABELS } from '../types';

const TYPE_STYLES: Record<ConsultationType, { color: string; bgcolor: string }> = {
  Medica:      { color: '#6D28D9', bgcolor: '#EDE9FE' },
  Psicologica: { color: '#1D4ED8', bgcolor: '#DBEAFE' },
};

export function ConsultationTypeChip({ type }: { type: ConsultationType }) {
  const style = TYPE_STYLES[type];
  return (
    <Chip
      label={CONSULTATION_TYPE_LABELS[type]}
      size="small"
      sx={{ bgcolor: style.bgcolor, color: style.color, fontWeight: 600, fontSize: '0.75rem' }}
    />
  );
}
