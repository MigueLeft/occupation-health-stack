import { useState } from 'react';
import { Box, Typography, Paper, TextField, MenuItem, Button, Stack, IconButton, Divider } from '@mui/material';
import { AddOutlined, DeleteOutlined } from '@mui/icons-material';
import type { ExamResult } from '../../services/sub-entities.service';

interface Exam { id: string; name: string; category: string; }
interface Props {
  examResults: ExamResult[];
  exams: Exam[];
  onAdd: (examId: string, resultValue: string, observation: string, result: 'Normal' | 'Anormal' | '') => void;
  onRemove: (id: string) => void;
}

const RESULT_VALUES = ['Normal', 'Anormal'] as const;

export function ExamResultsSection({ examResults, exams, onAdd, onRemove }: Props) {
  const [examId, setExamId] = useState('');
  const [resultValue, setResultValue] = useState('');
  const [observation, setObservation] = useState('');
  const [result, setResult] = useState<'Normal' | 'Anormal' | ''>('');

  const handleAdd = () => {
    if (!examId) return;
    onAdd(examId, resultValue, observation, result);
    setExamId(''); setResultValue(''); setObservation(''); setResult('');
  };

  const getExamName = (id: string) => exams.find((e) => e.id === id)?.name ?? id;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h3" sx={{ mb: 2.5, fontSize: '1rem' }}>Resultados de Exámenes</Typography>

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1}>
          <TextField select size="small" label="Examen" value={examId} onChange={(e) => setExamId(e.target.value)} sx={{ flex: 1.5 }}>
            {exams.map((e) => <MenuItem key={e.id} value={e.id}>{e.name} ({e.category})</MenuItem>)}
          </TextField>
          <TextField size="small" label="Valor resultado" value={resultValue} onChange={(e) => setResultValue(e.target.value)} sx={{ flex: 1 }} />
          <TextField select size="small" label="Resultado" value={result} onChange={(e) => setResult(e.target.value as 'Normal' | 'Anormal' | '')} sx={{ flex: 0.8 }}>
            <MenuItem value="">—</MenuItem>
            {RESULT_VALUES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'stretch' }}>
          <TextField size="small" label="Observación" value={observation} onChange={(e) => setObservation(e.target.value)} fullWidth />
          <Button variant="outlined" startIcon={<AddOutlined />} onClick={handleAdd} disabled={!examId} sx={{ flexShrink: 0, minHeight: 0, height: 'auto', alignSelf: 'stretch' }}>Agregar</Button>
        </Stack>
      </Stack>

      <Stack spacing={1}>
        {examResults.map((er) => (
          <Box key={er.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{getExamName(er.examId)}</Typography>
              <Typography variant="caption" color="text.secondary">{er.resultValue} {er.result ? `· ${er.result}` : ''} {er.observation ? `· ${er.observation}` : ''}</Typography>
            </Box>
            <IconButton size="small" onClick={() => onRemove(er.id)} color="error"><DeleteOutlined fontSize="small" /></IconButton>
          </Box>
        ))}
        {examResults.length === 0 && <Divider><Typography variant="caption" color="text.disabled">Sin resultados agregados</Typography></Divider>}
      </Stack>
    </Paper>
  );
}
