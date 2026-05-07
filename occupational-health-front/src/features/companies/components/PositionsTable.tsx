import { useState } from 'react';
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, IconButton, Tooltip, Box, Typography, Stack, Chip,
} from '@mui/material';
import { EditOutlined, DeleteOutlined, WarningAmberOutlined } from '@mui/icons-material';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PositionFormModal } from './PositionFormModal';
import { PositionRisksModal } from './PositionRisksModal';
import { useDeletePosition } from '../hooks/usePositions';
import type { Position } from '../types';

const RISK_TYPE_COLOR: Record<string, 'error' | 'warning' | 'info' | 'success' | 'secondary' | 'default'> = {
  Fisico: 'error',
  Quimico: 'warning',
  Biologico: 'success',
  Mecanico: 'info',
  Disergonomicos: 'secondary',
  Psicosocial: 'default',
};

interface PositionsTableProps {
  positions: Position[];
  companyId: string;
}

export function PositionsTable({ positions, companyId }: PositionsTableProps) {
  const { mutate: deletePosition, isPending: isDeleting } = useDeletePosition();
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);
  const [risksTargetId, setRisksTargetId] = useState<string | null>(null);

  // Derive live positions from the current prop to avoid stale state after refetch
  const editTarget = editTargetId ? (positions.find((p) => p.id === editTargetId) ?? null) : null;
  const risksTarget = risksTargetId ? (positions.find((p) => p.id === risksTargetId) ?? null) : null;

  return (
    <>
      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              {['Nombre del Cargo', 'Descripción', 'Riesgos', 'Empleados', 'Acciones'].map((h) => (
                <TableCell key={h} sx={{ color: 'primary.contrastText', fontWeight: 700, py: 1.5, whiteSpace: 'nowrap' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((pos) => (
              <TableRow key={pos.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ maxWidth: 180 }}>
                  <Tooltip title={pos.name.length > 25 ? pos.name : ''} placement="top-start">
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pos.name}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  {pos.description ? (
                    <Tooltip title={pos.description.length > 35 ? pos.description : ''} placement="top-start">
                      <Stack component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {pos.description}
                      </Stack>
                    </Tooltip>
                  ) : (
                    <Typography component="span" sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>Sin descripción</Typography>
                  )}
                </TableCell>
                <TableCell sx={{ maxWidth: 220 }}>
                  {pos.risks && pos.risks.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {pos.risks.slice(0, 3).map((r) => (
                        <Chip key={r.id} label={r.type} size="small" color={RISK_TYPE_COLOR[r.type] ?? 'default'} />
                      ))}
                      {pos.risks.length > 3 && (
                        <Chip label={`+${pos.risks.length - 3}`} size="small" />
                      )}
                    </Box>
                  ) : (
                    <Typography component="span" sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>Sin riesgos</Typography>
                  )}
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  {pos.employeeCount ?? 0}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Gestionar riesgos">
                      <IconButton size="small" onClick={() => setRisksTargetId(pos.id)}>
                        <WarningAmberOutlined fontSize="small" sx={{ color: 'warning.main' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar cargo">
                      <IconButton size="small" onClick={() => setEditTargetId(pos.id)}>
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
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.disabled' }}>
                  No hay cargos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <PositionFormModal
        open={editTargetId !== null}
        onClose={() => setEditTargetId(null)}
        companyId={companyId}
        position={editTarget}
      />

      {risksTarget && (
        <PositionRisksModal
          open={risksTargetId !== null}
          onClose={() => setRisksTargetId(null)}
          position={risksTarget}
        />
      )}

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
