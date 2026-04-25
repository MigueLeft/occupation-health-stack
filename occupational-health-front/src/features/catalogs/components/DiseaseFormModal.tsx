import { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Stack, TextField, FormControlLabel, Switch } from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Disease } from '../types';

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  isChronic: z.boolean(),
});
type FormData = z.infer<typeof schema>;

interface DiseaseFormModalProps {
  open: boolean;
  onClose: () => void;
  disease?: Disease | null;
  isPending: boolean;
  onSubmit: (data: FormData) => void;
}

export function DiseaseFormModal({ open, onClose, disease, isPending, onSubmit }: DiseaseFormModalProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isChronic: false },
  });

  useEffect(() => {
    if (open) reset(disease ? { name: disease.name, isChronic: disease.isChronic } : { name: '', isChronic: false });
  }, [open, disease, reset]);

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5 }}>
        {disease ? 'Editar Enfermedad' : 'Nueva Enfermedad'}
        <IconButton size="small" onClick={handleClose} sx={{ color: 'inherit' }}><CloseOutlined fontSize="small" /></IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Controller name="name" control={control}
              render={({ field }) => <TextField {...field} label="Nombre de la Enfermedad" error={!!errors.name} helperText={errors.name?.message} autoFocus />} />
            <Controller name="isChronic" control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={field.onChange} />}
                  label="Es una enfermedad crónica"
                />
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
