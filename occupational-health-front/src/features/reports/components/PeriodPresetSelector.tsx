import { Box, Typography, TextField, MenuItem, Stack } from '@mui/material';
import { CalendarMonthOutlined } from '@mui/icons-material';
import {
  type PeriodType,
  YEAR_OPTIONS, MONTH_OPTIONS, QUARTER_OPTIONS, SEMESTER_OPTIONS,
} from '../utils/period-dates';

export interface PeriodState {
  periodType: PeriodType;
  year: string;
  month: string;
  quarter: string;
  semester: string;
}

interface Props {
  value: PeriodState;
  onChange: (updates: Partial<PeriodState>) => void;
}

export function PeriodPresetSelector({ value, onChange }: Props) {
  const { periodType, year, month, quarter, semester } = value;

  const handleTypeChange = (next: PeriodType) => {
    onChange({ periodType: next, year: '', month: '', quarter: '', semester: '' });
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CalendarMonthOutlined fontSize="small" color="action" />
        <Typography variant="subtitle2" color="text.secondary">Período predefinido</Typography>
      </Box>

      <TextField
        select label="Tipo de período" size="small" fullWidth
        value={periodType}
        onChange={(e) => handleTypeChange(e.target.value as PeriodType)}
      >
        <MenuItem value="none">Personalizado (rango libre)</MenuItem>
        <MenuItem value="monthly">Mensual</MenuItem>
        <MenuItem value="quarterly">Trimestral</MenuItem>
        <MenuItem value="semiannual">Semestral</MenuItem>
        <MenuItem value="annual">Anual</MenuItem>
      </TextField>

      {periodType !== 'none' && (
        <Stack direction="row" spacing={2}>
          {periodType === 'monthly' && (
            <TextField select label="Mes" size="small" fullWidth value={month}
              onChange={(e) => onChange({ month: e.target.value })}>
              <MenuItem value=""><em>Seleccionar mes</em></MenuItem>
              {MONTH_OPTIONS.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </TextField>
          )}
          {periodType === 'quarterly' && (
            <TextField select label="Trimestre" size="small" fullWidth value={quarter}
              onChange={(e) => onChange({ quarter: e.target.value })}>
              <MenuItem value=""><em>Seleccionar trimestre</em></MenuItem>
              {QUARTER_OPTIONS.map((q) => (
                <MenuItem key={q.value} value={q.value}>{q.label}</MenuItem>
              ))}
            </TextField>
          )}
          {periodType === 'semiannual' && (
            <TextField select label="Semestre" size="small" fullWidth value={semester}
              onChange={(e) => onChange({ semester: e.target.value })}>
              <MenuItem value=""><em>Seleccionar semestre</em></MenuItem>
              {SEMESTER_OPTIONS.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </TextField>
          )}
          <TextField select label="Año" size="small" fullWidth value={year}
            onChange={(e) => onChange({ year: e.target.value })}>
            <MenuItem value=""><em>Seleccionar año</em></MenuItem>
            {YEAR_OPTIONS.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </TextField>
        </Stack>
      )}
    </Stack>
  );
}
