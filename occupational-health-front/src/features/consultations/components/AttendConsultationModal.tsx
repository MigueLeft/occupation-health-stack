import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Typography,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CONSULTATION_RESULTS, PSYCHOLOGICAL_RESULTS, CONSULTATION_TYPE_LABELS } from '../types';
import type { ConsultationWithDetails, UpdateConsultationPayload } from '../types';
import { MedicaFields, PsicologicaFields } from './AttendConsultationFields';

const schema = z.object({
  consultationResult: z.enum(CONSULTATION_RESULTS).or(z.literal('')).optional(),
  psychologicalResult: z.enum(PSYCHOLOGICAL_RESULTS).or(z.literal('')).optional(),
  interviewConducted: z.boolean().optional(),
  currentTreatment: z.string().optional(),
  diagnosisDescription: z.string().optional(),
  recommendations: z.object({
    suggestedPPE: z.string().optional(),
    medicalAdequacyMeasures: z.string().optional(),
    psychologicalAdequacyMeasures: z.string().optional(),
  }).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  consultation: ConsultationWithDetails;
  isPending: boolean;
  onSubmit: (id: string, payload: UpdateConsultationPayload) => void;
}

function AttendForm({ consultation, isPending, onSubmit, onClose }: Omit<Props, 'open'>) {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      consultationResult: consultation.consultationResult ?? '',
      psychologicalResult: consultation.psychologicalResult ?? '',
      interviewConducted: consultation.interviewConducted ?? false,
      currentTreatment: consultation.currentTreatment ?? '',
      diagnosisDescription: consultation.diagnosisDescription ?? '',
      recommendations: consultation.recommendations ?? {},
    },
  });

  const onFormSubmit = (data: FormData) => {
    const payload: UpdateConsultationPayload = {
      currentTreatment: data.currentTreatment || undefined,
      diagnosisDescription: data.diagnosisDescription || undefined,
    };
    if (consultation.type === 'Medica') {
      payload.consultationResult = data.consultationResult || undefined;
      payload.recommendations = data.recommendations;
    } else {
      payload.psychologicalResult = data.psychologicalResult || undefined;
      payload.interviewConducted = data.interviewConducted;
    }
    onSubmit(consultation.id, payload);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Tipo: <strong>{CONSULTATION_TYPE_LABELS[consultation.type]}</strong> · Paciente: <strong>{consultation.patientName}</strong>
          </Typography>
          {consultation.type === 'Medica' ? <MedicaFields /> : <PsicologicaFields />}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={onClose} disabled={isPending}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar Consulta'}
          </Button>
        </DialogActions>
      </form>
    </FormProvider>
  );
}

export function AttendConsultationModal({ open, onClose, consultation, isPending, onSubmit }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5 }}>
        Atender Consulta
        <IconButton size="small" onClick={onClose} sx={{ color: 'inherit' }}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>
      <AttendForm key={consultation.id} consultation={consultation} isPending={isPending} onSubmit={onSubmit} onClose={onClose} />
    </Dialog>
  );
}
