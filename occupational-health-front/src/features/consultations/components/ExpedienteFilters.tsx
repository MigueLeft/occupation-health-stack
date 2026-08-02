import { Stack, TextField, MenuItem } from '@mui/material';
import { CONSULTATION_RESULTS, PSYCHOLOGICAL_RESULTS } from '../types';
import type { ConsultationResultUnion } from '../types';
import { EVALUATION_REASONS, EVALUATION_REASON_LABELS } from '@/features/requests/types';
import type { EvaluationReason } from '@/features/requests/types';

export interface ExpedienteFilters {
  fecha: string;
  motivo: EvaluationReason | 'all';
  resultado: ConsultationResultUnion | 'all';
}

interface Props {
  filters: ExpedienteFilters;
  onChange: (f: ExpedienteFilters) => void;
}

const ALL_RESULTS = [...CONSULTATION_RESULTS, ...PSYCHOLOGICAL_RESULTS] as ConsultationResultUnion[];

export function ExpedienteFilters({ filters, onChange }: Props) {
  const set = <K extends keyof ExpedienteFilters>(key: K, value: ExpedienteFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <TextField
        label="Fecha"
        type="date"
        size="small"
        value={filters.fecha}
        onChange={(e) => set('fecha', e.target.value)}
        sx={{ minWidth: 170 }}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <TextField
        select
        size="small"
        value={filters.motivo}
        onChange={(e) => set('motivo', e.target.value as EvaluationReason | 'all')}
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="all">Tipo de evaluación</MenuItem>
        {EVALUATION_REASONS.map((r) => (
          <MenuItem key={r} value={r}>{EVALUATION_REASON_LABELS[r]}</MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        value={filters.resultado}
        onChange={(e) => set('resultado', e.target.value as ConsultationResultUnion | 'all')}
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="all">Resultado</MenuItem>
        {ALL_RESULTS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
      </TextField>
    </Stack>
  );
}
