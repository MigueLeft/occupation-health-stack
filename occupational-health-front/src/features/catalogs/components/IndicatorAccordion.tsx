import { useState } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography,
  Table, TableBody, TableRow, TableCell, TableHead, Box, Button,
  IconButton, Stack,
} from '@mui/material';
import { ExpandMoreOutlined, DeleteOutlined, EditOutlined, AddOutlined } from '@mui/icons-material';
import { SimpleNameModal } from './SimpleNameModal';
import { IndicatorValueRow } from './IndicatorValueRow';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  useUpdatePsychologicalIndicator,
  useDeletePsychologicalIndicator,
  useCreateIndicatorValue,
} from '@/features/psychological-indicators';
import type { PsychologicalIndicator } from '@/features/psychological-indicators';

interface Props {
  indicator: PsychologicalIndicator;
}

export function IndicatorAccordion({ indicator }: Props) {
  const { mutate: updateIndicator, isPending: isUpdating } = useUpdatePsychologicalIndicator();
  const { mutate: deleteIndicator, isPending: isDeleting } = useDeletePsychologicalIndicator();
  const { mutate: createValue, isPending: isCreatingValue } = useCreateIndicatorValue();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addValueOpen, setAddValueOpen] = useState(false);

  const handleEditIndicator = (name: string) => {
    updateIndicator({ id: indicator.id, payload: { name } }, { onSuccess: () => setEditOpen(false) });
  };

  const handleAddValue = (name: string) => {
    createValue({ indicatorId: indicator.id, payload: { name } }, { onSuccess: () => setAddValueOpen(false) });
  };

  return (
    <>
      <Accordion variant="outlined" sx={{ borderRadius: 2, mb: 1, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, mr: 1 }}>
            <Typography sx={{ fontWeight: 600 }}>{indicator.name}</Typography>
            <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
              <IconButton size="small" onClick={() => setEditOpen(true)}>
                <EditOutlined fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => setDeleteOpen(true)}>
                <DeleteOutlined fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ pt: 0 }}>
          {indicator.values.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 4, fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>Valor</TableCell>
                  <TableCell width={80} />
                </TableRow>
              </TableHead>
              <TableBody>
                {indicator.values.map((v) => (
                  <IndicatorValueRow key={v.id} indicatorId={indicator.id} value={v} />
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box sx={{ py: 1.5, pl: 4 }}>
              <Typography variant="body2" color="text.disabled">Sin valores registrados</Typography>
            </Box>
          )}

          <Box sx={{ mt: 1.5, pl: 2 }}>
            <Button size="small" startIcon={<AddOutlined />} variant="outlined" onClick={() => setAddValueOpen(true)}>
              Agregar Valor
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <SimpleNameModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar Indicador"
        label="Nombre del Indicador"
        initialName={indicator.name}
        isPending={isUpdating}
        onSubmit={handleEditIndicator}
      />

      <SimpleNameModal
        open={addValueOpen}
        onClose={() => setAddValueOpen(false)}
        title="Nuevo Valor"
        label="Nombre del Valor"
        placeholder="Ej: Leve, Moderado, Severo..."
        isPending={isCreatingValue}
        onSubmit={handleAddValue}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Eliminar indicador"
        message={`¿Eliminar el indicador "${indicator.name}" y todos sus valores?`}
        confirmLabel="Eliminar"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={() => deleteIndicator(indicator.id, { onSuccess: () => setDeleteOpen(false) })}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
