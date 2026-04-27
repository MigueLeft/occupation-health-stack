import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
} from '@mui/material';
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  Login,
} from '@mui/icons-material';
import { loginSchema, type LoginSchema } from '../services/auth.schemas';
import { useAuth } from '../hooks/useAuth';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const { signIn } = useAuth();

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginSchema) => {
    await signIn(data);
  };

  return (
    <>
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
    >
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="ejemplo@empresa.com"
            error={!!error}
            helperText={error?.message}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: 'secondary.main', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            error={!!error}
            helperText={error?.message}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: 'secondary.main', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
                      edge="end"
                      size="small"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      />

      <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControlLabel
          control={<Checkbox size="small" />}
          label={<Typography variant="body2">Recordarme</Typography>}
        />
        <Link component="button" type="button" underline="hover" variant="body2" sx={{ color: 'text.secondary' }} onClick={() => setForgotOpen(true)}>
          ¿Olvidaste tu contraseña?
        </Link>
      </Box>

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={isSubmitting}
        startIcon={isSubmitting ? undefined : <Login />}
        sx={{ mt: 0.5, py: 1.5 }}
      >
        {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Iniciar Sesión'}
      </Button>

      <Typography variant="body2" align="center" sx={{ display: { xs: 'block', md: 'none' } }}>
        <Link component="button" type="button" underline="hover" sx={{ color: 'text.secondary' }} onClick={() => setForgotOpen(true)}>
          ¿Olvidaste tu contraseña?
        </Link>
      </Typography>
    </Box>

    <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </>
  );
}
