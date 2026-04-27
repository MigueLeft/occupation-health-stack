import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Fab,
  IconButton,
  useMediaQuery,
  useTheme,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { AddOutlined, SearchOutlined, PersonAddOutlined } from '@mui/icons-material';
import { AppLayout } from '@/components/AppLayout';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  UserRow,
  UserCard,
  CreateUserModal,
  EditUserModal,
  useUsers,
  useUpdateUser,
  useDeleteUser,
} from '@/features/users';
import { useRoles } from '@/features/roles-permissions';
import type { AppUser } from '@/features/users';

const TABLE_HEADERS = ['Nombre', 'Correo electrónico', 'Rol', 'Estado', 'Acciones'];

function DesktopView({
  users,
  search,
  onSearch,
  roleFilter,
  onRoleFilter,
  roles,
  onCreateOpen,
  onEdit,
  onDeleteRequest,
  onToggleStatus,
  isLoading,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
}: {
  users: AppUser[];
  search: string;
  onSearch: (v: string) => void;
  roleFilter: string;
  onRoleFilter: (v: string) => void;
  roles: { id: string; name: string }[];
  onCreateOpen: () => void;
  onEdit: (user: AppUser) => void;
  onDeleteRequest: (user: AppUser) => void;
  onToggleStatus: (user: AppUser) => void;
  isLoading: boolean;
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (rpp: number) => void;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          pt: 3.5,
          pb: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="h2">Gestión de Usuarios</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Administra los usuarios del sistema
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={onCreateOpen}>
          Crear Usuario
        </Button>
      </Box>

      <Box sx={{ px: 4, py: 2.5, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
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
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Rol</InputLabel>
          <Select
            value={roleFilter}
            label="Rol"
            onChange={(e) => onRoleFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Todos los roles</MenuItem>
            {roles.map((r) => (
              <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ px: 4, pb: 4, flex: 1, overflow: 'auto' }}>
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  {TABLE_HEADERS.map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, py: 1.75 }}>
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
                  : users.map((u) => (
                      <UserRow
                        key={u.id}
                        user={u}
                        onToggleStatus={onToggleStatus}
                        onEdit={onEdit}
                        onDelete={onDeleteRequest}
                      />
                    ))}
                {!isLoading && users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => onPageChange(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          />
        </Paper>
      </Box>
    </Box>
  );
}

function MobileView({
  users,
  search,
  onSearch,
  onCreateOpen,
  onEdit,
  isLoading,
}: {
  users: AppUser[];
  search: string;
  onSearch: (v: string) => void;
  onCreateOpen: () => void;
  onEdit: (user: AppUser) => void;
  isLoading: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Usuarios
        </Typography>
        <IconButton color="primary" onClick={onCreateOpen}>
          <PersonAddOutlined />
        </IconButton>
      </Box>

      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <TextField
          fullWidth
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ color: 'text.disabled', fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  gap: 2,
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Skeleton variant="circular" width={44} height={44} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="60%" />
                  <Skeleton width="40%" />
                </Box>
              </Box>
            ))
          : users.map((u) => <UserCard key={u.id} user={u} onEdit={onEdit} />)}
        {!isLoading && users.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.disabled' }}>
            <Typography>No se encontraron usuarios</Typography>
          </Box>
        )}
      </Box>

      <Fab
        color="primary"
        onClick={onCreateOpen}
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <AddOutlined />
      </Fab>
    </Box>
  );
}

export function UsersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const { mutate: updateUser } = useUpdateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AppUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
        (!roleFilter || u.roleId === roleFilter),
    );
  }, [users, search, roleFilter]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleToggleStatus = (user: AppUser) =>
    updateUser({ id: user.id, payload: { banned: !user.banned } });

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  return (
    <AppLayout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {isMobile ? (
          <MobileView
            users={filtered}
            search={search}
            onSearch={(v) => { setSearch(v); setPage(0); }}
            onCreateOpen={() => setCreateOpen(true)}
            onEdit={setEditTarget}
            isLoading={isLoading}
          />
        ) : (
          <DesktopView
            users={paginated}
            search={search}
            onSearch={(v) => { setSearch(v); setPage(0); }}
            roleFilter={roleFilter}
            onRoleFilter={(v) => { setRoleFilter(v); setPage(0); }}
            roles={roles}
            onCreateOpen={() => setCreateOpen(true)}
            onEdit={setEditTarget}
            onDeleteRequest={setDeleteTarget}
            onToggleStatus={handleToggleStatus}
            isLoading={isLoading}
            page={page}
            rowsPerPage={rowsPerPage}
            total={filtered.length}
            onPageChange={setPage}
            onRowsPerPageChange={(rpp) => { setRowsPerPage(rpp); setPage(0); }}
          />
        )}
      </Box>

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <EditUserModal
        open={editTarget !== null}
        user={editTarget}
        onClose={() => setEditTarget(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar usuario"
        message={`¿Estás seguro de que deseas eliminar a "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}
