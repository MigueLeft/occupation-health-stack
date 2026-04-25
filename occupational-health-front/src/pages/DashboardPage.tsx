import { Box, Typography } from '@mui/material';
import { GridViewOutlined } from '@mui/icons-material';
import { AppLayout } from '@/components/AppLayout';

export function DashboardPage() {
  return (
    <AppLayout>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          color: 'text.disabled',
          p: 4,
        }}
      >
        <GridViewOutlined sx={{ fontSize: 64, opacity: 0.3 }} />
        <Typography variant="h3" sx={{ opacity: 0.4, fontWeight: 600 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.35 }}>
          Próximamente
        </Typography>
      </Box>
    </AppLayout>
  );
}
