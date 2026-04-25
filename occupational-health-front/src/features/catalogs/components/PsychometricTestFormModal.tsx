import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Stack, TextField, Box, Chip, Typography,
} from '@mui/material';
import { CloseOutlined, AddOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { PsychometricTest } from '../types';

const schema = z.object({ name: z.string().min(1, 'El nombre es obligatorio').max(255) });
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  test?: PsychometricTest | null;
  isPending: boolean;
  onSubmit: (name: string, interpretations: string[]) => void;
}

// Inner form is remounted via `key` so state always starts fresh from props
function PsychometricTestForm({ test, isPending, onSubmit, onClose }: Omit<Props, 'open'>) {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: test?.name ?? '' },
  });

  // State initialized directly from props — safe because this component is remounted via key
  const [interpretations, setInterpretations] = useState<string[]>(test?.interpretations ?? []);
  const [inputValue, setInputValue] = useState('');
  const [interpError, setInterpError] = useState('');

  const handleAdd = () => {
    const val = inputValue.trim();
    if (!val) return;
    if (interpretations.includes(val)) { setInterpError('Esta interpretación ya existe'); return; }
    setInterpretations((prev) => [...prev, val]);
    setInputValue('');
    setInterpError('');
  };

  const onFormSubmit = (data: FormData) => {
    if (interpretations.length === 0) { setInterpError('Agrega al menos una interpretación'); return; }
    onSubmit(data.name, interpretations);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2.5}>
          <Controller name="name" control={control}
            render={({ field }) => (
              <TextField {...field} label="Nombre del Test" error={!!errors.name} helperText={errors.name?.message} autoFocus />
            )} />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Interpretaciones / Resultados Posibles</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); setInterpError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
                placeholder="Ej: Buena conducta"
                size="small"
                sx={{ flex: 1 }}
                error={!!interpError}
                helperText={interpError}
              />
              <Button variant="outlined" startIcon={<AddOutlined />} onClick={handleAdd} sx={{ flexShrink: 0 }}>
                Agregar
              </Button>
            </Stack>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 36 }}>
              {interpretations.map((item) => (
                <Chip key={item} label={item} onDelete={() => setInterpretations((p) => p.filter((i) => i !== item))} size="small" />
              ))}
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={isPending}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar'}</Button>
      </DialogActions>
    </form>
  );
}

export function PsychometricTestFormModal({ open, onClose, test, isPending, onSubmit }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5 }}>
        {test ? 'Editar Test' : 'Nuevo Test Psicométrico'}
        <IconButton size="small" onClick={onClose} sx={{ color: 'inherit' }}><CloseOutlined fontSize="small" /></IconButton>
      </DialogTitle>
      {/* key forces remount so useState initializes fresh from test prop */}
      <PsychometricTestForm key={test?.id ?? 'new'} test={test} isPending={isPending} onSubmit={onSubmit} onClose={onClose} />
    </Dialog>
  );
}
