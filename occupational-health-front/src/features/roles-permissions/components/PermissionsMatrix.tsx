import { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Paper,
  Skeleton,
  Stack,
} from '@mui/material';
import { SaveOutlined } from '@mui/icons-material';
import { useUpdatePermissions, useModules } from '../hooks/useRoles';
import type { Role, PermissionsMatrix as PermMatrix, Action } from '../types';
import { ACTIONS } from '../types';

interface PermissionsMatrixProps {
  role: Role;
}

export function PermissionsMatrix({ role }: PermissionsMatrixProps) {
  const { data: modules, isLoading } = useModules();
  const { mutate: updatePermissions, isPending } = useUpdatePermissions();

  // Estado local inicializado desde las props — se reinicia vía key={role.id} en el padre
  const [localPerms, setLocalPerms] = useState<PermMatrix>(role.permissions);

  const isDirty = JSON.stringify(localPerms) !== JSON.stringify(role.permissions);

  const toggle = (moduleKey: string, action: Action) => {
    setLocalPerms((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [action]: !prev[moduleKey]?.[action],
      },
    }));
  };

  const handleSave = () => {
    updatePermissions({ id: role.id, permissions: localPerms });
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Stack
        direction="row"
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1 }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Permisos: {role.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Selecciona los módulos y acciones permitidas para este rol
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveOutlined />}
          disabled={!isDirty || isPending}
          onClick={handleSave}
          sx={{ flexShrink: 0 }}
        >
          {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Stack>

      {/* Tabla */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 700, py: 1.75, width: '35%' }}>
                  Módulo
                </TableCell>
                {ACTIONS.map((a) => (
                  <TableCell
                    key={a.key}
                    align="center"
                    sx={{ fontWeight: 700, py: 1.75 }}
                  >
                    {a.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton width={120} />
                      </TableCell>
                      {ACTIONS.map((a) => (
                        <TableCell key={a.key} align="center">
                          <Skeleton variant="rounded" width={20} height={20} sx={{ mx: 'auto' }} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : modules?.map((mod) => (
                    <TableRow
                      key={mod.key}
                      sx={{ '&:last-child td': { border: 0 } }}
                    >
                      <TableCell sx={{ fontWeight: 500, py: 1 }}>
                        {mod.label}
                      </TableCell>
                      {ACTIONS.map((a) => (
                        <TableCell key={a.key} align="center" sx={{ py: 1 }}>
                          <Checkbox
                            checked={localPerms[mod.key]?.[a.key] === true}
                            onChange={() => toggle(mod.key, a.key)}
                            size="small"
                            sx={{
                              color: 'divider',
                              '&.Mui-checked': { color: 'primary.main' },
                            }}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
