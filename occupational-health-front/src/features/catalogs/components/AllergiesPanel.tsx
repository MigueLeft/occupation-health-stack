import { useState } from 'react';
import { TableRow, TableCell } from '@mui/material';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CatalogTableView, CatalogEmptyRow } from './CatalogTableView';
import { CatalogRowActions } from './CatalogRowActions';
import { SimpleNameModal } from './SimpleNameModal';
import { useAllergies, useCreateAllergy, useUpdateAllergy, useDeleteAllergy } from '../hooks/useAllergies';
import type { Allergy } from '../types';

export function AllergiesPanel() {
  const { data: allergies = [], isLoading } = useAllergies();
  const { mutate: create, isPending: isCreating } = useCreateAllergy();
  const { mutate: update, isPending: isUpdating } = useUpdateAllergy();
  const { mutate: remove, isPending: isDeleting } = useDeleteAllergy();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Allergy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Allergy | null>(null);
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
      <CatalogTableView title="Alergias" headers={['Nombre de la Alergia']} isLoading={isLoading} onAdd={() => { setEditTarget(null); setModalOpen(true); }}>
        {allergies.length === 0
          ? <CatalogEmptyRow colSpan={2} label="No hay alergias registradas" />
          : allergies.map((a) => (
              <TableRow key={a.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 500 }}>{a.name}</TableCell>
                <TableCell><CatalogRowActions onEdit={() => { setEditTarget(a); setModalOpen(true); }} onDelete={() => setDeleteTarget(a)} /></TableCell>
              </TableRow>
            ))}
      </CatalogTableView>

      <SimpleNameModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} title={editTarget ? 'Editar Alergia' : 'Nueva Alergia'} label="Nombre de la Alergia" placeholder="Ej: Alergia al Polen" initialName={editTarget?.name} isPending={isPending} onSubmit={handleSubmit} />

      <ConfirmDialog open={deleteTarget !== null} title="Eliminar alergia" message={`¿Eliminar la alergia "${deleteTarget?.name}"?`} confirmLabel="Eliminar" confirmColor="error" loading={isDeleting}
        onConfirm={() => { if (deleteTarget) remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }); }}
        onClose={() => setDeleteTarget(null)} />
    </>
  );
}
