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

  const grouped = risks.reduce<Record<string, Risk[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  const types = Object.keys(grouped).sort();

  return (
    <Paper variant="outlined" sx={{ px: 3, py: 2, borderRadius: 2, bgcolor: 'warning.50', borderColor: 'warning.200' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
        <WarningAmberOutlined sx={{ color: 'warning.main', fontSize: '1rem' }} />
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.dark', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
          Riesgos del Cargo
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {types.map((type) => (
          <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            <Chip
              label={type}
              size="small"
              color={RISK_TYPE_COLOR[type] ?? 'default'}
              sx={{ fontWeight: 700, minWidth: 100, flexShrink: 0 }}
            />
            {grouped[type].map((r) => (
              <Chip
                key={r.id}
                label={r.name}
                size="small"
                variant="outlined"
                color={RISK_TYPE_COLOR[type] ?? 'default'}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
