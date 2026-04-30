import { Box, Typography, Paper, TextField, MenuItem, Chip } from '@mui/material';

interface Disease { id: string; name: string; isChronic?: boolean; }

interface Props {
  patientDiseases: Disease[];
  allDiseases: Disease[];
  onAdd: (diseaseId: string) => void;
  onRemove: (diseaseId: string) => void;
}

export function ChronicDiseasesSection({ patientDiseases, allDiseases, onAdd, onRemove }: Props) {
  const chronicDiseases = allDiseases.filter((d) => d.isChronic);
  const available = chronicDiseases.filter((d) => !patientDiseases.some((pd) => pd.id === d.id));

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mt: 2 }}>
      <Typography variant="h3" sx={{ mb: 2, fontSize: '1rem' }}>Enfermedades Crónicas</Typography>

      <TextField
        select
        size="small"
        label="Agregar enfermedad crónica"
        value=""
        onChange={(e) => { if (e.target.value) onAdd(e.target.value); }}
        fullWidth
        disabled={available.length === 0}
      >
        {available.length === 0
          ? <MenuItem value="" disabled>Sin enfermedades disponibles</MenuItem>
          : available.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)
        }
      </TextField>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
        {patientDiseases.length === 0
          ? <Typography variant="caption" color="text.disabled">Sin enfermedades crónicas registradas</Typography>
          : patientDiseases.map((d) => (
            <Chip key={d.id} label={d.name} size="small" onDelete={() => onRemove(d.id)} />
          ))
        }
      </Box>
    </Paper>
  );
}
