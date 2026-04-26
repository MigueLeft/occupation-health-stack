import { Stack, TextField, MenuItem, InputAdornment } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import { CONSULTATION_TYPES, CONSULTATION_TYPE_LABELS, CONSULTATION_RESULTS, PSYCHOLOGICAL_RESULTS, CONSULTATION_STATUSES } from '../types';
import type { ConsultationType, ConsultationResultUnion, ConsultationStatus } from '../types';

export interface ConsultationFilters {
  search: string;
  tipo: ConsultationType | 'all';
  resultado: ConsultationResultUnion | 'all';
  status: ConsultationStatus | 'active' | 'all';
}

interface Props {
  filters: ConsultationFilters;
  onChange: (f: ConsultationFilters) => void;
}

const ALL_RESULTS = [...CONSULTATION_RESULTS, ...PSYCHOLOGICAL_RESULTS] as ConsultationResultUnion[];

export function ConsultationFilters({ filters, onChange }: Props) {
  const set = <K extends keyof ConsultationFilters>(key: K, value: ConsultationFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <TextField
        placeholder="Buscar..."
        size="small"
        value={filters.search}
        onChange={(e) => set('search', e.target.value)}
        sx={{ minWidth: 220 }}
        slotProps={{
          input: { startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> },
        }}
      />

      <TextField select size="small" value={filters.tipo} onChange={(e) => set('tipo', e.target.value as ConsultationType | 'all')} sx={{ minWidth: 150 }}>
        <MenuItem value="all">Tipo</MenuItem>
        {CONSULTATION_TYPES.map((t) => (
          <MenuItem key={t} value={t}>{CONSULTATION_TYPE_LABELS[t]}</MenuItem>
        ))}
      </TextField>

      <TextField select size="small" value={filters.resultado} onChange={(e) => set('resultado', e.target.value as ConsultationResultUnion | 'all')} sx={{ minWidth: 180 }}>
        <MenuItem value="all">Resultado</MenuItem>
        {ALL_RESULTS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
      </TextField>

      <TextField select size="small" value={filters.status} onChange={(e) => set('status', e.target.value as ConsultationStatus | 'active' | 'all')} sx={{ minWidth: 160 }}>
        <MenuItem value="active">Activas</MenuItem>
        <MenuItem value="all">Todas</MenuItem>
        {CONSULTATION_STATUSES.map((s) => (
          <MenuItem key={s} value={s}>{s}</MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
