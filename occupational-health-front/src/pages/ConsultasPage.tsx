import { useState } from 'react';
import {
  Box, Typography,
  Table, TableHead, TableBody, TableRow, TableCell,
  CircularProgress,
} from '@mui/material';
import { Navigate } from '@tanstack/react-router';
import { AppLayout } from '@/components/AppLayout';
import { ConsultationRow, ConsultationFilters, useConsultations } from '@/features/consultations';
import type { ConsultationFiltersState } from '@/features/consultations';
import { usePermissions } from '@/features/auth';

const TABLE_HEADERS = ['Paciente', 'Fecha', 'Motivo', 'Tipo', 'Resultado', 'Estatus', 'Acciones'];
const DEFAULT_FILTERS: ConsultationFiltersState = { search: '', tipo: 'all', resultado: 'all', status: 'active' };

export function ConsultasPage() {
  const { can, isLoading: isPermLoading } = usePermissions();
  const [filters, setFilters] = useState<ConsultationFiltersState>(DEFAULT_FILTERS);
  const { data: consultations = [], isLoading } = useConsultations();

  if (isPermLoading) return null;
  if (!can('consultations', 'view')) return <Navigate to="/" />;

  const filtered = (consultations ?? [])
    .filter((c) => {
      const name = c.patientName.toLowerCase();
      if (filters.search && !name.includes(filters.search.toLowerCase())) return false;
      if (filters.tipo !== 'all' && c.type !== filters.tipo) return false;
      if (filters.status === 'active' && c.status === 'Finalizada') return false;
      if (filters.status !== 'active' && filters.status !== 'all' && c.status !== filters.status) return false;
      if (filters.resultado !== 'all') {
        const result = c.type === 'Medica' ? c.consultationResult : c.psychologicalResult;
        if (result !== filters.resultado) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.status === 'Pendiente' && b.status !== 'Pendiente') return -1;
      if (b.status === 'Pendiente' && a.status !== 'Pendiente') return 1;
      return b.requestDate.localeCompare(a.requestDate);
    });

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ px: 4, pt: 3.5, pb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2">Consultas</Typography>
        </Box>

        <Box sx={{ px: 4, py: 2.5 }}>
          <ConsultationFilters filters={filters} onChange={setFilters} />
        </Box>

        <Box sx={{ px: 4, flex: 1, overflow: 'auto' }}>
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  {TABLE_HEADERS.map((h) => (
                    <TableCell key={h} align={h === 'Acciones' ? 'right' : 'left'}
                      sx={{ color: 'white', fontWeight: 600, py: 1.5, borderBottom: 'none', whiteSpace: 'nowrap' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress size={32} /></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>No hay consultas registradas</TableCell></TableRow>
                ) : (
                  filtered.map((c) => (
                    <ConsultationRow key={c.id} consultation={c} />
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        </Box>
      </Box>
    </AppLayout>
  );
}
