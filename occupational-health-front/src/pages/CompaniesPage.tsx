import { useState, useMemo } from 'react';
import {
  Box, Typography, Button, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, Skeleton,
} from '@mui/material';
import { AddOutlined, SearchOutlined } from '@mui/icons-material';
import { AppLayout } from '@/components/AppLayout';
import {
  CompanyRow, CompanyFormModal, CompanyDetailModal, useCompanies,
} from '@/features/companies';
import { normalizeRifSearch } from '@/utils/rif';

const TABLE_HEADERS = ['Nombre', 'Dirección', 'RIF', 'Contacto', 'Cargos', 'Acciones'];

export function CompaniesPage() {
  const { data: companies = [], isLoading } = useCompanies();

  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  // Always read fresh data from the query so mutations update the detail modal
  const detailTarget = companies.find((c) => c.id === detailId) ?? null;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return companies;
    const qDigits = normalizeRifSearch(q);
    return companies.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(q);
      const rifDigits = normalizeRifSearch(c.rif);
      const rifMatch = qDigits ? rifDigits.includes(qDigits) : c.rif.toLowerCase().includes(q);
      return nameMatch || rifMatch;
    });
  }, [companies, search]);

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 4, pt: 3.5, pb: 3,
          }}
        >
          <Typography variant="h2">Empresas</Typography>
          <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setCreateOpen(true)}>
            Nueva Empresa
          </Button>
        </Box>

        <Box sx={{ px: 4, pb: 2.5 }}>
          <TextField
            placeholder="Buscar empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 320 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ color: 'text.disabled', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box sx={{ px: 4, pb: 4, flex: 1, overflow: 'auto' }}>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    {TABLE_HEADERS.map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, py: 1.75, color: 'primary.contrastText' }}>
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
                            <TableCell key={h}><Skeleton /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    : filtered.map((c) => (
                        <CompanyRow key={c.id} company={c} onView={(co) => setDetailId(co.id)} />
                      ))}
                  {!isLoading && filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                        No se encontraron empresas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>

      <CompanyFormModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <CompanyDetailModal
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        company={detailTarget}
      />
    </AppLayout>
  );
}
