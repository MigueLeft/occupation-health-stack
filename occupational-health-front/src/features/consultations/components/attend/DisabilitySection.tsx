import { Box, Typography, Paper, FormControlLabel, Checkbox, Stack, Autocomplete, TextField } from '@mui/material';
import { AccessibilityNewOutlined } from '@mui/icons-material';
import type { Disability } from '@/features/catalogs/types';

interface Props {
  hasDisability: boolean;
  onHasDisabilityChange: (v: boolean) => void;
  disabilityId: string;
  onDisabilityIdChange: (v: string) => void;
  disabilities: Disability[];
}

export function DisabilitySection({
  hasDisability, onHasDisabilityChange, disabilityId, onDisabilityIdChange, disabilities,
}: Props) {
  const selected = disabilities.find((d) => d.id === disabilityId) ?? null;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AccessibilityNewOutlined sx={{ color: 'primary.main' }} />
        <Typography variant="h3" sx={{ fontSize: '1rem' }}>Discapacidad</Typography>
      </Box>

      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={hasDisability}
              onChange={(e) => {
                onHasDisabilityChange(e.target.checked);
                if (!e.target.checked) onDisabilityIdChange('');
              }}
            />
          }
          label="El paciente presenta discapacidad"
        />

        {hasDisability && (
          <Autocomplete
            options={disabilities}
            getOptionLabel={(d) => d.name}
            value={selected}
            onChange={(_, d) => onDisabilityIdChange(d?.id ?? '')}
            size="small"
            sx={{ maxWidth: 320 }}
            renderInput={(params) => (
              <TextField {...params} label="Tipo de discapacidad" placeholder="Buscar discapacidad..." />
            )}
          />
        )}
      </Stack>
    </Paper>
  );
}
