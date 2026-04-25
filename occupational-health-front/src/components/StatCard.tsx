import type { ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  dark?: boolean;
}

export function StatCard({ icon, value, label, dark = false }: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        flex: 1,
        borderRadius: 3,
        border: dark ? 'none' : '1px solid',
        borderColor: 'divider',
        bgcolor: dark ? 'primary.main' : 'background.paper',
      }}
    >
      <Box sx={{ mb: 1.5, color: dark ? 'rgba(255,255,255,0.75)' : 'inherit' }}>
        {icon}
      </Box>
      <Typography
        variant="h2"
        sx={{ mb: 0.5, color: dark ? 'white' : 'text.primary', fontWeight: 700 }}
      >
        {typeof value === 'number' ? value.toLocaleString('es-MX') : value}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: dark ? 'rgba(255,255,255,0.65)' : 'text.secondary' }}
      >
        {label}
      </Typography>
    </Paper>
  );
}
