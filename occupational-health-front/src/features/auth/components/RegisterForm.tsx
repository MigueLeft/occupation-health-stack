import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink } from '@tanstack/react-router';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { registerSchema, type RegisterSchema } from '../services/auth.schemas';
import { useAuth } from '../hooks/useAuth';

// Formulario de registro con campo de teléfono internacional
export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { signUp } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { phone: '' },
  });

  const onSubmit = async (data: RegisterSchema) => {
    await signUp({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
      noValidate
    >
      <TextField
        label="Nombre completo"
        autoComplete="name"
        autoFocus
        error={!!errors.name}
        helperText={errors.name?.message}
        {...register('name')}
      />

      <TextField
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        error={!!errors.email}
        helperText={errors.email?.message}
        {...register('email')}
      />

      {/* Input de teléfono internacional con selección de bandera de país */}
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <Box>
            <PhoneInput
              defaultCountry="ve"
              value={field.value ?? ''}
              onChange={field.onChange}
              inputStyle={{
                width: '100%',
                height: '56px',
                fontSize: '1rem',
                borderColor: errors.phone ? '#C62828' : undefined,
              }}
              countrySelectorStyleProps={{
                buttonStyle: { height: '56px' },
              }}
            />
            {errors.phone && (
              <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5, display: 'block' }}>
                {errors.phone.message}
              </Typography>
            )}
          </Box>
        )}
      />

      <TextField
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        error={!!errors.password}
        helperText={errors.password?.message}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        {...register('password')}
      />

      <TextField
        label="Confirmar contraseña"
        type={showConfirm ? 'text' : 'password'}
        autoComplete="new-password"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirm((prev) => !prev)} edge="end">
                  {showConfirm ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        {...register('confirmPassword')}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isSubmitting}
        sx={{ mt: 1 }}
      >
        {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Crear cuenta'}
      </Button>

      <Typography variant="body2" align="center" color="text.secondary">
        ¿Ya tienes cuenta?{' '}
        <RouterLink to="/login" style={{ fontWeight: 600 }}>
          Inicia sesión
        </RouterLink>
      </Typography>
    </Box>
  );
}
