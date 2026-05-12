import { useState } from 'react';
import { TableRow, TableCell } from '@mui/material';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CatalogTableView, CatalogEmptyRow } from './CatalogTableView';
import { CatalogRowActions } from './CatalogRowActions';
import { SimpleNameModal } from './SimpleNameModal';
import { useDisabilities, useCreateDisability, useUpdateDisability, useDeleteDisability } from '../hooks/useDisabilities';
import type { Disability } from '../types';

export function DisabilitiesPanel() {
  const { data: disabilities = [], isLoading } = useDisabilities();
  const { mutate: create, isPending: isCreating } = useCreateDisability();
  const { mutate: update, isPending: isUpdating } = useUpdateDisability();
  const { mutate: remove, isPending: isDeleting } = useDeleteDisability();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Disability | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Disability | null>(null);
  const isPending = isCreating || isUpdating;

  const handleSubmit = (name: string) => {
    if (editTarget) {
      update({ id: editTarget.id, payload: { name } }, { onSuccess: () => { setEditTarget(null); setModalOpen(false); } });
    } else {
      create({ name }, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <>
      <CatalogTableView title="Discapacidades" headers={['Nombre de la Discapacidad']} isLoading={isLoading} onAdd={() => { setEditTarget(null); setModalOpen(true); }}>
        {disabilities.length === 0
          ? <CatalogEmptyRow colSpan={2} label="No hay discapacidades registradas" />
          : disabilities.map((d) => (
              <TableRow key={d.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 500 }}>{d.name}</TableCell>
                <TableCell><CatalogRowActions onEdit={() => { setEditTarget(d); setModalOpen(true); }} onDelete={() => setDeleteTarget(d)} /></TableCell>
              </TableRow>
            ))}
      </CatalogTableView>

      <SimpleNameModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} title={editTarget ? 'Editar Discapacidad' : 'Nueva Discapacidad'} label="Nombre de la Discapacidad" placeholder="Ej: Discapacidad Visual" initialName={editTarget?.name} isPending={isPending} onSubmit={handleSubmit} />

      <ConfirmDialog open={deleteTarget !== null} title="Eliminar discapacidad" message={`¿Eliminar la discapacidad "${deleteTarget?.name}"?`} confirmLabel="Eliminar" confirmColor="error" loading={isDeleting}
        onConfirm={() => { if (deleteTarget) remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }); }}
        onClose={() => setDeleteTarget(null)} />
    </>
  );
}
