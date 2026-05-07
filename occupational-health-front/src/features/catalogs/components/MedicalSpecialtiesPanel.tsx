import { useState } from 'react';
import { TableRow, TableCell } from '@mui/material';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CatalogTableView, CatalogEmptyRow } from './CatalogTableView';
import { CatalogRowActions } from './CatalogRowActions';
import { SimpleNameModal } from './SimpleNameModal';
import {
  useMedicalSpecialties,
  useCreateMedicalSpecialty,
  useUpdateMedicalSpecialty,
  useDeleteMedicalSpecialty,
} from '../hooks/useMedicalSpecialties';
import type { MedicalSpecialty } from '../types';

export function MedicalSpecialtiesPanel() {
  const { data: specialties = [], isLoading } = useMedicalSpecialties();
  const { mutate: create, isPending: isCreating } = useCreateMedicalSpecialty();
  const { mutate: update, isPending: isUpdating } = useUpdateMedicalSpecialty();
  const { mutate: remove, isPending: isDeleting } = useDeleteMedicalSpecialty();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MedicalSpecialty | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MedicalSpecialty | null>(null);
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
        title="Especialidades Médicas"
        headers={['Nombre de la Especialidad']}
        isLoading={isLoading}
        onAdd={() => { setEditTarget(null); setModalOpen(true); }}
      >
        {specialties.length === 0
          ? <CatalogEmptyRow colSpan={2} label="No hay especialidades registradas" />
          : specialties.map((s) => (
              <TableRow key={s.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 500 }}>{s.name}</TableCell>
                <TableCell>
                  <CatalogRowActions
                    onEdit={() => { setEditTarget(s); setModalOpen(true); }}
                    onDelete={() => setDeleteTarget(s)}
                  />
                </TableCell>
              </TableRow>
            ))}
      </CatalogTableView>

      <SimpleNameModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        title={editTarget ? 'Editar Especialidad' : 'Nueva Especialidad Médica'}
        label="Nombre de la Especialidad"
        placeholder="Ej: Radiología"
        initialName={editTarget?.name}
        isPending={isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar especialidad"
        message={`¿Eliminar la especialidad "${deleteTarget?.name}"?`}
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
