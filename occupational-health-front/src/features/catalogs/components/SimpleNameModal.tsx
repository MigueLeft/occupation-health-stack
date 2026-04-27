import { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, TextField } from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255)
    .refine((v) => v.trim().length > 0, { message: 'El nombre no puede contener solo espacios' }),
});
type FormData = z.infer<typeof schema>;

interface SimpleNameModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  label: string;
  placeholder?: string;
  initialName?: string;
  isPending: boolean;
  onSubmit: (name: string) => void;
}

export function SimpleNameModal({
  open, onClose, title, label, placeholder, initialName, isPending, onSubmit,
}: SimpleNameModalProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) reset({ name: initialName ?? '' });
  }, [open, initialName, reset]);

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5 }}
      >
        {title}
        <IconButton size="small" onClick={handleClose} sx={{ color: 'inherit' }}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit((d) => onSubmit(d.name))}>
        <DialogContent sx={{ pt: 3 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={label}
                placeholder={placeholder}
                error={!!errors.name}
                helperText={errors.name?.message}
                autoFocus
              />
            )}
          />
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
