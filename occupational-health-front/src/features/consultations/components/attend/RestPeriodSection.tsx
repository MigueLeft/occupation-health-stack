import { Box, Typography, Paper, FormControlLabel, Checkbox, TextField, Stack } from '@mui/material';
import { HotelOutlined } from '@mui/icons-material';

interface Props {
  requiresRest: boolean;
  onRequiresRestChange: (v: boolean) => void;
  days: number | '';
  onDaysChange: (v: number | '') => void;
}

export function RestPeriodSection({ requiresRest, onRequiresRestChange, days, onDaysChange }: Props) {
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
                if (!e.target.checked) onDaysChange('');
              }}
            />
          }
          label="El paciente requiere reposo"
        />

        {requiresRest && (
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
        )}
      </Stack>
    </Paper>
  );
}
