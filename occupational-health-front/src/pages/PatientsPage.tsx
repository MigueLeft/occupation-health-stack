import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
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
} from '@mui/material';
import { PersonAddOutlined } from '@mui/icons-material';
import { AppLayout } from '@/components/AppLayout';
import {
  PatientRow,
  PatientTableFilters,
  CreatePatientModal,
  EditPatientModal,
  usePatients,
  useCompanies,
  usePositions,
} from '@/features/patients';
import type { Patient } from '@/features/patients';
import { formatCedula } from '@/utils/cedula';

const TABLE_HEADERS = ['Cédula', 'Nombre Completo', 'Empresa', 'Cargo', 'Edad', 'Acciones'];

export function PatientsPage() {
  const { data: patients = [], isLoading } = usePatients();
  const { data: companies = [] } = useCompanies();

  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Patient | null>(null);

  const { data: allPositions = [] } = usePositions(companyFilter || undefined);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return patients.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const cedula = formatCedula(p.cedula).toLowerCase();
      const matchesSearch = !q || fullName.includes(q) || cedula.includes(q) || p.cedula.toLowerCase().includes(q);
      const matchesCompany = !companyFilter || p.companyId === companyFilter;
      const matchesPosition = !positionFilter || p.positionId === positionFilter;
      return matchesSearch && matchesCompany && matchesPosition;
    });
  }, [patients, search, companyFilter, positionFilter]);

  const navigate = useNavigate();
  const handleView = (p: Patient) => navigate({ to: '/expedientes/$cedula', params: { cedula: p.cedula } });
  const handleEdit = (p: Patient) => setEditTarget(p);

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
          <Button
            variant="contained"
            startIcon={<PersonAddOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Nuevo Paciente
          </Button>
        </Box>

        <Box sx={{ px: 4, pb: 2.5 }}>
          <PatientTableFilters
            search={search}
            onSearch={setSearch}
            companyFilter={companyFilter}
            onCompanyFilter={setCompanyFilter}
            positionFilter={positionFilter}
            onPositionFilter={setPositionFilter}
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
                    {TABLE_HEADERS.map((h) => (
                      <TableCell
                        key={h}
                        sx={{ fontWeight: 700, py: 1.75, color: 'primary.contrastText' }}
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
                          {TABLE_HEADERS.map((h) => (
                            <TableCell key={h}>
                              <Skeleton />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : filtered.map((p) => (
                        <PatientRow
                          key={p.cedula}
                          patient={p}
                          onView={handleView}
                          onEdit={handleEdit}
                        />
                      ))}
                  {!isLoading && filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                        No se encontraron pacientes
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>

      <CreatePatientModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditPatientModal open={!!editTarget} patient={editTarget} onClose={() => setEditTarget(null)} />
    </AppLayout>
  );
}
