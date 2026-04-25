import { Box, Avatar, Typography, Chip, Tab, Tabs } from '@mui/material';
import { EVALUATION_REASON_LABELS } from '@/features/requests/types';
import type { EvaluationReason } from '@/features/requests/types';

interface Props {
  patientName: string;
  patientId: string;
  company: string;
  position: string;
  evaluationReason: EvaluationReason;
  requestDate: string;
  activeTab: 'medica' | 'psicologica';
  onTabChange: (tab: 'medica' | 'psicologica') => void;
}

function formatDate(d: string) {
  if (!d) return '—';
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function PatientInfoBar({ patientName, patientId, company, position, evaluationReason, requestDate, activeTab, onTabChange }: Props) {
  const initials = patientName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, px: 4, py: 2.5, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontSize: '1rem' }}>{initials}</Avatar>
        <Box>
          <Typography variant="h3" sx={{ fontSize: '1rem' }}>{patientName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {patientId} · {company} · {position}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Solicitud
        </Typography>
        <Chip
          label={`${EVALUATION_REASON_LABELS[evaluationReason] ?? evaluationReason} · ${formatDate(requestDate)}`}
          size="small"
          sx={{ bgcolor: 'primary.50', color: 'primary.main', fontWeight: 600 }}
        />
      </Box>

      <Tabs value={activeTab} onChange={(_, v) => onTabChange(v)} sx={{ minHeight: 36 }}>
        <Tab label="Médica" value="medica" sx={{ minHeight: 36, textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Psicológica" value="psicologica" sx={{ minHeight: 36, textTransform: 'none', fontWeight: 600 }} />
      </Tabs>
    </Box>
  );
}
