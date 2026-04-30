import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField } from '@mui/material';
import type { PsychometricTest } from '../types';

const schema = z.object({ name: z.string().min(1, 'El nombre es obligatorio').max(255) });
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  test?: PsychometricTest | null;
  isPending: boolean;
  onSubmit: (name: string) => void;
}

function PsychometricTestForm({ test, isPending, onSubmit, onClose }: Omit<Props, 'open'>) {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: test?.name ?? '' },
  });

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data.name))}>
      <DialogContent sx={{ pt: 3 }}>
        <Controller name="name" control={control}
          render={({ field }) => (
            <TextField {...field} label="Nombre del Test" error={!!errors.name} helperText={errors.name?.message} autoFocus fullWidth />
          )} />
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
      <PsychometricTestForm key={test?.id ?? 'new'} test={test} isPending={isPending} onSubmit={onSubmit} onClose={onClose} />
    </Dialog>
  );
}
