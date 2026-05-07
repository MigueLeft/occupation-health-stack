import { Box, Typography, Paper, FormControlLabel, Checkbox, Stack, Autocomplete, TextField } from '@mui/material';
import { LocalHospitalOutlined } from '@mui/icons-material';
import type { MedicalSpecialty } from '@/features/catalogs/types';

interface Props {
  requiresReferral: boolean;
  onRequiresReferralChange: (v: boolean) => void;
  specialtyId: string;
  onSpecialtyIdChange: (v: string) => void;
  specialties: MedicalSpecialty[];
}

export function ReferralSection({
  requiresReferral, onRequiresReferralChange, specialtyId, onSpecialtyIdChange, specialties,
}: Props) {
  const selected = specialties.find((s) => s.id === specialtyId) ?? null;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LocalHospitalOutlined sx={{ color: 'primary.main' }} />
        <Typography variant="h3" sx={{ fontSize: '1rem' }}>Referir a Especialista</Typography>
      </Box>

      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={requiresReferral}
              onChange={(e) => {
                onRequiresReferralChange(e.target.checked);
                if (!e.target.checked) onSpecialtyIdChange('');
              }}
            />
          }
          label="El paciente requiere referencia a especialista"
        />

        {requiresReferral && (
          <Autocomplete
            options={specialties}
            getOptionLabel={(s) => s.name}
            value={selected}
            onChange={(_, s) => onSpecialtyIdChange(s?.id ?? '')}
            size="small"
            sx={{ maxWidth: 320 }}
            renderInput={(params) => (
              <TextField {...params} label="Especialidad médica" placeholder="Buscar especialidad..." />
            )}
          />
        )}
      </Stack>
    </Paper>
  );
}
