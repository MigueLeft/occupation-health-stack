import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Chip,
  Card,
  CardContent,
  Container,
} from '@mui/material';
import { LocalHospital, Logout } from '@mui/icons-material';
import { useAuth } from '@/features/auth';

// Página home protegida: visible solo para usuarios autenticados
export function HomePage() {
  const { user, signOut } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <LocalHospital sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
            Salud Ocupacional
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label={user?.role ?? 'user'}
              size="small"
              sx={{ bgcolor: 'primary.light', color: 'white', fontWeight: 600 }}
            />
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.dark', fontSize: '0.875rem' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Button color="inherit" startIcon={<Logout />} onClick={signOut} size="small">
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Bienvenido, {user?.name} 👋
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Has iniciado sesión correctamente en el sistema de Salud Ocupacional.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 3 }}>
              <InfoRow label="Email" value={user?.email ?? '—'} />
              <InfoRow label="Rol" value={user?.role ?? 'user'} />
              <InfoRow label="ID" value={user?.id ?? '—'} />
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

// Componente auxiliar para mostrar filas de información del usuario
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, minWidth: 60 }}>
        {label}:
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
