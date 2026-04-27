import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Stack, TextField, InputAdornment,
} from '@mui/material';
import { CloseOutlined, LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';

const schema = z.object({
  email: z.string().email('Correo inválido'),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  masterKey: z.string().min(1, 'La clave maestra es obligatoria'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ open, onClose }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', newPassword: '', masterKey: '' },
  });

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = async (data: FormData) => {
    try {
      await apiClient.post('/auth-utils/reset-password', data);
      toast.success('Contraseña restablecida correctamente. Ya puedes iniciar sesión.');
      handleClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Error al restablecer la contraseña');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5 }}>
        Restablecer Contraseña
        <IconButton size="small" onClick={handleClose} sx={{ color: 'inherit' }}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Controller name="email" control={control} render={({ field }) => (
              <TextField {...field} label="Correo electrónico" type="email" fullWidth
                error={!!errors.email} helperText={errors.email?.message} />
            )} />

            <Controller name="newPassword" control={control} render={({ field }) => (
              <TextField {...field} label="Nueva contraseña" type={showPassword ? 'text' : 'password'} fullWidth
                error={!!errors.newPassword} helperText={errors.newPassword?.message}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 18 }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowPassword(p => !p)}>{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment> } }} />
            )} />

            <Controller name="masterKey" control={control} render={({ field }) => (
              <TextField {...field} label="Clave maestra" type={showKey ? 'text' : 'password'} fullWidth
                error={!!errors.masterKey} helperText={errors.masterKey?.message}
                slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowKey(p => !p)}>{showKey ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment> } }} />
            )} />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Procesando...' : 'Restablecer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
