import { Box, Typography, TextField, Stack, Divider, Autocomplete } from '@mui/material';
import { FilterAltOutlined } from '@mui/icons-material';
import { PeriodPresetSelector, type PeriodState } from './PeriodPresetSelector';

interface Props {
  dateFrom: string;
  dateTo: string;
  companyId: string;
  companies: { id: string; name: string }[];
  period: PeriodState;
  isPresetActive: boolean;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onCompanyChange: (v: string) => void;
  onPeriodChange: (updates: Partial<PeriodState>) => void;
}

export function ReportFilters({
  dateFrom, dateTo, companyId, companies, period, isPresetActive,
  onDateFromChange, onDateToChange, onCompanyChange, onPeriodChange,
}: Props) {
  return (
    <Stack spacing={2}>
      <PeriodPresetSelector value={period} onChange={onPeriodChange} />

      <Divider />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FilterAltOutlined fontSize="small" color="action" />
        <Typography variant="subtitle2" color="text.secondary">Filtros adicionales</Typography>
      </Box>

      <Stack direction="row" spacing={2}>
        <TextField
          label="Fecha desde" type="date" size="small" fullWidth
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          disabled={isPresetActive}
          slotProps={{ inputLabel: { shrink: true } }}
          helperText={isPresetActive ? 'Calculado por el período' : undefined}
        />
        <TextField
          label="Fecha hasta" type="date" size="small" fullWidth
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          disabled={isPresetActive}
          slotProps={{ inputLabel: { shrink: true } }}
          helperText={isPresetActive ? 'Calculado por el período' : undefined}
        />
      </Stack>

      <Autocomplete
        options={companies}
        getOptionLabel={(c) => c.name}
        value={companies.find((c) => c.id === companyId) ?? null}
        onChange={(_, company) => onCompanyChange(company?.id ?? '')}
        size="small"
        renderInput={(params) => (
          <TextField {...params} label="Empresa (todas si no se selecciona)" />
        )}
      />
    </Stack>
  );
}
