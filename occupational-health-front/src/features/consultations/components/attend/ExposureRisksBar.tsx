import { Box, Typography, Chip, Paper } from '@mui/material';
import { WarningAmberOutlined } from '@mui/icons-material';

interface Risk { id: string; name: string; type: string; }

const RISK_TYPE_COLOR: Record<string, 'error' | 'warning' | 'info' | 'success' | 'secondary' | 'default'> = {
  Fisico: 'error',
  Quimico: 'warning',
  Biologico: 'success',
  Mecanico: 'info',
  Disergonomicos: 'secondary',
  Psicosocial: 'default',
};

interface Props {
  risks: Risk[];
}

export function ExposureRisksBar({ risks }: Props) {
  if (risks.length === 0) return null;

  return (
    <Paper variant="outlined" sx={{ px: 3, py: 1.5, borderRadius: 2, bgcolor: 'warning.50', borderColor: 'warning.200' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <WarningAmberOutlined sx={{ color: 'warning.main', fontSize: '1rem' }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.dark', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
            Riesgos del Cargo
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {risks.map((r) => (
            <Chip
              key={r.id}
              label={`${r.type}: ${r.name}`}
              size="small"
              color={RISK_TYPE_COLOR[r.type] ?? 'default'}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
