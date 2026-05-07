import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Skeleton, Chip, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, IconButton,
} from '@mui/material';
import { AddOutlined, CloseOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CatalogRowActions } from './CatalogRowActions';
import { useGeoCatalog, useCreateGeoLocation, useUpdateGeoLocation, useDeleteGeoLocation } from '../hooks/useGeoCatalog';
import { GEO_TYPES } from '../types';
import type { GeoLocation, GeoType } from '../types';

const GEO_TYPE_COLOR: Record<GeoType, 'primary' | 'secondary' | 'success' | 'warning'> = {
  Estado: 'primary',
  Ciudad: 'secondary',
  Municipio: 'success',
  Parroquia: 'warning',
};

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  type: z.enum(GEO_TYPES, { error: 'El tipo es obligatorio' }),
});
type FormData = z.infer<typeof schema>;

interface GeoFormModalProps {
  open: boolean;
  onClose: () => void;
  editTarget: GeoLocation | null;
  isPending: boolean;
  onSubmit: (data: FormData) => void;
}

function GeoFormModal({ open, onClose, editTarget, isPending, onSubmit }: GeoFormModalProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'Estado' },
  });

  useEffect(() => {
    if (open) {
      reset(editTarget ? { name: editTarget.name, type: editTarget.type as GeoType } : { name: '', type: 'Estado' });
    }
  }, [open, editTarget, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        {editTarget ? 'Editar Ubicación' : 'Nueva Ubicación Geográfica'}
        <IconButton size="small" onClick={onClose} sx={{ color: 'inherit' }}><CloseOutlined fontSize="small" /></IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Tipo"
                  error={!!errors.type}
                  helperText={errors.type?.message}
                  disabled={!!editTarget}
                  fullWidth
                >
                  {GEO_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              )}
            />
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre"
                  placeholder="Ej: Zulia, Maracaibo, Jesús Enrique Lossada..."
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={onClose} disabled={isPending}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Guardando...' : editTarget ? 'Guardar Cambios' : 'Agregar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export function GeoCatalogPanel() {
  const { data: locations = [], isLoading } = useGeoCatalog();
  const { mutate: create, isPending: isCreating } = useCreateGeoLocation();
  const { mutate: update, isPending: isUpdating } = useUpdateGeoLocation();
  const { mutate: remove, isPending: isDeleting } = useDeleteGeoLocation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<GeoLocation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GeoLocation | null>(null);
  const isPending = isCreating || isUpdating;

  const grouped = GEO_TYPES.map((type) => ({
    type,
    items: locations.filter((l) => l.type === type),
  }));

  const handleSubmit = (data: { name: string; type: string }) => {
    if (editTarget) {
      update({ id: editTarget.id, payload: { name: data.name } }, {
        onSuccess: () => { setEditTarget(null); setModalOpen(false); },
      });
    } else {
      create(data, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h2">Catálogo Geográfico</Typography>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={() => { setEditTarget(null); setModalOpen(true); }}>
          Agregar
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ fontWeight: 600, py: 1.5, color: 'white', borderBottom: 'none' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 1.5, color: 'white', borderBottom: 'none' }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 1.5, color: 'white', borderBottom: 'none' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {[1, 2, 3].map((j) => <TableCell key={j}><Skeleton /></TableCell>)}
                    </TableRow>
                  ))
                : grouped.flatMap(({ type, items }) =>
                    items.length === 0 ? [] : items.map((loc) => (
                      <TableRow key={loc.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{loc.name}</TableCell>
                        <TableCell>
                          <Chip label={type} size="small" color={GEO_TYPE_COLOR[type as GeoType]} />
                        </TableCell>
                        <TableCell>
                          <CatalogRowActions
                            onEdit={() => { setEditTarget(loc); setModalOpen(true); }}
                            onDelete={() => setDeleteTarget(loc)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )
              }
              {!isLoading && locations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                    No hay ubicaciones geográficas registradas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <GeoFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        editTarget={editTarget}
        isPending={isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar ubicación"
        message={`¿Eliminar "${deleteTarget?.name}" (${deleteTarget?.type})?`}
        confirmLabel="Eliminar"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={() => { if (deleteTarget) remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }); }}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
