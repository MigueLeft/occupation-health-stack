import { useState } from 'react';
import { TableRow, TableCell } from '@mui/material';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CatalogTableView, CatalogEmptyRow } from './CatalogTableView';
import { CatalogRowActions } from './CatalogRowActions';
import { SimpleNameModal } from './SimpleNameModal';
import {
  useAccidentTypes,
  useCreateAccidentType,
  useUpdateAccidentType,
  useDeleteAccidentType,
} from '../hooks/useAccidentTypes';
import type { AccidentType } from '../hooks/useAccidentTypes';

export function AccidentTypesPanel() {
  const { data: accidentTypes = [], isLoading } = useAccidentTypes();
  const { mutate: create, isPending: isCreating } = useCreateAccidentType();
  const { mutate: update, isPending: isUpdating } = useUpdateAccidentType();
  const { mutate: remove, isPending: isDeleting } = useDeleteAccidentType();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AccidentType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AccidentType | null>(null);
  const isPending = isCreating || isUpdating;

  const handleSubmit = (name: string) => {
    if (editTarget) {
      update(
        { id: editTarget.id, payload: { name } },
        { onSuccess: () => { setEditTarget(null); setModalOpen(false); } },
      );
    } else {
      create({ name }, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <>
      <CatalogTableView
        title="Tipos de Accidente"
        headers={['Nombre del Tipo de Accidente']}
        isLoading={isLoading}
        onAdd={() => { setEditTarget(null); setModalOpen(true); }}
      >
        {accidentTypes.length === 0
          ? <CatalogEmptyRow colSpan={2} label="No hay tipos de accidente registrados" />
          : accidentTypes.map((a) => (
              <TableRow key={a.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 500 }}>{a.name}</TableCell>
                <TableCell>
                  <CatalogRowActions
                    onEdit={() => { setEditTarget(a); setModalOpen(true); }}
                    onDelete={() => setDeleteTarget(a)}
                  />
                </TableCell>
              </TableRow>
            ))}
      </CatalogTableView>

      <SimpleNameModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        title={editTarget ? 'Editar Tipo de Accidente' : 'Nuevo Tipo de Accidente'}
        label="Nombre del Tipo de Accidente"
        placeholder="Ej: Accidente de Tránsito"
        initialName={editTarget?.name}
        isPending={isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar tipo de accidente"
        message={`¿Eliminar el tipo de accidente "${deleteTarget?.name}"?`}
        confirmLabel="Eliminar"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={() => {
          if (deleteTarget) remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
