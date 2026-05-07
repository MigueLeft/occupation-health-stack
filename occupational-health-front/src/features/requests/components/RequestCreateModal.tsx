import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Stack, TextField, MenuItem, Autocomplete,
  Box, CircularProgress, Typography,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatients } from '@/features/patients';
import {
  EVALUATION_REASONS, EVALUATION_REASON_LABELS,
  CONSULTATION_TYPES, CONSULTATION_TYPE_LABELS,
} from '../types';
import type { CreateRequestPayload } from '../types';

const schema = z.object({
  requestDate: z.string().min(1, 'La fecha es obligatoria'),
  evaluationReason: z.enum(EVALUATION_REASONS, { error: 'El motivo es obligatorio' }),
  patientId: z.string().min(1, 'El paciente es obligatorio'),
  scheduledConsultationType: z.enum(CONSULTATION_TYPES).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  isPending: boolean;
  onSubmit: (payload: CreateRequestPayload) => void;
}

export function RequestCreateModal({ open, onClose, isPending, onSubmit }: Props) {
  const { data: patients = [] } = usePatients();

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { requestDate: undefined, evaluationReason: undefined, patientId: '', scheduledConsultationType: undefined },
  });

  const evaluationReason = useWatch({ control, name: 'evaluationReason' });
  const isConsulta = evaluationReason === 'Consulta';

  const handleClose = () => { reset(); onClose(); };

  const onFormSubmit = (data: FormData) => {
    const payload: CreateRequestPayload = {
      evaluationReason: data.evaluationReason,
      patientId: data.patientId,
      requestDate: data.requestDate,
    };
    if (isConsulta && data.scheduledConsultationType) {
      payload.scheduledConsultationType = data.scheduledConsultationType;
    }
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={isPending ? undefined : handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5 }}>
        Nueva Solicitud
        <IconButton size="small" onClick={handleClose} disabled={isPending} sx={{ color: 'inherit' }}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      {isPending && (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 10, bgcolor: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: 'inherit' }}>
          <CircularProgress size={48} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Creando solicitud y consulta...
          </Typography>
        </Box>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Controller name="requestDate" control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Fecha de la Solicitud"
                  type="date"
                  fullWidth
                  value={field.value ?? ''}
                  error={!!errors.requestDate}
                  helperText={errors.requestDate?.message}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )} />

            <Controller name="evaluationReason" control={control}
              render={({ field }) => (
                <TextField {...field} select label="Motivo de Evaluación" fullWidth
                  error={!!errors.evaluationReason} helperText={errors.evaluationReason?.message}
                >
                  {EVALUATION_REASONS.map((r) => (
                    <MenuItem key={r} value={r}>{EVALUATION_REASON_LABELS[r]}</MenuItem>
                  ))}
                </TextField>
              )} />

            {isConsulta && (
              <Controller name="scheduledConsultationType" control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Tipo de Consulta Programada" fullWidth
                    error={!!errors.scheduledConsultationType} helperText={errors.scheduledConsultationType?.message}
                  >
                    {CONSULTATION_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>{CONSULTATION_TYPE_LABELS[t]}</MenuItem>
                    ))}
                  </TextField>
                )} />
            )}

            <Controller name="patientId" control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  options={patients}
                  getOptionLabel={(p) => `${p.firstName} ${p.lastName} — ${p.cedula}`}
                  value={patients.find((p) => p.cedula === value) ?? null}
                  onChange={(_, patient) => onChange(patient?.cedula ?? '')}
                  renderInput={(params) => (
                    <TextField {...params} label="Paciente" placeholder="Buscar paciente..."
                      error={!!errors.patientId} helperText={errors.patientId?.message}
                    />
                  )}
                />
              )} />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isPending}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar Solicitud'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
