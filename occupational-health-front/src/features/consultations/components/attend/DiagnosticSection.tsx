import { useState } from 'react';
import { Box, Typography, Paper, TextField, MenuItem, Button, Chip, Stack } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import { CONSULTATION_RESULTS } from '../../types';
import type { ConsultationResult } from '../../types';
import type { ConsultationDiagnostic } from '../../services/sub-entities.service';

interface DiagRow { categoryId: string; diseaseId: string; bodySystemId?: string; }
interface Cat { id: string; name: string; }
interface Disease { id: string; name: string; }
interface BodySystem { id: string; name: string; }

interface Props {
  diagnostics: ConsultationDiagnostic[];
  onAddDiagnostic: (row: DiagRow) => void;
  onRemoveDiagnostic: (id: string) => void;
  categories: Cat[];
  diseases: Disease[];
  bodySystems: BodySystem[];
  result: ConsultationResult | '' | undefined;
  onResultChange: (r: ConsultationResult | '') => void;
  description: string;
  onDescriptionChange: (v: string) => void;
}

export function DiagnosticSection({ diagnostics, onAddDiagnostic, onRemoveDiagnostic, categories, diseases, bodySystems, result, onResultChange, description, onDescriptionChange }: Props) {
  const [catId, setCatId] = useState('');
  const [diseaseId, setDiseaseId] = useState('');
  const [sysId, setSysId] = useState('');

  const handleAdd = () => {
    if (!catId || !diseaseId) return;
    onAddDiagnostic({ categoryId: catId, diseaseId, bodySystemId: sysId || undefined });
    setCatId(''); setDiseaseId(''); setSysId('');
  };

  const getName = (list: Cat[], id: string) => list.find((x) => x.id === id)?.name ?? id;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h3" sx={{ mb: 2.5, fontSize: '1rem' }}>Diagnóstico</Typography>

      <Stack spacing={1.5}>
        <TextField select size="small" label="Categoría" value={catId} onChange={(e) => setCatId(e.target.value)} fullWidth>
          {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Enfermedad" value={diseaseId} onChange={(e) => setDiseaseId(e.target.value)} fullWidth>
          {diseases.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Aparato/Sistema (opcional)" value={sysId} onChange={(e) => setSysId(e.target.value)} fullWidth>
          <MenuItem value="">—</MenuItem>
          {bodySystems.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
        </TextField>
        <Button variant="outlined" startIcon={<AddOutlined />} onClick={handleAdd} disabled={!catId || !diseaseId} fullWidth>
          Agregar
        </Button>
        {diagnostics.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {diagnostics.map((d) => (
              <Chip key={d.id} size="small" onDelete={() => onRemoveDiagnostic(d.id)}
                label={`${getName(categories, d.categoryId)} · ${getName(diseases, d.diseaseId)}`}
              />
            ))}
          </Box>
        )}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Resultado</Typography>
          <Stack direction="row" spacing={1}>
            {CONSULTATION_RESULTS.map((r) => (
              <Button key={r} size="small"
                variant={result === r ? 'contained' : 'outlined'}
                onClick={() => onResultChange(result === r ? '' : r)}
                sx={result === r
                  ? { bgcolor: 'primary.main', color: 'white', borderColor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }
                  : { borderColor: 'primary.main', color: 'primary.main', '&:hover': { bgcolor: 'primary.50' } }
                }
              >{r}</Button>
            ))}
          </Stack>
        </Box>
      </Stack>

      <TextField label="Descripción del diagnóstico" size="small" fullWidth multiline rows={3} sx={{ mt: 1.5 }}
        placeholder="Describa el diagnóstico del paciente..."
        value={description} onChange={(e) => onDescriptionChange(e.target.value)}
      />
    </Paper>
  );
}
