import { useState } from 'react';
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, IconButton, Tooltip, Box, Typography,
} from '@mui/material';
import { EditOutlined, DeleteOutlined } from '@mui/icons-material';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PositionFormModal } from './PositionFormModal';
import { useDeletePosition } from '../hooks/usePositions';
import type { Position } from '../types';

interface PositionsTableProps {
  positions: Position[];
  companyId: string;
}

export function PositionsTable({ positions, companyId }: PositionsTableProps) {
  const { mutate: deletePosition, isPending: isDeleting } = useDeletePosition();
  const [editTarget, setEditTarget] = useState<Position | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);

  return (
    <>
      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              {['Nombre del Cargo', 'Descripción', 'Empleados', 'Acciones'].map((h) => (
                <TableCell key={h} sx={{ color: 'primary.contrastText', fontWeight: 700, py: 1.5 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((pos) => (
              <TableRow key={pos.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 500, fontSize: '0.9rem' }}>{pos.name}</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  {pos.description ?? (
                    <Typography component="span" sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>
                      Sin descripción
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  {pos.employeeCount ?? 0}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Editar cargo">
                      <IconButton size="small" onClick={() => setEditTarget(pos)}>
                        <EditOutlined fontSize="small" sx={{ color: 'secondary.main' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar cargo">
                      <IconButton size="small" onClick={() => setDeleteTarget(pos)}>
                        <DeleteOutlined fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {positions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.disabled' }}>
                  No hay cargos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <PositionFormModal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        companyId={companyId}
        position={editTarget}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar cargo"
        message={`¿Estás seguro de que deseas eliminar el cargo "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={() => {
          if (!deleteTarget) return;
          deletePosition(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
