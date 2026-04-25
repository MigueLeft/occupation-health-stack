import { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Stack, TextField, MenuItem, FormControl, InputLabel, Select, FormHelperText } from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RISK_TYPES } from '../types';
import type { Risk } from '../types';

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  type: z.enum(RISK_TYPES, { error: 'Selecciona un tipo' }),
});
type FormData = z.infer<typeof schema>;

interface RiskFormModalProps {
  open: boolean;
  onClose: () => void;
  risk?: Risk | null;
  isPending: boolean;
  onSubmit: (data: FormData) => void;
}

export function RiskFormModal({ open, onClose, risk, isPending, onSubmit }: RiskFormModalProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) reset(risk ? { name: risk.name, type: risk.type as FormData['type'] } : { name: '', type: undefined });
  }, [open, risk, reset]);

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5 }}>
        {risk ? 'Editar Riesgo' : 'Nuevo Riesgo'}
        <IconButton size="small" onClick={handleClose} sx={{ color: 'inherit' }}><CloseOutlined fontSize="small" /></IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Controller name="name" control={control}
              render={({ field }) => <TextField {...field} label="Nombre del Riesgo" error={!!errors.name} helperText={errors.name?.message} autoFocus />} />
            <Controller name="type" control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Tipo de Riesgo</InputLabel>
                  <Select {...field} label="Tipo de Riesgo" value={field.value ?? ''}>
                    {RISK_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                  {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
                </FormControl>
              )} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isPending}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
