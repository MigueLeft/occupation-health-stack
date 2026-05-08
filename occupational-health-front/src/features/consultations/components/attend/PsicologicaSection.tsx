import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Stack, FormControlLabel, Checkbox, IconButton, Divider } from '@mui/material';
import { AddOutlined, DeleteOutlined } from '@mui/icons-material';
import { SearchableSelect } from '@/components/SearchableSelect';
import { PSYCHOLOGICAL_RESULTS, PSYCHOLOGICAL_APTITUDES } from '../../types';
import type { PsychologicalResult, PsychologicalAptitude } from '../../types';
import type { PsychometricTestResult } from '../../services/sub-entities.service';

interface CatalogTest { id: string; name: string; }
interface Props {
  psychologicalResult: PsychologicalResult | '' | undefined;
  onResultChange: (r: PsychologicalResult | '') => void;
  psychologicalAptitude: PsychologicalAptitude | '' | undefined;
  onAptitudeChange: (r: PsychologicalAptitude | '') => void;
  aptitudeDetails: string;
  onAptitudeDetailsChange: (v: string) => void;
  interviewConducted: boolean;
  onInterviewChange: (v: boolean) => void;
  observations: string;
  onObservationsChange: (v: string) => void;
  psychometricTests: PsychometricTestResult[];
  catalogTests: CatalogTest[];
  onAddTest: (catalogTestId: string) => void;
  onRemoveTest: (id: string) => void;
}

export function PsicologicaSection({
  psychologicalResult, onResultChange,
  psychologicalAptitude, onAptitudeChange,
  aptitudeDetails, onAptitudeDetailsChange,
  interviewConducted, onInterviewChange,
  observations, onObservationsChange,
  psychometricTests, catalogTests,
  onAddTest, onRemoveTest,
}: Props) {
  const [testId, setTestId] = useState('');

  const alreadyAdded = psychometricTests.some((pt) => pt.catalogTestId === testId);

  const handleAdd = () => {
    if (!testId || alreadyAdded) return;
    onAddTest(testId);
    setTestId('');
  };

  // Excluir de las opciones los tests ya agregados
  const availableTests = catalogTests.filter(
    (t) => !psychometricTests.some((pt) => pt.catalogTestId === t.id),
  );

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h3" sx={{ mb: 2.5, fontSize: '1rem' }}>Evaluación Psicológica</Typography>

      <Stack spacing={2.5}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Estado de la Evaluación</Typography>
          <Stack direction="row" spacing={1}>
            {PSYCHOLOGICAL_RESULTS.map((r) => (
              <Button key={r} size="small"
                variant={psychologicalResult === r ? 'contained' : 'outlined'}
                onClick={() => onResultChange(psychologicalResult === r ? '' : r)}
                sx={psychologicalResult === r
                  ? { bgcolor: 'primary.main', color: 'white', borderColor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }
                  : { borderColor: 'primary.main', color: 'primary.main', '&:hover': { bgcolor: 'primary.50' } }
                }
              >{r}</Button>
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Aptitud Psicológica</Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            {PSYCHOLOGICAL_APTITUDES.map((r) => {
              const color = r === 'Apto' ? 'success' : r === 'No Apto' ? 'error' : 'warning';
              return (
                <Button key={r} size="small"
                  color={color}
                  variant={psychologicalAptitude === r ? 'contained' : 'outlined'}
                  onClick={() => onAptitudeChange(psychologicalAptitude === r ? '' : r)}
                >{r}</Button>
              );
            })}
          </Stack>
          <TextField
            label="Detalles de Aptitud"
            size="small"
            fullWidth
            multiline
            rows={2}
            placeholder="Ej: Apto Condicionado — requiere seguimiento en 3 meses..."
            value={aptitudeDetails}
            onChange={(e) => onAptitudeDetailsChange(e.target.value)}
          />
        </Box>

        <FormControlLabel control={<Checkbox checked={interviewConducted} onChange={(e) => onInterviewChange(e.target.checked)} />} label="Entrevista realizada" />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Tests Psicométricos</Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <SearchableSelect
              options={availableTests}
              value={testId}
              onChange={setTestId}
              label="Test psicométrico"
              sx={{ flex: 1 }}
            />
            <Button variant="outlined" startIcon={<AddOutlined />} onClick={handleAdd} disabled={!testId || alreadyAdded} sx={{ flexShrink: 0 }}>Agregar</Button>
          </Stack>
          <Stack spacing={1}>
            {psychometricTests.map((pt) => {
              const testName = catalogTests.find((t) => t.id === pt.catalogTestId)?.name ?? pt.catalogTestId;
              return (
                <Box key={pt.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{testName}</Typography>
                  <IconButton size="small" onClick={() => onRemoveTest(pt.id)} color="error"><DeleteOutlined fontSize="small" /></IconButton>
                </Box>
              );
            })}
            {psychometricTests.length === 0 && <Divider><Typography variant="caption" color="text.disabled">Sin tests agregados</Typography></Divider>}
          </Stack>
        </Box>

        <TextField label="Observaciones Psicológicas" size="small" fullWidth multiline rows={3}
          placeholder="Observaciones del área psicológica..."
          value={observations} onChange={(e) => onObservationsChange(e.target.value)}
        />
      </Stack>
    </Paper>
  );
}
