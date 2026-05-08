import { useState } from 'react';
import { TableRow, TableCell, Chip, Typography, Tooltip, IconButton } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import { CatalogTableView } from './CatalogTableView';
import { RiskExposureCategoryFormModal } from './RiskExposureCategoryFormModal';
import {
  useRiskExposureCategories,
  useCreateRiskExposureCategory,
  useUpdateRiskExposureCategory,
} from '../hooks/useRiskExposureCategories';
import { RISK_TYPES } from '../types';
import type { RiskExposureCategory } from '../types';

const TYPE_COLORS: Record<string, string> = {
  Fisico: '#fff3e0', Quimico: '#fce4ec', Biologico: '#e8f5e9',
  Mecanico: '#e3f2fd', Disergonomicos: '#f3e5f5', Psicosocial: '#fffde7',
};

interface EditTarget {
  riskType: string;
  record: RiskExposureCategory | undefined;
}

export function RiskExposureCategoriesPanel() {
  const { data: categories = [], isLoading } = useRiskExposureCategories();
  const { mutate: create, isPending: isCreating } = useCreateRiskExposureCategory();
  const { mutate: update, isPending: isUpdating } = useUpdateRiskExposureCategory();

  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const isPending = isCreating || isUpdating;

  const handleSubmit = ({ healthEffects }: { healthEffects?: string }) => {
    if (!editTarget) return;
    const effects = healthEffects || undefined;
    if (editTarget.record) {
      update(
        { id: editTarget.record.id, payload: { healthEffects: effects } },
        { onSuccess: () => setEditTarget(null) },
      );
    } else {
      create(
        { riskType: editTarget.riskType, name: editTarget.riskType, healthEffects: effects },
        { onSuccess: () => setEditTarget(null) },
      );
    }
  };

  return (
    <>
      <CatalogTableView
        title="Tipos de Riesgo"
        headers={['Tipo de Riesgo', 'Efectos en la Salud']}
        isLoading={isLoading}
        showAddButton={false}
      >
        {RISK_TYPES.map((riskType) => {
              const record = categories.find((c) => c.riskType === riskType);
              return (
                <TableRow key={riskType} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell sx={{ width: 160 }}>
                    <Chip
                      label={riskType}
                      size="small"
                      sx={{ bgcolor: TYPE_COLORS[riskType] ?? '#f5f5f5', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 400 }}>
                    {record?.healthEffects ? (
                      <Tooltip title={record.healthEffects} placement="top">
                        <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'default' }}>
                          {record.healthEffects}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.disabled">Sin descripción</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ width: 60 }}>
                    <IconButton
                      size="small"
                      onClick={() => setEditTarget({ riskType, record })}
                      title="Editar efectos en la salud"
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
      </CatalogTableView>

      {editTarget && (
        <RiskExposureCategoryFormModal
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          riskType={editTarget.riskType}
          currentHealthEffects={editTarget.record?.healthEffects}
          isPending={isPending}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
