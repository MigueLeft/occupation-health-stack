import { Box, Typography, Paper, Grid } from '@mui/material';
import { MonitorWeightOutlined } from '@mui/icons-material';
import { useLatestPhysicalExam } from '../../hooks/useLatestPhysicalExam';

interface Props { patientId: string; }

function calcBmi(weight?: number | null, height?: number | null): string | null {
  if (!weight || !height || height <= 0) return null;
  const hm = height / 100;
  return (weight / (hm * hm)).toFixed(1);
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', fontSize: '0.68rem' }}>{label}</Typography>
      <Typography variant="body2" sx={{ mt: 0.25, fontWeight: 600 }}>{value}</Typography>
    </Box>
  );
}

export function LastVitalsCard({ patientId }: Props) {
  const { data: exam, isLoading } = useLatestPhysicalExam(patientId);

  if (isLoading) return null;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <MonitorWeightOutlined sx={{ color: 'primary.main' }} />
        <Typography variant="h3" sx={{ fontSize: '1rem' }}>Último Registro de Peso y Talla</Typography>
      </Box>

      {exam ? (
        <>
          <Grid container spacing={2}>
            <Grid size={4}><Field label="Peso (kg)" value={exam.weight != null ? String(exam.weight) : '—'} /></Grid>
            <Grid size={4}><Field label="Talla (cm)" value={exam.height != null ? String(exam.height) : '—'} /></Grid>
            <Grid size={4}><Field label="IMC" value={calcBmi(exam.weight, exam.height) ?? '—'} /></Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
            Registrado el {formatDate(exam.recordedAt)}
          </Typography>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Sin registros previos de peso o talla.
        </Typography>
      )}
    </Paper>
  );
}
