import { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, TextField, MenuItem, Stack,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RISK_TYPES } from '../types';
import type { RiskExposureCategory } from '../types';

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  riskType: z.string().min(1, 'El tipo de riesgo es obligatorio'),
  conditions: z.string().optional().or(z.literal('')),
  healthEffects: z.string().optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  category: RiskExposureCategory | null;
  isPending: boolean;
  onSubmit: (data: FormData) => void;
}

export function RiskExposureCategoryFormModal({ open, onClose, category, isPending, onSubmit }: Props) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset(category
        ? { name: category.name, riskType: category.riskType, conditions: category.conditions ?? '', healthEffects: category.healthEffects ?? '' }
        : { name: '', riskType: '', conditions: '', healthEffects: '' },
      );
    }
  }, [open, category, reset]);

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5 }}>
        {category ? 'Editar Categoría de Exposición' : 'Nueva Categoría de Exposición'}
        <IconButton size="small" onClick={handleClose} sx={{ color: 'inherit' }}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Controller name="name" control={control} render={({ field }) => (
              <TextField {...field} label="Nombre de la Categoría" error={!!errors.name} helperText={errors.name?.message} fullWidth />
            )} />
            <Controller name="riskType" control={control} render={({ field }) => (
              <TextField {...field} select label="Tipo de Riesgo" error={!!errors.riskType} helperText={errors.riskType?.message} fullWidth>
                {RISK_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            )} />
            <Controller name="conditions" control={control} render={({ field }) => (
              <TextField {...field} label="Condiciones (opcional)" multiline rows={3} fullWidth placeholder="Describa las condiciones de exposición..." />
            )} />
            <Controller name="healthEffects" control={control} render={({ field }) => (
              <TextField {...field} label="Efectos en la Salud (opcional)" multiline rows={3} fullWidth placeholder="Describa los efectos potenciales en la salud..." />
            )} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isPending}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
