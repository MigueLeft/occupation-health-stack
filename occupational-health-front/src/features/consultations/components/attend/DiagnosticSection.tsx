import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Chip, Stack, Autocomplete } from '@mui/material';
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
  const [cat, setCat] = useState<Cat | null>(null);
  const [disease, setDisease] = useState<Disease | null>(null);
  const [sys, setSys] = useState<BodySystem | null>(null);

  const handleAdd = () => {
    if (!cat || !disease) return;
    onAddDiagnostic({ categoryId: cat.id, diseaseId: disease.id, bodySystemId: sys?.id });
    setCat(null); setDisease(null); setSys(null);
  };

  const getName = (list: Cat[], id: string) => list.find((x) => x.id === id)?.name ?? id;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h3" sx={{ mb: 2.5, fontSize: '1rem' }}>Diagnóstico</Typography>

      <Stack spacing={1.5}>
        <Autocomplete
          size="small"
          options={categories}
          getOptionLabel={(c) => c.name}
          value={cat}
          onChange={(_, v) => setCat(v)}
          renderInput={(params) => <TextField {...params} label="Categoría" placeholder="Buscar categoría..." />}
          fullWidth
          noOptionsText="Sin resultados"
        />
        <Autocomplete
          size="small"
          options={diseases}
          getOptionLabel={(d) => d.name}
          value={disease}
          onChange={(_, v) => setDisease(v)}
          renderInput={(params) => <TextField {...params} label="Enfermedad" placeholder="Buscar enfermedad..." />}
          fullWidth
          noOptionsText="Sin resultados"
        />
        <Autocomplete
          size="small"
          options={bodySystems}
          getOptionLabel={(b) => b.name}
          value={sys}
          onChange={(_, v) => setSys(v)}
          renderInput={(params) => <TextField {...params} label="Aparato/Sistema (opcional)" placeholder="Buscar aparato o sistema..." />}
          fullWidth
          noOptionsText="Sin resultados"
        />
        <Button variant="outlined" startIcon={<AddOutlined />} onClick={handleAdd} disabled={!cat || !disease} fullWidth>
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
