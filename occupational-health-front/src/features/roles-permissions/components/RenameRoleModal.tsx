import { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, IconButton,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateRole } from '../hooks/useRoles';
import type { Role } from '../types';

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
});

type FormData = z.infer<typeof schema>;

interface RenameRoleModalProps {
  role: Role | null;
  onClose: () => void;
}

export function RenameRoleModal({ role, onClose }: RenameRoleModalProps) {
  const { mutate: updateRole, isPending } = useUpdateRole();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (role) reset({ name: role.name });
  }, [role, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    if (!role) return;
    updateRole(
      { id: role.id, payload: { name: data.name } },
      { onSuccess: () => handleClose() },
    );
  };

  return (
    <Dialog open={role !== null} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        Renombrar Rol
        <IconButton size="small" onClick={handleClose}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            label="Nombre del rol"
            fullWidth
            autoFocus
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name')}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
