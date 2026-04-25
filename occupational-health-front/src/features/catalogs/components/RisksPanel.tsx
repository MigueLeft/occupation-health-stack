import { useState } from 'react';
import { TableRow, TableCell, Chip } from '@mui/material';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CatalogTableView, CatalogEmptyRow } from './CatalogTableView';
import { CatalogRowActions } from './CatalogRowActions';
import { RiskFormModal } from './RiskFormModal';
import { useRisks, useCreateRisk, useUpdateRisk, useDeleteRisk } from '../hooks/useRisks';
import type { Risk } from '../types';

const TYPE_COLORS: Record<string, string> = {
  Fisico: '#fff3e0', Quimico: '#fce4ec', Biologico: '#e8f5e9',
  Mecanico: '#e3f2fd', Disergonomicos: '#f3e5f5', Psicosocial: '#fffde7',
};

export function RisksPanel() {
  const { data: risks = [], isLoading } = useRisks();
  const { mutate: create, isPending: isCreating } = useCreateRisk();
  const { mutate: update, isPending: isUpdating } = useUpdateRisk();
  const { mutate: remove, isPending: isDeleting } = useDeleteRisk();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Risk | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Risk | null>(null);
  const isPending = isCreating || isUpdating;

  const handleSubmit = (data: { name: string; type: string }) => {
    if (editTarget) {
      update({ id: editTarget.id, payload: data }, { onSuccess: () => { setEditTarget(null); setModalOpen(false); } });
    } else {
      create(data, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <>
      <CatalogTableView title="Riesgos de Exposición" headers={['Nombre del Riesgo', 'Tipo']} isLoading={isLoading} onAdd={() => { setEditTarget(null); setModalOpen(true); }}>
        {risks.length === 0
          ? <CatalogEmptyRow colSpan={3} label="No hay riesgos registrados" />
          : risks.map((risk) => (
              <TableRow key={risk.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 500 }}>{risk.name}</TableCell>
                <TableCell>
                  <Chip label={risk.type} size="small" sx={{ bgcolor: TYPE_COLORS[risk.type] ?? '#f5f5f5', fontWeight: 500 }} />
                </TableCell>
                <TableCell><CatalogRowActions onEdit={() => { setEditTarget(risk); setModalOpen(true); }} onDelete={() => setDeleteTarget(risk)} /></TableCell>
              </TableRow>
            ))}
      </CatalogTableView>

      <RiskFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} risk={editTarget} isPending={isPending} onSubmit={handleSubmit} />

      <ConfirmDialog open={deleteTarget !== null} title="Eliminar riesgo" message={`¿Eliminar el riesgo "${deleteTarget?.name}"?`} confirmLabel="Eliminar" confirmColor="error" loading={isDeleting}
        onConfirm={() => { if (deleteTarget) remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }); }}
        onClose={() => setDeleteTarget(null)} />
    </>
  );
}
