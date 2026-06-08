import { useState } from 'react';
import { TableRow, TableCell } from '@mui/material';
import { CatalogRowActions } from './CatalogRowActions';
import { SimpleNameModal } from './SimpleNameModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useUpdateIndicatorValue, useDeleteIndicatorValue } from '@/features/psychological-indicators';
import type { PsychologicalIndicatorValue } from '@/features/psychological-indicators';

interface Props {
  indicatorId: string;
  value: PsychologicalIndicatorValue;
}

export function IndicatorValueRow({ indicatorId, value }: Props) {
  const { mutate: update, isPending: isUpdating } = useUpdateIndicatorValue();
  const { mutate: remove, isPending: isDeleting } = useDeleteIndicatorValue();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEdit = (name: string) => {
    update(
      { indicatorId, valueId: value.id, payload: { name } },
      { onSuccess: () => setEditOpen(false) },
    );
  };

  return (
    <>
      <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
        <TableCell sx={{ pl: 4, fontWeight: 400 }}>{value.name}</TableCell>
        <TableCell>
          <CatalogRowActions
            onEdit={() => setEditOpen(true)}
            onDelete={() => setDeleteOpen(true)}
          />
        </TableCell>
      </TableRow>

      <SimpleNameModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar Valor"
        label="Nombre del Valor"
        initialName={value.name}
        isPending={isUpdating}
        onSubmit={handleEdit}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Eliminar valor"
        message={`¿Eliminar el valor "${value.name}"?`}
        confirmLabel="Eliminar"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={() => remove({ indicatorId, valueId: value.id }, { onSuccess: () => setDeleteOpen(false) })}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
