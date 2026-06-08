import { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import { SimpleNameModal } from './SimpleNameModal';
import { IndicatorAccordion } from './IndicatorAccordion';
import { usePsychologicalIndicators, useCreatePsychologicalIndicator } from '@/features/psychological-indicators';

export function PsychologicalIndicatorsPanel() {
  const { data: indicators = [], isLoading } = usePsychologicalIndicators();
  const { mutate: create, isPending: isCreating } = useCreatePsychologicalIndicator();

  const [modalOpen, setModalOpen] = useState(false);

  const handleCreate = (name: string) => {
    create({ name }, { onSuccess: () => setModalOpen(false) });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Indicadores Psicológicos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestiona los indicadores (ansiedad, depresión, etc.) y sus valores para evaluaciones pre/post vacacionales.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setModalOpen(true)}>
          Nuevo Indicador
        </Button>
      </Box>

      {indicators.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.disabled">No hay indicadores registrados</Typography>
        </Box>
      ) : (
        <Box>
          {indicators.map((indicator) => (
            <IndicatorAccordion key={indicator.id} indicator={indicator} />
          ))}
        </Box>
      )}

      <SimpleNameModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo Indicador Psicológico"
        label="Nombre del Indicador"
        placeholder="Ej: Nivel de Ansiedad"
        isPending={isCreating}
        onSubmit={handleCreate}
      />
    </>
  );
}
