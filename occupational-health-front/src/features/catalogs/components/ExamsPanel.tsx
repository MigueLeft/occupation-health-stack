import { useState } from 'react';
import { TableRow, TableCell, Chip } from '@mui/material';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CatalogTableView, CatalogEmptyRow } from './CatalogTableView';
import { CatalogRowActions } from './CatalogRowActions';
import { ExamFormModal } from './ExamFormModal';
import { useExams, useCreateExam, useUpdateExam, useDeleteExam } from '../hooks/useExams';
import type { Exam } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  Laboratorio: '#e3f2fd',
  'Estudio de Imagenes': '#f3e5f5',
  'Pruebas Especiales': '#e8f5e9',
};

export function ExamsPanel() {
  const { data: exams = [], isLoading } = useExams();
  const { mutate: create, isPending: isCreating } = useCreateExam();
  const { mutate: update, isPending: isUpdating } = useUpdateExam();
  const { mutate: remove, isPending: isDeleting } = useDeleteExam();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Exam | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);

  const isPending = isCreating || isUpdating;

  const handleSubmit = (data: { name: string; category: string }) => {
    if (editTarget) {
      update({ id: editTarget.id, payload: data }, { onSuccess: () => { setEditTarget(null); setModalOpen(false); } });
    } else {
      create(data, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <>
      <CatalogTableView title="Catálogo de Exámenes" headers={['Nombre del Examen', 'Categoría']} isLoading={isLoading} onAdd={() => { setEditTarget(null); setModalOpen(true); }}>
        {exams.length === 0
          ? <CatalogEmptyRow colSpan={3} label="No hay exámenes registrados" />
          : exams.map((exam) => (
              <TableRow key={exam.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 500 }}>{exam.name}</TableCell>
                <TableCell>
                  <Chip label={exam.category} size="small" sx={{ bgcolor: CATEGORY_COLORS[exam.category] ?? '#f5f5f5', fontWeight: 500 }} />
                </TableCell>
                <TableCell><CatalogRowActions onEdit={() => { setEditTarget(exam); setModalOpen(true); }} onDelete={() => setDeleteTarget(exam)} /></TableCell>
              </TableRow>
            ))}
      </CatalogTableView>

      <ExamFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} exam={editTarget} isPending={isPending} onSubmit={handleSubmit} />

      <ConfirmDialog open={deleteTarget !== null} title="Eliminar examen" message={`¿Eliminar el examen "${deleteTarget?.name}"?`} confirmLabel="Eliminar" confirmColor="error" loading={isDeleting}
        onConfirm={() => { if (deleteTarget) remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }); }}
        onClose={() => setDeleteTarget(null)} />
    </>
  );
}
