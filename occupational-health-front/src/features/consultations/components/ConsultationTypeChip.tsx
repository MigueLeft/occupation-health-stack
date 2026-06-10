import { Chip, Box } from '@mui/material';
import type { ConsultationType } from '../types';

const TYPE_STYLES: Record<ConsultationType, { color: string; bgcolor: string }> = {
  Medica:               { color: '#6D28D9', bgcolor: '#EDE9FE' },
  Psicologica:          { color: '#1D4ED8', bgcolor: '#DBEAFE' },
  'Medica/Psicologica': { color: '#0F766E', bgcolor: '#CCFBF1' },
};

const MIXED_LABEL = (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.3, py: 0.25 }}>
    <span>Médica</span>
    <span>Psicológica</span>
  </Box>
);

export function ConsultationTypeChip({ type }: { type: ConsultationType }) {
  const style = TYPE_STYLES[type];
  const label = type === 'Medica/Psicologica'
    ? MIXED_LABEL
    : type === 'Medica' ? 'Médica' : 'Psicológica';

  return (
    <Chip
      label={label}
      size="small"
      sx={{ bgcolor: style.bgcolor, color: style.color, fontWeight: 600, fontSize: '0.75rem', height: 'auto' }}
    />
  );
}
