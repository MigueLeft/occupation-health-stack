import { useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  Box,
  Typography,
  Button,
  Skeleton,
  Tab,
  Tabs,
  Fab,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import { Navigate } from '@tanstack/react-router';
import { AppLayout } from '@/components/AppLayout';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  RoleCard,
  PermissionsMatrix,
  CreateRoleModal,
  RenameRoleModal,
  useRoles,
  useDeleteRole,
} from '@/features/roles-permissions';
import { usePermissions } from '@/features/auth';
import type { Role } from '@/features/roles-permissions';

function RolesListPanel({
  roles,
  selectedId,
  onSelect,
  onDeleteRequest,
  onRenameRequest,
}: {
  roles: Role[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDeleteRequest: (role: Role) => void;
  onRenameRequest: (role: Role) => void;
}) {
  return (
    <Box>
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          selected={role.id === selectedId}
          onClick={() => onSelect(role.id)}
          onDelete={onDeleteRequest}
          onRename={onRenameRequest}
        />
      ))}
    </Box>
  );
}

function DesktopLayout({
  roles,
  selectedRole,
  selectedId,
  onSelect,
  onCreateOpen,
  onDeleteRequest,
  onRenameRequest,
  onPermissionsSaved,
  isLoading,
}: {
  roles: Role[];
  selectedRole: Role | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateOpen: () => void;
  onDeleteRequest: (role: Role) => void;
  onRenameRequest: (role: Role) => void;
  onPermissionsSaved: () => void;
  isLoading: boolean;
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
          <Typography variant="h2">Roles y Permisos</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Define roles y asigna permisos a cada uno
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={onCreateOpen}>
          Crear Rol
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Panel izquierdo: lista de roles */}
        <Box
          sx={{
            width: 260,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            p: 2,
            overflowY: 'auto',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'text.disabled',
              mb: 1.5,
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            Roles disponibles
          </Typography>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={68} sx={{ mb: 1 }} />
            ))
          ) : (
            <RolesListPanel
              roles={roles}
              selectedId={selectedId}
              onSelect={onSelect}
              onDeleteRequest={onDeleteRequest}
              onRenameRequest={onRenameRequest}
            />
          )}
        </Box>

        {/* Panel derecho: permisos */}
        <Box sx={{ flex: 1, p: 3.5, overflowY: 'auto' }}>
          {selectedRole ? (
            <PermissionsMatrix
              key={selectedRole.id}
              role={selectedRole}
              onSaveSuccess={onPermissionsSaved}
            />
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.disabled',
              }}
            >
              <Typography>Selecciona un rol para ver sus permisos</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function MobileLayout({
  roles,
  selectedRole,
  selectedId,
  onSelect,
  onCreateOpen,
  onDeleteRequest,
  onRenameRequest,
  onPermissionsSaved,
  isLoading,
}: {
  roles: Role[];
  selectedRole: Role | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateOpen: () => void;
  onDeleteRequest: (role: Role) => void;
  onRenameRequest: (role: Role) => void;
  onPermissionsSaved: () => void;
  isLoading: boolean;
}) {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}
      >
        <Tab label="Roles" sx={{ fontWeight: 600 }} />
        <Tab label="Permisos" sx={{ fontWeight: 600 }} />
      </Tabs>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {tab === 0 &&
          (isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={68} sx={{ mb: 1 }} />
            ))
          ) : (
            <RolesListPanel
              roles={roles}
              selectedId={selectedId}
              onSelect={(id) => {
                onSelect(id);
                setTab(1);
              }}
              onDeleteRequest={onDeleteRequest}
              onRenameRequest={onRenameRequest}
            />
          ))}

        {tab === 1 &&
          (selectedRole ? (
            <PermissionsMatrix
              key={selectedRole.id}
              role={selectedRole}
              onSaveSuccess={() => { onPermissionsSaved(); setTab(0); }}
            />
          ) : (
            <Alert severity="info" sx={{ mt: 1 }}>
              Selecciona un rol en la pestaña anterior para ver sus permisos
            </Alert>
          ))}
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

export function RolesPermissionsPage() {
  usePageTitle('Roles y Permisos');

  const { can, isLoading: isPermLoading } = usePermissions();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data: roles = [], isLoading } = useRoles();
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [renameTarget, setRenameTarget] = useState<Role | null>(null);

  if (isPermLoading) return null;
  if (!can('roles', 'view')) return <Navigate to="/" />;

  const selectedRole = roles.find((r) => r.id === selectedId) ?? null;

  const handleSelect = (id: string) => setSelectedId(id);

  const handlePermissionsSaved = () => setSelectedId(null);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteRole(deleteTarget.id, {
      onSuccess: () => {
        if (selectedId === deleteTarget.id) setSelectedId(null);
        setDeleteTarget(null);
      },
    });
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
          <MobileLayout
            roles={roles}
            selectedRole={selectedRole}
            selectedId={selectedId}
            onSelect={handleSelect}
            onCreateOpen={() => setCreateOpen(true)}
            onDeleteRequest={setDeleteTarget}
            onRenameRequest={setRenameTarget}
            onPermissionsSaved={handlePermissionsSaved}
            isLoading={isLoading}
          />
        ) : (
          <DesktopLayout
            roles={roles}
            selectedRole={selectedRole}
            selectedId={selectedId}
            onSelect={handleSelect}
            onCreateOpen={() => setCreateOpen(true)}
            onDeleteRequest={setDeleteTarget}
            onRenameRequest={setRenameTarget}
            onPermissionsSaved={handlePermissionsSaved}
            isLoading={isLoading}
          />
        )}
      </Box>

      <CreateRoleModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <RenameRoleModal role={renameTarget} onClose={() => setRenameTarget(null)} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar rol"
        message={`¿Estás seguro de que deseas eliminar el rol "${deleteTarget?.name}"? Los usuarios asignados a este rol quedarán sin rol.`}
        confirmLabel="Eliminar"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}
