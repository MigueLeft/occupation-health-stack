import { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Stack, TextField,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePosition, useUpdatePosition } from '../hooks/usePositions';
import type { Position } from '../types';

const schema = z.object({
  name: z.string().min(1, 'El nombre del cargo es obligatorio').max(255),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface PositionFormModalProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  position?: Position | null;
}

export function PositionFormModal({ open, onClose, companyId, position }: PositionFormModalProps) {
  const isEdit = !!position;
  const { mutate: createPosition, isPending: isCreating } = useCreatePosition();
  const { mutate: updatePosition, isPending: isUpdating } = useUpdatePosition();
  const isPending = isCreating || isUpdating;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset(position ? { name: position.name, description: position.description ?? '' } : { name: '', description: '' });
    }
  }, [open, position, reset]);

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updatePosition({ id: position.id, payload: data }, { onSuccess: handleClose });
    } else {
      createPosition({ ...data, companyId }, { onSuccess: handleClose });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5,
        }}
      >
        {isEdit ? 'Editar Cargo' : 'Nuevo Cargo'}
        <IconButton size="small" onClick={handleClose} sx={{ color: 'inherit' }}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Nombre del Cargo" placeholder="Ej: Médico Ocupacional"
                  error={!!errors.name} helperText={errors.name?.message} />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descripción"
                  placeholder="Breve descripción del cargo y sus responsabilidades..."
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isPending}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Guardar Cargo'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
