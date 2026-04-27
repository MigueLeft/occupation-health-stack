import { useState } from 'react';
import {
  Box, Typography, Button,
  Table, TableHead, TableBody, TableRow, TableCell,
  CircularProgress,
} from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import { AppLayout } from '@/components/AppLayout';
import {
  RequestRow, RequestsFilters, RequestCreateModal, RequestEditModal, ConfirmNoAsistioModal,
  useRequests, useCreateRequest, useUpdateRequest,
} from '@/features/requests';
import type { AppRequestWithPatient, RequestFilters } from '@/features/requests';

const TABLE_HEADERS = ['Paciente', 'Fecha', 'Motivo', 'Consulta', 'Estatus', 'Acciones'];

const DEFAULT_FILTERS: RequestFilters = { search: '', dateFilter: 'all', motivo: 'all', status: 'Pendiente' };

function isInDateRange(dateStr: string, filter: RequestFilters['dateFilter']): boolean {
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (filter === 'today') return date >= today && date < new Date(today.getTime() + 86400000);
  if (filter === 'week') {
    const start = new Date(today); start.setDate(today.getDate() - today.getDay());
    return date >= start && date <= now;
  }
  if (filter === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  return true;
}

export function RequestsPage() {
  const [filters, setFilters] = useState<RequestFilters>(DEFAULT_FILTERS);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AppRequestWithPatient | null>(null);
  const [noAsistioTarget, setNoAsistioTarget] = useState<AppRequestWithPatient | null>(null);

  const { data: requests = [], isLoading } = useRequests();
  const createMutation = useCreateRequest();
  const updateMutation = useUpdateRequest();

  const filtered = requests.filter((r) => {
    const name = r.patientName.toLowerCase();
    if (filters.search && !name.includes(filters.search.toLowerCase())) return false;
    if (filters.motivo !== 'all' && r.evaluationReason !== filters.motivo) return false;
    if (filters.status !== 'all' && r.status !== filters.status) return false;
    if (filters.dateFilter !== 'all' && !isInDateRange(r.requestDate, filters.dateFilter)) return false;
    return true;
  });

  const handleCreate = (payload: Parameters<typeof createMutation.mutate>[0]) => {
    createMutation.mutate(payload, { onSuccess: () => setCreateOpen(false) });
  };

  const handleEdit = (id: string, payload: Parameters<typeof updateMutation.mutate>[0]['payload']) => {
    updateMutation.mutate({ id, payload }, { onSuccess: () => setEditTarget(null) });
  };

  const handleNoAsistio = () => {
    if (!noAsistioTarget) return;
    updateMutation.mutate(
      { id: noAsistioTarget.id, payload: { status: 'No asistio' } },
      { onSuccess: () => setNoAsistioTarget(null) },
    );
  };

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ px: 4, pt: 3.5, pb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2">Solicitudes</Typography>
          <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setCreateOpen(true)}>
            Nueva Solicitud
          </Button>
        </Box>

        <Box sx={{ px: 4, py: 2.5 }}>
          <RequestsFilters filters={filters} onChange={setFilters} />
        </Box>

        <Box sx={{ px: 4, flex: 1, overflow: 'auto' }}>
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  {TABLE_HEADERS.map((h) => (
                    <TableCell key={h} align={h === 'Acciones' ? 'right' : 'left'}
                      sx={{ color: 'white', fontWeight: 600, py: 1.5, borderBottom: 'none' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={32} /></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>No hay solicitudes</TableCell></TableRow>
                ) : (
                  filtered.map((r) => (
                    <RequestRow key={r.id} request={r}
                      onEdit={setEditTarget}
                      onNoAsistio={setNoAsistioTarget}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        </Box>
      </Box>

      <RequestCreateModal open={createOpen} onClose={() => setCreateOpen(false)}
        isPending={createMutation.isPending} onSubmit={handleCreate} />

      {editTarget && (
        <RequestEditModal open={!!editTarget} onClose={() => setEditTarget(null)}
          request={editTarget} isPending={updateMutation.isPending} onSubmit={handleEdit} />
      )}

      <ConfirmNoAsistioModal
        open={!!noAsistioTarget}
        onClose={() => setNoAsistioTarget(null)}
        onConfirm={handleNoAsistio}
        isPending={updateMutation.isPending}
      />
    </AppLayout>
  );
}
