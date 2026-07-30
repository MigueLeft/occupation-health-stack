import {
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Button, Typography, Box,
} from '@mui/material';
import { RestartAltOutlined } from '@mui/icons-material';
import { useReactivatePatient } from '@/features/patients';
import type { Patient } from '@/features/patients';
import { formatCedula } from '@/utils/cedula';

interface ExEmployeesTableProps {
  patients: Patient[];
  canReactivate?: boolean;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ExEmployeesTable({ patients, canReactivate = true }: ExEmployeesTableProps) {
  const { mutate: reactivate, isPending, variables: pendingCedula } = useReactivatePatient();

  if (patients.length === 0) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Esta empresa no tiene ex-empleados registrados.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            {['Cédula', 'Nombre', 'Cargo', 'Fecha de Egreso', 'Acciones'].map((h) => (
              <TableCell key={h} sx={{ color: 'primary.contrastText', fontWeight: 700, py: 1.5, whiteSpace: 'nowrap' }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {patients.map((p) => (
            <TableRow key={p.cedula} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
              <TableCell sx={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{formatCedula(p.cedula)}</TableCell>
              <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.firstName} {p.lastName}</TableCell>
              <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{p.position?.name ?? '—'}</TableCell>
              <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                {p.terminatedAt ? formatDate(p.terminatedAt) : '—'}
              </TableCell>
              <TableCell>
                {canReactivate && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<RestartAltOutlined fontSize="small" />}
                    disabled={isPending && pendingCedula === p.cedula}
                    onClick={() => reactivate(p.cedula)}
                  >
                    Reactivar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
