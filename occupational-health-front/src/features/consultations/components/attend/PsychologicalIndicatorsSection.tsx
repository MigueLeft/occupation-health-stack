import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import type { PsychologicalIndicator, PsychologicalIndicatorResult } from '@/features/psychological-indicators';

interface Props {
  indicators: PsychologicalIndicator[];
  results: PsychologicalIndicatorResult[];
  onChange: (results: PsychologicalIndicatorResult[]) => void;
}

export function PsychologicalIndicatorsSection({ indicators, results, onChange }: Props) {
  const handleValueClick = (indicatorId: string, valueId: string) => {
    const existing = results.find((r) => r.indicatorId === indicatorId);
    if (existing?.valueId === valueId) {
      // Deselect
      onChange(results.filter((r) => r.indicatorId !== indicatorId));
    } else {
      // Select or replace
      const filtered = results.filter((r) => r.indicatorId !== indicatorId);
      onChange([...filtered, { indicatorId, valueId }]);
    }
  };

  if (indicators.length === 0) return null;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mt: 2.5 }}>
      <Typography variant="h3" sx={{ mb: 2.5, fontSize: '1rem' }}>Indicadores Psicológicos</Typography>

      <Stack spacing={2.5}>
        {indicators.map((indicator) => {
          const selected = results.find((r) => r.indicatorId === indicator.id);
          return (
            <Box key={indicator.id}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>{indicator.name}</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {indicator.values.map((v) => {
                  const isActive = selected?.valueId === v.id;
                  return (
                    <Button
                      key={v.id}
                      size="small"
                      variant={isActive ? 'contained' : 'outlined'}
                      onClick={() => handleValueClick(indicator.id, v.id)}
                      sx={isActive
                        ? { bgcolor: 'secondary.main', color: 'white', borderColor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }
                        : { borderColor: 'secondary.main', color: 'secondary.main', '&:hover': { bgcolor: 'secondary.50' } }
                      }
                    >
                      {v.name}
                    </Button>
                  );
                })}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
