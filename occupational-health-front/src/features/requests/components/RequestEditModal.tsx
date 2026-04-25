import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Stack, TextField, MenuItem,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  EVALUATION_REASONS, EVALUATION_REASON_LABELS,
  REQUEST_STATUSES, REQUEST_STATUS_LABELS,
  CONSULTATION_TYPES, CONSULTATION_TYPE_LABELS,
} from '../types';
import type { AppRequestWithPatient, UpdateRequestPayload } from '../types';

const schema = z.object({
  requestDate: z.string().optional(),
  evaluationReason: z.enum(EVALUATION_REASONS).optional(),
  status: z.enum(REQUEST_STATUSES).optional(),
  scheduledConsultationType: z.enum(CONSULTATION_TYPES).optional(),
  performedConsultationType: z.enum(CONSULTATION_TYPES).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  request: AppRequestWithPatient;
  isPending: boolean;
  onSubmit: (id: string, payload: UpdateRequestPayload) => void;
}

function EditForm({ request, isPending, onSubmit, onClose }: Omit<Props, 'open'>) {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      requestDate: request.requestDate,
      evaluationReason: request.evaluationReason,
      status: request.status,
      scheduledConsultationType: request.scheduledConsultationType ?? undefined,
      performedConsultationType: request.performedConsultationType ?? undefined,
    },
  });

  const evaluationReason = useWatch({ control, name: 'evaluationReason' });
  const isConsulta = evaluationReason === 'Consulta';

  const onFormSubmit = (data: FormData) => onSubmit(request.id, data);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2.5}>
          <Controller name="requestDate" control={control}
            render={({ field }) => (
              <TextField {...field} label="Fecha de la Solicitud" type="date" fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.requestDate} helperText={errors.requestDate?.message}
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

          <Controller name="status" control={control}
            render={({ field }) => (
              <TextField {...field} select label="Estatus" fullWidth
                error={!!errors.status} helperText={errors.status?.message}
              >
                {REQUEST_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>{REQUEST_STATUS_LABELS[s]}</MenuItem>
                ))}
              </TextField>
            )} />

          {isConsulta && (
            <>
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

              <Controller name="performedConsultationType" control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Tipo de Consulta Realizada" fullWidth
                    error={!!errors.performedConsultationType} helperText={errors.performedConsultationType?.message}
                  >
                    <MenuItem value=""><em>Sin registrar</em></MenuItem>
                    {CONSULTATION_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>{CONSULTATION_TYPE_LABELS[t]}</MenuItem>
                    ))}
                  </TextField>
                )} />
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={isPending}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </form>
  );
}

export function RequestEditModal({ open, onClose, request, isPending, onSubmit }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5 }}>
        Editar Solicitud
        <IconButton size="small" onClick={onClose} sx={{ color: 'inherit' }}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>
      <EditForm key={request.id} request={request} isPending={isPending} onSubmit={onSubmit} onClose={onClose} />
    </Dialog>
  );
}
