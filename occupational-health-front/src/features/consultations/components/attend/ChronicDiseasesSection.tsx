import { useState } from 'react';
import { Box, Typography, Paper, TextField, MenuItem, Button, Chip, Stack } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';

interface Disease { id: string; name: string; }

interface Props {
  patientDiseases: Disease[];
  allDiseases: Disease[];
  onAdd: (diseaseId: string) => void;
  onRemove: (diseaseId: string) => void;
}

export function ChronicDiseasesSection({ patientDiseases, allDiseases, onAdd, onRemove }: Props) {
  const [selected, setSelected] = useState('');

  const available = allDiseases.filter((d) => !patientDiseases.some((pd) => pd.id === d.id));

  const handleAdd = () => {
    if (!selected) return;
    onAdd(selected);
    setSelected('');
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mt: 2 }}>
      <Typography variant="h3" sx={{ mb: 2, fontSize: '1rem' }}>Enfermedades Crónicas</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <TextField select size="small" label="Enfermedad" value={selected} onChange={(e) => setSelected(e.target.value)} sx={{ flex: 1 }}>
          {available.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
        </TextField>
        <Button variant="outlined" startIcon={<AddOutlined />} onClick={handleAdd} disabled={!selected} sx={{ flexShrink: 0 }}>
          Agregar
        </Button>
      </Stack>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
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
