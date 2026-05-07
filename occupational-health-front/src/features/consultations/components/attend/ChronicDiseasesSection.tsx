import { Box, Typography, Paper, Chip } from '@mui/material';
import { SearchableSelect } from '@/components/SearchableSelect';

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

      <SearchableSelect
        options={available}
        value=""
        onChange={(id) => { if (id) onAdd(id); }}
        label="Agregar enfermedad crónica"
        disabled={available.length === 0}
        noOptionsText="Sin enfermedades disponibles"
      />

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
