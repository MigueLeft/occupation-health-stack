import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Avatar,
  Chip,
  Link,
} from '@mui/material';

interface Request {
  id: number;
  name: string;
  date: string;
  reason: string;
  status: 'Pendiente' | 'En Proceso' | 'No asistió' | 'Finalizada';
  avatarColor: string;
}

const MOCK_REQUESTS: Request[] = [
  { id: 1, name: 'Ana Gómez', date: '17 Mar 2026', reason: 'Pre-empleo', status: 'Pendiente', avatarColor: '#B8A7FF' },
  { id: 2, name: 'Carlos Pérez', date: '17 Mar 2026', reason: 'Periódica', status: 'En Proceso', avatarColor: '#C4B5FD' },
  { id: 3, name: 'María Torres', date: '16 Mar 2026', reason: 'Post-reposo', status: 'No asistió', avatarColor: '#F9A8D4' },
  { id: 4, name: 'Luis Herrera', date: '18 Mar 2026', reason: 'Consulta', status: 'Finalizada', avatarColor: '#DDD6FE' },
];

const STATUS_STYLES: Record<Request['status'], { color: string; bgcolor: string }> = {
  'Pendiente':   { color: '#D97706', bgcolor: '#FEF3C7' },
  'En Proceso':  { color: '#374151', bgcolor: '#F3F4F6' },
  'No asistió':  { color: '#DC2626', bgcolor: '#FEE2E2' },
  'Finalizada':  { color: '#059669', bgcolor: '#D1FAE5' },
};

const TABLE_COLUMNS = ['Paciente', 'Fecha Solicitud', 'Motivo', 'Estatus'];

export function RecentRequestsTable() {
  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      <Box sx={{ px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3">Solicitudes Recientes</Typography>
        <Link href="#" underline="hover" variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
          Ver todo →
        </Link>
      </Box>

      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            {TABLE_COLUMNS.map((col) => (
              <TableCell key={col} sx={{ color: 'white', fontWeight: 600, py: 1.5, borderBottom: 'none' }}>
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {MOCK_REQUESTS.map((req) => {
            const style = STATUS_STYLES[req.status];
            return (
              <TableRow key={req.id} sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: req.avatarColor, fontSize: '0.8rem', color: 'primary.main' }}>
                      {req.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{req.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{req.date}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{req.reason}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`● ${req.status}`}
                    size="small"
                    sx={{ bgcolor: style.bgcolor, color: style.color, fontWeight: 600, fontSize: '0.75rem' }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
