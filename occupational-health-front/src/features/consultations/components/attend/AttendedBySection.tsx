import { Box, Typography, Paper } from '@mui/material';
import { SearchableSelect } from '@/components/SearchableSelect';
import type { AppUser } from '@/features/users/types';

interface Props {
  systemAttendedByName?: string;
  medicalAttendedById: string;
  psychologicalAttendedById: string;
  onMedicalChange: (id: string) => void;
  onPsychologicalChange: (id: string) => void;
  users: AppUser[];
  tab: 'medica' | 'psicologica';
}

export function AttendedBySection({ systemAttendedByName, medicalAttendedById, psychologicalAttendedById, onMedicalChange, onPsychologicalChange, users, tab }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h3" sx={{ mb: 2, fontSize: '1rem' }}>Atendido por</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">Registrado en sistema por</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{systemAttendedByName ?? '—'}</Typography>
        </Box>
        {tab === 'medica' && (
          <SearchableSelect
            options={users.map((u) => ({ id: u.id, name: u.name }))}
            value={medicalAttendedById}
            onChange={onMedicalChange}
            label="Atendido presencialmente (Médica)"
          />
        )}
        {tab === 'psicologica' && (
          <SearchableSelect
            options={users.map((u) => ({ id: u.id, name: u.name }))}
            value={psychologicalAttendedById}
            onChange={onPsychologicalChange}
            label="Atendido presencialmente (Psicológica)"
          />
        )}
      </Box>
    </Paper>
  );
}
