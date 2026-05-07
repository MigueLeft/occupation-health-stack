import { useState } from 'react';
import { TableRow, TableCell, Chip, Typography, Tooltip } from '@mui/material';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CatalogTableView, CatalogEmptyRow } from './CatalogTableView';
import { CatalogRowActions } from './CatalogRowActions';
import { RiskExposureCategoryFormModal } from './RiskExposureCategoryFormModal';
import {
  useRiskExposureCategories,
  useCreateRiskExposureCategory,
  useUpdateRiskExposureCategory,
  useDeleteRiskExposureCategory,
} from '../hooks/useRiskExposureCategories';
import type { RiskExposureCategory } from '../types';
import type { RiskExposureCategoryPayload } from '../services/risk-exposure-categories.service';

const TYPE_COLORS: Record<string, string> = {
  Fisico: '#fff3e0', Quimico: '#fce4ec', Biologico: '#e8f5e9',
  Mecanico: '#e3f2fd', Disergonomicos: '#f3e5f5', Psicosocial: '#fffde7',
};

export function RiskExposureCategoriesPanel() {
  const { data: categories = [], isLoading } = useRiskExposureCategories();
  const { mutate: create, isPending: isCreating } = useCreateRiskExposureCategory();
  const { mutate: update, isPending: isUpdating } = useUpdateRiskExposureCategory();
  const { mutate: remove, isPending: isDeleting } = useDeleteRiskExposureCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RiskExposureCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RiskExposureCategory | null>(null);
  const isPending = isCreating || isUpdating;

  const handleSubmit = (data: Omit<RiskExposureCategoryPayload, never>) => {
    const payload = { ...data, conditions: data.conditions || undefined, healthEffects: data.healthEffects || undefined };
    if (editTarget) {
      update({ id: editTarget.id, payload }, { onSuccess: () => { setEditTarget(null); setModalOpen(false); } });
    } else {
      create(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <>
      <CatalogTableView
        title="Categorías de Exposición"
        headers={['Nombre', 'Tipo de Riesgo', 'Efectos en la Salud']}
        isLoading={isLoading}
        onAdd={() => { setEditTarget(null); setModalOpen(true); }}
      >
        {categories.length === 0
          ? <CatalogEmptyRow colSpan={4} label="No hay categorías de exposición registradas" />
          : categories.map((cat) => (
              <TableRow key={cat.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 500 }}>{cat.name}</TableCell>
                <TableCell>
                  <Chip label={cat.riskType} size="small" sx={{ bgcolor: TYPE_COLORS[cat.riskType] ?? '#f5f5f5', fontWeight: 500 }} />
                </TableCell>
                <TableCell sx={{ maxWidth: 260 }}>
                  {cat.healthEffects ? (
                    <Tooltip title={cat.healthEffects} placement="top">
                      <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'default' }}>
                        {cat.healthEffects}
                      </Typography>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.disabled">—</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <CatalogRowActions
                    onEdit={() => { setEditTarget(cat); setModalOpen(true); }}
                    onDelete={() => setDeleteTarget(cat)}
                  />
                </TableCell>
              </TableRow>
            ))}
      </CatalogTableView>

      <RiskExposureCategoryFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        category={editTarget}
        isPending={isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar categoría"
        message={`¿Eliminar la categoría "${deleteTarget?.name}"?`}
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
