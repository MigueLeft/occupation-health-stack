import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Chip, Stack, Autocomplete, FormControlLabel, Checkbox } from '@mui/material';
import { AddOutlined, CheckCircleOutlined } from '@mui/icons-material';
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
  isHealthy: boolean;
  onIsHealthyChange: (v: boolean) => void;
}

export function DiagnosticSection({
  diagnostics, onAddDiagnostic, onRemoveDiagnostic,
  categories, diseases, bodySystems,
  result, onResultChange,
  description, onDescriptionChange,
  isHealthy, onIsHealthyChange,
}: Props) {
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h3" sx={{ fontSize: '1rem' }}>Diagnóstico</Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={isHealthy}
              onChange={(e) => onIsHealthyChange(e.target.checked)}
              color="success"
              icon={<CheckCircleOutlined />}
              checkedIcon={<CheckCircleOutlined />}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: isHealthy ? 700 : 400, color: isHealthy ? 'success.main' : 'text.secondary' }}>
              Paciente Sano
            </Typography>
          }
          sx={{ mr: 0 }}
        />
      </Box>

      {isHealthy ? (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <CheckCircleOutlined sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
          <Typography variant="body1" color="success.main" sx={{ fontWeight: 600 }}>
            Paciente sin diagnósticos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            El paciente fue evaluado y no presenta patologías.
          </Typography>
        </Box>
      ) : (
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
              {CONSULTATION_RESULTS.map((r) => {
                const color = r === 'Apto' ? 'success' : r === 'No Apto' ? 'error' : 'warning';
                return (
                  <Button key={r} size="small" color={color}
                    variant={result === r ? 'contained' : 'outlined'}
                    onClick={() => onResultChange(result === r ? '' : r)}
                  >{r}</Button>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      )}

      {!isHealthy && (
        <TextField label="Descripción del diagnóstico" size="small" fullWidth multiline rows={3} sx={{ mt: 1.5 }}
          placeholder="Describa el diagnóstico del paciente..."
          value={description} onChange={(e) => onDescriptionChange(e.target.value)}
        />
      )}
    </Paper>
  );
}
