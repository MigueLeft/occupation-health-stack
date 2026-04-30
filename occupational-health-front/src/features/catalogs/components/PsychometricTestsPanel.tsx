import { useState } from 'react';
import { TableRow, TableCell } from '@mui/material';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CatalogTableView, CatalogEmptyRow } from './CatalogTableView';
import { CatalogRowActions } from './CatalogRowActions';
import { PsychometricTestFormModal } from './PsychometricTestFormModal';
import { usePsychometricTests, useCreatePsychometricTest, useUpdatePsychometricTest, useDeletePsychometricTest } from '../hooks/usePsychometricTests';
import type { PsychometricTest } from '../types';

export function PsychometricTestsPanel() {
  const { data: tests = [], isLoading } = usePsychometricTests();
  const { mutate: create, isPending: isCreating } = useCreatePsychometricTest();
  const { mutate: update, isPending: isUpdating } = useUpdatePsychometricTest();
  const { mutate: remove, isPending: isDeleting } = useDeletePsychometricTest();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PsychometricTest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PsychometricTest | null>(null);
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
      <CatalogTableView title="Tests Psicométricos" headers={['Nombre del Test']} isLoading={isLoading} onAdd={() => { setEditTarget(null); setModalOpen(true); }}>
        {tests.length === 0
          ? <CatalogEmptyRow colSpan={2} label="No hay tests registrados" />
          : tests.map((test) => (
              <TableRow key={test.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 500 }}>{test.name}</TableCell>
                <TableCell><CatalogRowActions onEdit={() => { setEditTarget(test); setModalOpen(true); }} onDelete={() => setDeleteTarget(test)} /></TableCell>
              </TableRow>
            ))}
      </CatalogTableView>

      <PsychometricTestFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} test={editTarget} isPending={isPending} onSubmit={handleSubmit} />

      <ConfirmDialog open={deleteTarget !== null} title="Eliminar test" message={`¿Eliminar el test "${deleteTarget?.name}"?`} confirmLabel="Eliminar" confirmColor="error" loading={isDeleting}
        onConfirm={() => { if (deleteTarget) remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }); }}
        onClose={() => setDeleteTarget(null)} />
    </>
  );
}
