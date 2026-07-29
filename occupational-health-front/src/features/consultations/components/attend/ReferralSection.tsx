import { Box, Typography, Paper, FormControlLabel, Checkbox, Stack, Autocomplete, TextField } from '@mui/material';
import { LocalHospitalOutlined } from '@mui/icons-material';
import type { MedicalSpecialty } from '@/features/catalogs/types';

interface Props {
  requiresReferral: boolean;
  onRequiresReferralChange: (v: boolean) => void;
  specialtyIds: string[];
  onSpecialtyIdsChange: (v: string[]) => void;
  specialties: MedicalSpecialty[];
}

export function ReferralSection({
  requiresReferral, onRequiresReferralChange, specialtyIds, onSpecialtyIdsChange, specialties,
}: Props) {
  const selected = specialties.filter((s) => specialtyIds.includes(s.id));

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
                if (!e.target.checked) onSpecialtyIdsChange([]);
              }}
            />
          }
          label="El paciente requiere referencia a especialista"
        />

        {requiresReferral && (
          <Autocomplete
            multiple
            options={specialties}
            getOptionLabel={(s) => s.name}
            value={selected}
            onChange={(_, s) => onSpecialtyIdsChange(s.map((item) => item.id))}
            size="small"
            sx={{ maxWidth: 480 }}
            renderInput={(params) => (
              <TextField {...params} label="Especialidad médica" placeholder="Buscar especialidad..." />
            )}
          />
        )}
      </Stack>
    </Paper>
  );
}
