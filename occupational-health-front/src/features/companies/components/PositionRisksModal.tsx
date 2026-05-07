import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Typography, IconButton,
  Stack, Chip, Divider, TextField, MenuItem, Button,
} from '@mui/material';
import { CloseOutlined, AddOutlined, DeleteOutlined } from '@mui/icons-material';
import { useAddPositionRisk, useRemovePositionRisk } from '../hooks/usePositions';
import { useRisks } from '@/features/catalogs/hooks/useRisks';
import type { Position } from '../types';

const RISK_TYPE_COLOR: Record<string, 'error' | 'warning' | 'info' | 'success' | 'secondary' | 'default'> = {
  Fisico: 'error',
  Quimico: 'warning',
  Biologico: 'success',
  Mecanico: 'info',
  Disergonomicos: 'secondary',
  Psicosocial: 'default',
};

interface Props {
  open: boolean;
  onClose: () => void;
  position: Position;
}

export function PositionRisksModal({ open, onClose, position }: Props) {
  const [selectedRiskId, setSelectedRiskId] = useState('');
  const { data: allRisks = [] } = useRisks();
  const { mutate: addRisk, isPending: isAdding } = useAddPositionRisk();
  const { mutate: removeRisk, isPending: isRemoving } = useRemovePositionRisk();

  const currentRiskIds = new Set((position.risks ?? []).map((r) => r.id));
  const availableRisks = allRisks.filter((r) => !currentRiskIds.has(r.id));

  const sorted = [...(position.risks ?? [])].sort((a, b) => a.type.localeCompare(b.type));

  const handleAdd = () => {
    if (!selectedRiskId) return;
    addRisk({ positionId: position.id, riskId: selectedRiskId }, {
      onSuccess: () => setSelectedRiskId(''),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        Riesgos de Exposición — {position.name}
        <IconButton size="small" onClick={onClose} sx={{ color: 'inherit' }}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2.5}>
          {/* Agregar riesgo */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Agregar riesgo</Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                select
                size="small"
                label="Seleccionar riesgo"
                value={selectedRiskId}
                onChange={(e) => setSelectedRiskId(e.target.value)}
                sx={{ flex: 1 }}
                disabled={availableRisks.length === 0}
              >
                {availableRisks.length === 0 ? (
                  <MenuItem disabled value="">Todos los riesgos ya están agregados</MenuItem>
                ) : (
                  availableRisks.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={r.type} size="small" color={RISK_TYPE_COLOR[r.type] ?? 'default'} sx={{ fontSize: '0.7rem' }} />
                        {r.name}
                      </Box>
                    </MenuItem>
                  ))
                )}
              </TextField>
              <Button
                variant="contained"
                startIcon={<AddOutlined />}
                onClick={handleAdd}
                disabled={!selectedRiskId || isAdding}
                sx={{ flexShrink: 0 }}
              >
                Agregar
              </Button>
            </Stack>
          </Box>

          <Divider />

          {/* Lista de riesgos actuales */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Riesgos asignados ({sorted.length})
            </Typography>
            {sorted.length === 0 ? (
              <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 3 }}>
                Este cargo no tiene riesgos de exposición asignados
              </Typography>
            ) : (
              <Stack spacing={1}>
                {sorted.map((risk) => (
                  <Box
                    key={risk.id}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}
                  >
                    <Chip label={risk.type} size="small" color={RISK_TYPE_COLOR[risk.type] ?? 'default'} />
                    <Typography variant="body2" sx={{ flex: 1 }}>{risk.name}</Typography>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={isRemoving}
                      onClick={() => removeRisk({ positionId: position.id, riskId: risk.id })}
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
