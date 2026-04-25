import { Chip, Typography } from '@mui/material';
import type { ConsultationResultUnion } from '../types';

const RESULT_STYLES: Record<string, { color: string; bgcolor: string }> = {
  'Apto':              { color: '#059669', bgcolor: '#D1FAE5' },
  'No Apto':           { color: '#DC2626', bgcolor: '#FEE2E2' },
  'Apto Condicionado': { color: '#D97706', bgcolor: '#FEF3C7' },
  'Completada':        { color: '#059669', bgcolor: '#D1FAE5' },
  'En Espera':         { color: '#D97706', bgcolor: '#FEF3C7' },
  'Incompleta':        { color: '#6B7280', bgcolor: '#F3F4F6' },
};

interface Props {
  result?: ConsultationResultUnion | null;
}

export function ConsultationResultChip({ result }: Props) {
  if (!result) return <Typography variant="body2" color="text.disabled">—</Typography>;
  const style = RESULT_STYLES[result] ?? { color: '#6B7280', bgcolor: '#F3F4F6' };
  return (
    <Chip
      label={result}
      size="small"
      sx={{ bgcolor: style.bgcolor, color: style.color, fontWeight: 600, fontSize: '0.75rem' }}
    />
  );
}
