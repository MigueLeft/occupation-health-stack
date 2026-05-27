import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  MonitorHeart,
  GroupOutlined,
  VerifiedUserOutlined,
  FavoriteBorderOutlined,
} from '@mui/icons-material';
import { LoginForm } from '@/features/auth';

const FEATURES = [
  { icon: <GroupOutlined fontSize="small" />, label: 'Gestión completa de usuarios' },
  { icon: <VerifiedUserOutlined fontSize="small" />, label: 'Control de roles y permisos' },
  { icon: <FavoriteBorderOutlined fontSize="small" />, label: 'Monitoreo de salud ocupacional' },
];

function FeatureItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{
        width: 40, height: 40, borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        color: 'rgba(255,255,255,0.85)',
      }}>
        {icon}
      </Box>
      <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9375rem' }}>
        {label}
      </Typography>
    </Box>
  );
}

function BrandPanel() {
  return (
    <Box sx={{
      width: { xs: '100%', md: '40%' },
      bgcolor: 'primary.main',
      p: { xs: 4, md: 5 },
      display: 'flex', flexDirection: 'column',
      alignItems: { xs: 'center', md: 'flex-start' },
      position: 'relative', overflow: 'hidden',
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        gap: { xs: 2, md: 1.5 },
        mb: { xs: 1, md: 6 },
      }}>
        <Box sx={{
          bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2,
          p: { xs: 2, md: 1 }, display: 'flex',
        }}>
          <MonitorHeart sx={{ color: 'white', fontSize: { xs: 36, md: 24 } }} />
        </Box>
        <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <Typography sx={{ color: 'white', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: { xs: '1.25rem', md: '1rem' } }}>
            Salud Ocupacional
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', display: { xs: 'block', md: 'none' } }}>
            Sistema de Gestión
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', flex: 1 }}>
        <Typography variant="h1" sx={{ color: 'white', mb: 2 }}>
          Bienvenido al Sistema de Gestión
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 5, fontSize: '0.9375rem', lineHeight: 1.7 }}>
          Administra usuarios, roles y permisos de manera eficiente y segura.
        </Typography>
        <Stack spacing={2.5}>
          {FEATURES.map((f) => <FeatureItem key={f.label} icon={f.icon} label={f.label} />)}
        </Stack>
      </Box>

      {/* Círculos decorativos */}
      <Box sx={{ position: 'absolute', bottom: -80, right: -80, width: 320, height: 320, borderRadius: '50%', bgcolor: 'rgba(106,90,205,0.25)', display: { xs: 'none', md: 'block' } }} />
      <Box sx={{ position: 'absolute', bottom: 50, right: 50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(106,90,205,0.2)', display: { xs: 'none', md: 'block' } }} />
    </Box>
  );
}

function FormPanel() {
  return (
    <Box sx={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      p: { xs: 4, md: 6 }, bgcolor: 'background.paper',
    }}>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Typography variant="h2" sx={{ mb: 0.5, color: 'primary.main' }}>
          Iniciar Sesión
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Ingresa tus credenciales para acceder
        </Typography>
        <LoginForm />
      </Box>
    </Box>
  );
}

export function LoginPage() {
  usePageTitle('Iniciar Sesión');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: { xs: 'column', md: 'row' } }}>
      <BrandPanel />
      <FormPanel />
    </Box>
  );
}
