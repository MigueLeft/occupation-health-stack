import { useState } from 'react';
import { TableRow, TableCell } from '@mui/material';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CatalogTableView, CatalogEmptyRow } from './CatalogTableView';
import { CatalogRowActions } from './CatalogRowActions';
import { SimpleNameModal } from './SimpleNameModal';
import { useBodySystems, useCreateBodySystem, useUpdateBodySystem, useDeleteBodySystem } from '../hooks/useBodySystems';
import type { BodySystem } from '../types';

export function BodySystemsPanel() {
  const { data: systems = [], isLoading } = useBodySystems();
  const { mutate: create, isPending: isCreating } = useCreateBodySystem();
  const { mutate: update, isPending: isUpdating } = useUpdateBodySystem();
  const { mutate: remove, isPending: isDeleting } = useDeleteBodySystem();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BodySystem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BodySystem | null>(null);
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
      <CatalogTableView title="Aparatos y Sistemas" headers={['Nombre']} isLoading={isLoading} onAdd={() => { setEditTarget(null); setModalOpen(true); }}>
        {systems.length === 0
          ? <CatalogEmptyRow colSpan={2} label="No hay aparatos/sistemas registrados" />
          : systems.map((s) => (
              <TableRow key={s.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 500 }}>{s.name}</TableCell>
                <TableCell><CatalogRowActions onEdit={() => { setEditTarget(s); setModalOpen(true); }} onDelete={() => setDeleteTarget(s)} /></TableCell>
              </TableRow>
            ))}
      </CatalogTableView>

      <SimpleNameModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} title={editTarget ? 'Editar Aparato/Sistema' : 'Nuevo Aparato/Sistema'} label="Nombre" placeholder="Ej: Sistema Cardiovascular" initialName={editTarget?.name} isPending={isPending} onSubmit={handleSubmit} />

      <ConfirmDialog open={deleteTarget !== null} title="Eliminar aparato/sistema" message={`¿Eliminar "${deleteTarget?.name}"?`} confirmLabel="Eliminar" confirmColor="error" loading={isDeleting}
        onConfirm={() => { if (deleteTarget) remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }); }}
        onClose={() => setDeleteTarget(null)} />
    </>
  );
}
