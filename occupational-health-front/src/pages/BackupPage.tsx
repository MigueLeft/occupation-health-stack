import { Box, Divider, Stack, Typography } from '@mui/material';
import { Navigate } from '@tanstack/react-router';
import { AppLayout } from '@/components/AppLayout';
import { usePermissions } from '@/features/auth';
import { BackupExportCard, BackupRestoreCard } from '@/features/backup';
import { usePageTitle } from '@/hooks/usePageTitle';

export function BackupPage() {
  usePageTitle('Respaldos');

  const { can, isLoading } = usePermissions();

  if (isLoading) return null;
  if (!can('backup', 'view')) return <Navigate to="/" />;

  return (
    <AppLayout>
      <Box sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700 }}>
          Respaldo de Base de Datos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Exporta un respaldo completo o restaura desde un archivo SQL previamente generado.
        </Typography>

        <Stack spacing={3}>
          <BackupExportCard />
          <Divider />
          <BackupRestoreCard />
        </Stack>
      </Box>
    </AppLayout>
  );
}
