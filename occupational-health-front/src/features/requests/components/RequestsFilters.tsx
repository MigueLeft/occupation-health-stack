import { Stack, TextField, MenuItem, InputAdornment } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import { EVALUATION_REASONS, EVALUATION_REASON_LABELS, REQUEST_STATUSES, REQUEST_STATUS_LABELS } from '../types';
import type { EvaluationReason, RequestStatus } from '../types';

export type DateFilter = 'all' | 'today' | 'week' | 'month';

export interface RequestFilters {
  search: string;
  dateFilter: DateFilter;
  motivo: EvaluationReason | 'all';
  status: RequestStatus | 'all';
}

interface Props {
  filters: RequestFilters;
  onChange: (filters: RequestFilters) => void;
}

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'Fecha' },
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
];

export function RequestsFilters({ filters, onChange }: Props) {
  const set = <K extends keyof RequestFilters>(key: K, value: RequestFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <TextField
        placeholder="Buscar solicitud..."
        size="small"
        value={filters.search}
        onChange={(e) => set('search', e.target.value)}
        sx={{ minWidth: 220 }}
        slotProps={{
          input: { startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> },
        }}
      />

      <TextField select size="small" value={filters.dateFilter} onChange={(e) => set('dateFilter', e.target.value as DateFilter)} sx={{ minWidth: 150 }}>
        {DATE_OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        ))}
      </TextField>

      <TextField select size="small" value={filters.motivo} onChange={(e) => set('motivo', e.target.value as EvaluationReason | 'all')} sx={{ minWidth: 180 }}>
        <MenuItem value="all">Motivo</MenuItem>
        {EVALUATION_REASONS.map((r) => (
          <MenuItem key={r} value={r}>{EVALUATION_REASON_LABELS[r]}</MenuItem>
        ))}
      </TextField>

      <TextField select size="small" value={filters.status} onChange={(e) => set('status', e.target.value as RequestStatus | 'all')} sx={{ minWidth: 160 }}>
        <MenuItem value="all">Estatus</MenuItem>
        {REQUEST_STATUSES.map((s) => (
          <MenuItem key={s} value={s}>{REQUEST_STATUS_LABELS[s]}</MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
