import { useState } from 'react';
import { TableRow, TableCell } from '@mui/material';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CatalogTableView, CatalogEmptyRow } from './CatalogTableView';
import { CatalogRowActions } from './CatalogRowActions';
import { SimpleNameModal } from './SimpleNameModal';
import {
  useDiseaseCategories, useCreateDiseaseCategory,
  useUpdateDiseaseCategory, useDeleteDiseaseCategory,
} from '../hooks/useDiseaseCategories';
import type { DiseaseCategory } from '../services/disease-categories.service';

export function DiseaseCategoriesPanel() {
  const { data: categories = [], isLoading } = useDiseaseCategories();
  const { mutate: create, isPending: isCreating } = useCreateDiseaseCategory();
  const { mutate: update, isPending: isUpdating } = useUpdateDiseaseCategory();
  const { mutate: remove, isPending: isDeleting } = useDeleteDiseaseCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DiseaseCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DiseaseCategory | null>(null);
  const isPending = isCreating || isUpdating;

  const handleSubmit = (name: string) => {
    if (editTarget) {
      update({ id: editTarget.id, name }, { onSuccess: () => { setEditTarget(null); setModalOpen(false); } });
    } else {
      create(name, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <>
      <CatalogTableView title="Categorías de Diagnóstico" headers={['Nombre']} isLoading={isLoading}
        onAdd={() => { setEditTarget(null); setModalOpen(true); }}
      >
        {categories.length === 0
          ? <CatalogEmptyRow colSpan={2} label="No hay categorías registradas" />
          : categories.map((cat) => (
              <TableRow key={cat.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 500 }}>{cat.name}</TableCell>
                <TableCell>
                  <CatalogRowActions
                    onEdit={() => { setEditTarget(cat); setModalOpen(true); }}
                    onDelete={() => setDeleteTarget(cat)}
                  />
                </TableCell>
              </TableRow>
            ))}
      </CatalogTableView>

      <SimpleNameModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        title={editTarget ? 'Editar Categoría' : 'Nueva Categoría'}
        label="Nombre de la Categoría"
        initialName={editTarget?.name}
        isPending={isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar categoría"
        message={`¿Eliminar la categoría "${deleteTarget?.name}"?`}
        confirmLabel="Eliminar" confirmColor="error" loading={isDeleting}
        onConfirm={() => { if (deleteTarget) remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }); }}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
