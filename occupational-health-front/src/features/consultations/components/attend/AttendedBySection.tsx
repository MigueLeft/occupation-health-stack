import { Box, Typography, Paper, TextField } from '@mui/material';
import { SearchableSelect } from '@/components/SearchableSelect';
import type { AppUser } from '@/features/users/types';

interface Props {
  medicalAttendedById: string;
  medicalAttendedByFreeText: string;
  psychologicalAttendedById: string;
  psychologicalAttendedByFreeText: string;
  onMedicalChange: (id: string) => void;
  onMedicalFreeTextChange: (v: string) => void;
  onPsychologicalChange: (id: string) => void;
  onPsychologicalFreeTextChange: (v: string) => void;
  users: AppUser[];
  tab: 'medica' | 'psicologica';
}

export function AttendedBySection({
  medicalAttendedById,
  medicalAttendedByFreeText,
  psychologicalAttendedById,
  psychologicalAttendedByFreeText,
  onMedicalChange,
  onMedicalFreeTextChange,
  onPsychologicalChange,
  onPsychologicalFreeTextChange,
  users,
  tab,
}: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h3" sx={{ mb: 2, fontSize: '1rem' }}>Atendido por</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {tab === 'medica' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <SearchableSelect
              options={users.map((u) => ({ id: u.id, name: u.name }))}
              value={medicalAttendedById}
              onChange={onMedicalChange}
              label="Atendido presencialmente (Médica)"
            />
            <TextField
              size="small"
              fullWidth
              label="O anotar nombre libre (Médica)"
              placeholder="Nombre de quien atendió si no está registrado..."
              value={medicalAttendedByFreeText}
              onChange={(e) => onMedicalFreeTextChange(e.target.value)}
            />
          </Box>
        )}

        {tab === 'psicologica' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <SearchableSelect
              options={users.map((u) => ({ id: u.id, name: u.name }))}
              value={psychologicalAttendedById}
              onChange={onPsychologicalChange}
              label="Atendido presencialmente (Psicológica)"
            />
            <TextField
              size="small"
              fullWidth
              label="O anotar nombre libre (Psicológica)"
              placeholder="Nombre de quien atendió si no está registrado..."
              value={psychologicalAttendedByFreeText}
              onChange={(e) => onPsychologicalFreeTextChange(e.target.value)}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
}
