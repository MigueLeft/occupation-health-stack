import { Box, Typography, Paper, FormControlLabel, Checkbox, TextField, Stack, MenuItem, Autocomplete } from '@mui/material';
import { HotelOutlined } from '@mui/icons-material';

const REST_PERIOD_REASONS = [
  'Accidente Comun',
  'Accidente Laboral',
  'Enfermedad Comun',
  'Enfermedad Laboral',
  'Maternidad',
  'Otro',
] as const;

interface DiagnosedDisease {
  id: string;
  name: string;
}

interface Props {
  requiresRest: boolean;
  onRequiresRestChange: (v: boolean) => void;
  days: number | '';
  onDaysChange: (v: number | '') => void;
  reason: string;
  onReasonChange: (v: string) => void;
  diseaseId: string;
  onDiseaseIdChange: (v: string) => void;
  diagnosedDiseases: DiagnosedDisease[];
}

export function RestPeriodSection({
  requiresRest, onRequiresRestChange, days, onDaysChange,
  reason, onReasonChange, diseaseId, onDiseaseIdChange, diagnosedDiseases,
}: Props) {
  const selectedDisease = diagnosedDiseases.find((d) => d.id === diseaseId) ?? null;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <HotelOutlined sx={{ color: 'primary.main' }} />
        <Typography variant="h3" sx={{ fontSize: '1rem' }}>Reposo Médico</Typography>
      </Box>

      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={requiresRest}
              onChange={(e) => {
                onRequiresRestChange(e.target.checked);
                if (!e.target.checked) {
                  onDaysChange('');
                  onReasonChange('');
                  onDiseaseIdChange('');
                }
              }}
            />
          }
          label="El paciente requiere reposo"
        />

        {requiresRest && (
          <>
            <TextField
              label="Número de días de reposo"
              type="number"
              size="small"
              value={days}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onDaysChange(isNaN(val) || val < 1 ? '' : val);
              }}
              slotProps={{ htmlInput: { min: 1, max: 365 } }}
              placeholder="Ej: 7"
              sx={{ maxWidth: 220 }}
            />

            <TextField
              select
              label="Motivo del reposo"
              size="small"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              sx={{ maxWidth: 280 }}
            >
              <MenuItem value=""><em>Sin especificar</em></MenuItem>
              {REST_PERIOD_REASONS.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>

            {diagnosedDiseases.length > 0 && (
              <Autocomplete
                options={diagnosedDiseases}
                getOptionLabel={(d) => d.name}
                value={selectedDisease}
                onChange={(_, d) => onDiseaseIdChange(d?.id ?? '')}
                size="small"
                sx={{ maxWidth: 320 }}
                renderInput={(params) => (
                  <TextField {...params} label="Enfermedad relacionada (opcional)" placeholder="Seleccionar diagnóstico..." />
                )}
              />
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
}
