import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Stack, TextField, Box, Typography, Chip,
} from '@mui/material';
import { CloseOutlined, AddOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useCreatePosition, useUpdatePosition } from '../hooks/usePositions';
import { useRisks } from '@/features/catalogs/hooks/useRisks';
import { positionsService } from '../services/positions.service';
import { SearchableSelect } from '@/components/SearchableSelect';
import { COMPANIES_KEY } from '../hooks/useCompanies';
import type { Position, PositionRisk } from '../types';

const RISK_TYPE_COLOR: Record<string, 'error' | 'warning' | 'info' | 'success' | 'secondary' | 'default'> = {
  Fisico: 'error', Quimico: 'warning', Biologico: 'success',
  Mecanico: 'info', Disergonomicos: 'secondary', Psicosocial: 'default',
};

const schema = z.object({
  name: z.string().min(1, 'El nombre del cargo es obligatorio').max(255),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface PositionFormModalProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  position?: Position | null;
}

export function PositionFormModal({ open, onClose, companyId, position }: PositionFormModalProps) {
  const isEdit = !!position;
  const { mutate: createPosition, isPending: isCreating } = useCreatePosition();
  const { mutate: updatePosition, isPending: isUpdating } = useUpdatePosition();
  const { data: allRisks = [] } = useRisks();
  const queryClient = useQueryClient();
  const isPending = isCreating || isUpdating;

  const [selectedRiskId, setSelectedRiskId] = useState('');
  const [pendingRisks, setPendingRisks] = useState<PositionRisk[]>([]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset(position ? { name: position.name, description: position.description ?? '' } : { name: '', description: '' });
      setPendingRisks([]);
      setSelectedRiskId('');
    }
  }, [open, position, reset]);

  const availableRisks = allRisks.filter((r) => !pendingRisks.some((pr) => pr.id === r.id));

  const handleAddRisk = () => {
    const risk = allRisks.find((r) => r.id === selectedRiskId);
    if (!risk) return;
    setPendingRisks((prev) => [...prev, risk]);
    setSelectedRiskId('');
  };

  const handleClose = () => { reset(); setPendingRisks([]); setSelectedRiskId(''); onClose(); };

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updatePosition({ id: position.id, payload: data }, { onSuccess: handleClose });
      return;
    }

    createPosition({ ...data, companyId }, {
      onSuccess: async ({ position: newPos }) => {
        if (pendingRisks.length > 0) {
          const results = await Promise.allSettled(
            pendingRisks.map((r) => positionsService.addRisk(newPos.id, r.id)),
          );
          const failed = results.filter((r) => r.status === 'rejected').length;
          if (failed > 0) toast.warning(`${failed} riesgo(s) no pudieron agregarse al cargo.`);
          queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
        }
        handleClose();
      },
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5 }}>
        {isEdit ? 'Editar Cargo' : 'Nuevo Cargo'}
        <IconButton size="small" onClick={handleClose} sx={{ color: 'inherit' }}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Nombre del Cargo" placeholder="Ej: Médico Ocupacional"
                  error={!!errors.name} helperText={errors.name?.message} />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Descripción" placeholder="Breve descripción del cargo y sus responsabilidades..."
                  multiline rows={3} error={!!errors.description} helperText={errors.description?.message} />
              )}
            />

            {!isEdit && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: -1 }}>
                  Riesgos de Exposición (opcional)
                </Typography>
                <Stack direction="row" spacing={1}>
                  <SearchableSelect
                    options={availableRisks}
                    value={selectedRiskId}
                    onChange={setSelectedRiskId}
                    label="Seleccionar riesgo"
                    disabled={availableRisks.length === 0}
                    noOptionsText="No hay más riesgos disponibles"
                    getOptionLabel={(o) => `${(o as unknown as PositionRisk).type}: ${o.name}`}
                    renderOptionContent={(o) => {
                      const r = o as unknown as PositionRisk;
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={r.type} size="small" color={RISK_TYPE_COLOR[r.type] ?? 'default'} sx={{ fontSize: '0.7rem' }} />
                          {r.name}
                        </Box>
                      );
                    }}
                  />
                  <Button variant="outlined" startIcon={<AddOutlined />} onClick={handleAddRisk}
                    disabled={!selectedRiskId} sx={{ flexShrink: 0 }}>
                    Agregar
                  </Button>
                </Stack>
                {pendingRisks.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {pendingRisks.map((r) => (
                      <Chip
                        key={r.id}
                        label={`${r.type}: ${r.name}`}
                        size="small"
                        color={RISK_TYPE_COLOR[r.type] ?? 'default'}
                        onDelete={() => setPendingRisks((prev) => prev.filter((x) => x.id !== r.id))}
                      />
                    ))}
                  </Box>
                )}
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isPending}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Guardar Cargo'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
