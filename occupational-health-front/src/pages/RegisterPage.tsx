import { Box, Card, CardContent, Typography, Avatar } from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { RegisterForm } from '@/features/auth';

// Página de registro: composición de layout + feature de autenticación
export function RegisterPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 480 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56, mb: 1.5 }}>
              <PersonAdd fontSize="large" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Crear cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Completa el formulario para registrarte
            </Typography>
          </Box>

          <RegisterForm />
        </CardContent>
      </Card>
    </Box>
  );
}
