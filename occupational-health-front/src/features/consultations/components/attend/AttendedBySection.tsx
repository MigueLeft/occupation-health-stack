import { Box, Typography, TextField, MenuItem, Paper } from '@mui/material';
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
          <TextField select size="small" fullWidth label="Atendido presencialmente (Médica)"
            value={medicalAttendedById}
            onChange={(e) => onMedicalChange(e.target.value)}
          >
            <MenuItem value="">—</MenuItem>
            {users.map((u) => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
          </TextField>
        )}
        {tab === 'psicologica' && (
          <TextField select size="small" fullWidth label="Atendido presencialmente (Psicológica)"
            value={psychologicalAttendedById}
            onChange={(e) => onPsychologicalChange(e.target.value)}
          >
            <MenuItem value="">—</MenuItem>
            {users.map((u) => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
          </TextField>
        )}
      </Box>
    </Paper>
  );
}
