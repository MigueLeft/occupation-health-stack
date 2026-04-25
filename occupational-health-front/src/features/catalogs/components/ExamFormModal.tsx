import { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Stack, TextField, MenuItem, FormControl, InputLabel, Select, FormHelperText } from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EXAM_CATEGORIES } from '../types';
import type { Exam } from '../types';

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  category: z.enum(EXAM_CATEGORIES, { error: 'Selecciona una categoría' }),
});
type FormData = z.infer<typeof schema>;

interface ExamFormModalProps {
  open: boolean;
  onClose: () => void;
  exam?: Exam | null;
  isPending: boolean;
  onSubmit: (data: FormData) => void;
}

export function ExamFormModal({ open, onClose, exam, isPending, onSubmit }: ExamFormModalProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) reset(exam ? { name: exam.name, category: exam.category as FormData['category'] } : { name: '', category: undefined });
  }, [open, exam, reset]);

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5 }}>
        {exam ? 'Editar Examen' : 'Nuevo Examen'}
        <IconButton size="small" onClick={handleClose} sx={{ color: 'inherit' }}><CloseOutlined fontSize="small" /></IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Controller name="name" control={control}
              render={({ field }) => <TextField {...field} label="Nombre del Examen" error={!!errors.name} helperText={errors.name?.message} autoFocus />} />
            <Controller name="category" control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.category}>
                  <InputLabel>Categoría</InputLabel>
                  <Select {...field} label="Categoría" value={field.value ?? ''}>
                    {EXAM_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                  {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
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
