import { useState, useMemo } from 'react';
import { useNavigate, Navigate } from '@tanstack/react-router';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  TablePagination,
  Checkbox,
  Tooltip,
  IconButton,
} from '@mui/material';
import { PersonAddOutlined, DeleteOutlined, SortByAlphaOutlined } from '@mui/icons-material';
import { AppLayout } from '@/components/AppLayout';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  PatientRow,
  PatientTableFilters,
  CreatePatientModal,
  EditPatientModal,
  usePatients,
  useCompanies,
  usePositions,
  useDeletePatient,
} from '@/features/patients';
import type { Patient } from '@/features/patients';
import { formatCedula } from '@/utils/cedula';
import { usePermissions } from '@/features/auth';

const TABLE_HEADERS = ['Cédula', 'Nombre Completo', 'Empresa', 'Cargo', 'Edad', 'Acciones'];

export function PatientsPage() {
  usePageTitle('Pacientes');

  const { can, isLoading: isPermLoading } = usePermissions();
  const { data: patients = [], isLoading } = usePatients();
  const { data: companies = [] } = useCompanies();
  const { mutate: deletePatient, isPending: isDeleting } = useDeletePatient();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [sortAZ, setSortAZ] = useState(false);
  const [companyFilter, setCompanyFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Patient | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteMultiOpen, setDeleteMultiOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: allPositions = [] } = usePositions(companyFilter || undefined);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = patients.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const cedula = formatCedula(p.cedula).toLowerCase();
      const matchesSearch = !q || fullName.includes(q) || cedula.includes(q) || p.cedula.toLowerCase().includes(q);
      const matchesCompany = !companyFilter || p.companyId === companyFilter;
      const matchesPosition = !positionFilter || p.positionId === positionFilter;
      return matchesSearch && matchesCompany && matchesPosition;
    });
    if (sortAZ) {
      result = [...result].sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'es'),
      );
    }
    return result;
  }, [patients, search, companyFilter, positionFilter, sortAZ]);

  if (isPermLoading) return null;
  if (!can('patients', 'view')) return <Navigate to="/" />;

  const canCreate = can('patients', 'create');
  const canEdit = can('patients', 'edit');
  const canDelete = can('patients', 'delete');
  const canViewExpediente = can('expediente', 'view');

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const allSelected = paginated.length > 0 && paginated.every((p) => selected.has(p.cedula));
  const someSelected = selected.size > 0;

  const handleToggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        paginated.forEach((p) => next.delete(p.cedula));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        paginated.forEach((p) => next.add(p.cedula));
        return next;
      });
    }
  };

  const handleToggleOne = (cedula: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cedula)) next.delete(cedula);
      else next.add(cedula);
      return next;
    });
  };

  const handleConfirmDeleteMulti = async () => {
    const cédulas = Array.from(selected);
    for (const cedula of cédulas) {
      await new Promise<void>((resolve) => {
        deletePatient(cedula, { onSuccess: () => resolve(), onError: () => resolve() });
      });
    }
    setSelected(new Set());
    setDeleteMultiOpen(false);
  };

  const handleView = (p: Patient) => navigate({ to: '/expedientes/$cedula', params: { cedula: p.cedula } });
  const handleEdit = (p: Patient) => setEditTarget(p);
  const handleDelete = (p: Patient) => setDeleteTarget(p);
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deletePatient(deleteTarget.cedula, { onSuccess: () => setDeleteTarget(null) });
  };

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 4,
            pt: 3.5,
            pb: 3,
          }}
        >
          <Typography variant="h2">Pacientes</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {someSelected && canDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlined />}
                onClick={() => setDeleteMultiOpen(true)}
              >
                Eliminar ({selected.size})
              </Button>
            )}
            <Tooltip title={sortAZ ? 'Orden original' : 'Ordenar A-Z'}>
              <IconButton onClick={() => setSortAZ((v) => !v)} color={sortAZ ? 'primary' : 'default'}>
                <SortByAlphaOutlined />
              </IconButton>
            </Tooltip>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<PersonAddOutlined />}
                onClick={() => setCreateOpen(true)}
              >
                Nuevo Paciente
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ px: 4, pb: 2.5 }}>
          <PatientTableFilters
            search={search}
            onSearch={(v) => { setSearch(v); setPage(0); }}
            companyFilter={companyFilter}
            onCompanyFilter={(v) => { setCompanyFilter(v); setPage(0); }}
            positionFilter={positionFilter}
            onPositionFilter={(v) => { setPositionFilter(v); setPage(0); }}
            companies={companies}
            positions={allPositions}
          />
        </Box>

        <Box sx={{ px: 4, pb: 4, flex: 1, overflow: 'auto' }}>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    {canDelete && (
                      <TableCell padding="checkbox" sx={{ bgcolor: 'primary.main' }}>
                        <Checkbox
                          checked={allSelected}
                          indeterminate={!allSelected && paginated.some((p) => selected.has(p.cedula))}
                          onChange={handleToggleAll}
                          sx={{ color: 'primary.contrastText', '&.Mui-checked': { color: 'primary.contrastText' }, '&.MuiCheckbox-indeterminate': { color: 'primary.contrastText' } }}
                        />
                      </TableCell>
                    )}
                    {TABLE_HEADERS.map((h) => (
                      <TableCell
                        key={h}
                        sx={{ fontWeight: 700, py: 1.75, color: 'primary.contrastText', whiteSpace: 'nowrap' }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell padding="checkbox"><Skeleton variant="rectangular" width={20} height={20} /></TableCell>
                          {TABLE_HEADERS.map((h) => (
                            <TableCell key={h}>
                              <Skeleton />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : paginated.map((p) => (
                        <PatientRow
                          key={p.cedula}
                          patient={p}
                          selected={selected.has(p.cedula)}
                          onToggleSelect={handleToggleOne}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          canEdit={canEdit}
                          canDelete={canDelete}
                          canViewExpediente={canViewExpediente}
                        />
                      ))}
                  {!isLoading && filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={TABLE_HEADERS.length + (canDelete ? 1 : 0)} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                        No se encontraron pacientes
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            />
          </Paper>
        </Box>
      </Box>

      <CreatePatientModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditPatientModal open={!!editTarget} patient={editTarget} onClose={() => setEditTarget(null)} />

      <ConfirmDialog
        open={deleteMultiOpen}
        title="Eliminar pacientes seleccionados"
        message={`¿Estás seguro de que deseas eliminar ${selected.size} paciente(s)? Esta acción es irreversible.`}
        confirmLabel="Eliminar"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={handleConfirmDeleteMulti}
        onClose={() => setDeleteMultiOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar paciente"
        message={`¿Estás seguro de que deseas eliminar a ${deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : ''}? Esta acción es irreversible.`}
        confirmLabel="Eliminar"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}
