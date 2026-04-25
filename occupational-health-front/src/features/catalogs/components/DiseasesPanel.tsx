import { useState } from 'react';
import { TableRow, TableCell, Chip } from '@mui/material';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CatalogTableView, CatalogEmptyRow } from './CatalogTableView';
import { CatalogRowActions } from './CatalogRowActions';
import { DiseaseFormModal } from './DiseaseFormModal';
import { useDiseases, useCreateDisease, useUpdateDisease, useDeleteDisease } from '../hooks/useDiseases';
import type { Disease } from '../types';

export function DiseasesPanel() {
  const { data: diseases = [], isLoading } = useDiseases();
  const { mutate: create, isPending: isCreating } = useCreateDisease();
  const { mutate: update, isPending: isUpdating } = useUpdateDisease();
  const { mutate: remove, isPending: isDeleting } = useDeleteDisease();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Disease | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Disease | null>(null);
  const isPending = isCreating || isUpdating;

  const handleSubmit = (data: { name: string; isChronic: boolean }) => {
    if (editTarget) {
      update({ id: editTarget.id, payload: data }, { onSuccess: () => { setEditTarget(null); setModalOpen(false); } });
    } else {
      create(data, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <>
      <CatalogTableView title="Enfermedades" headers={['Nombre de la Enfermedad', 'Tipo']} isLoading={isLoading} onAdd={() => { setEditTarget(null); setModalOpen(true); }}>
        {diseases.length === 0
          ? <CatalogEmptyRow colSpan={3} label="No hay enfermedades registradas" />
          : diseases.map((disease) => (
              <TableRow key={disease.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 500 }}>{disease.name}</TableCell>
                <TableCell>
                  <Chip
                    label={disease.isChronic ? 'Crónica' : 'Aguda'}
                    size="small"
                    sx={{ bgcolor: disease.isChronic ? '#fce4ec' : '#e8f5e9', fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell><CatalogRowActions onEdit={() => { setEditTarget(disease); setModalOpen(true); }} onDelete={() => setDeleteTarget(disease)} /></TableCell>
              </TableRow>
            ))}
      </CatalogTableView>

      <DiseaseFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} disease={editTarget} isPending={isPending} onSubmit={handleSubmit} />

      <ConfirmDialog open={deleteTarget !== null} title="Eliminar enfermedad" message={`¿Eliminar la enfermedad "${deleteTarget?.name}"?`} confirmLabel="Eliminar" confirmColor="error" loading={isDeleting}
        onConfirm={() => { if (deleteTarget) remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }); }}
        onClose={() => setDeleteTarget(null)} />
    </>
  );
}
