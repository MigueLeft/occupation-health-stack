import { useState } from 'react';
import { Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { PersonOffOutlined } from '@mui/icons-material';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useBackfillExEmployees } from '@/features/patients';

export function GenerateExEmployeesCard() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate, isPending } = useBackfillExEmployees();

  const handleConfirm = () => {
    mutate(undefined, { onSettled: () => setConfirmOpen(false) });
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, alignItems: 'center' }}>
        <PersonOffOutlined color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Generar Ex-Empleados
        </Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Migración retroactiva: busca pacientes que ya tengan una consulta de Egreso
        finalizada y aún no estén marcados como ex-empleados, y los mueve a la lista
        de ex-empleados de su empresa. Útil para egresos registrados antes de esta
        funcionalidad. Es seguro ejecutarla varias veces.
      </Typography>

      <Button
        variant="contained"
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
        startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : <PersonOffOutlined />}
      >
        {isPending ? 'Generando...' : 'Generar Ex-Empleados'}
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Generar ex-empleados?"
        message="Se revisarán todos los pacientes con una consulta de Egreso ya finalizada y se marcarán como ex-empleados si aún no lo están. Esta acción no afecta a pacientes sin egresos registrados."
        confirmLabel="Sí, generar"
        confirmColor="primary"
        loading={isPending}
        onConfirm={handleConfirm}
        onClose={() => setConfirmOpen(false)}
      />
    </Paper>
  );
}
