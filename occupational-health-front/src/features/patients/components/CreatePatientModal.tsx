import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePatient } from '../hooks/usePatients';
import { useCompanies } from '../hooks/useCompanies';
import { usePositions } from '../hooks/usePositions';
import { PatientFormFields } from './PatientFormFields';

const schema = z.object({
  cedula: z.string()
    .regex(/^[VEve]-?\d{7,}$/, 'La cédula debe tener al menos 7 dígitos y comenzar con V o E'),
  firstName: z.string().min(1, 'El nombre es obligatorio').max(255)
    .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/, 'Solo se permiten letras'),
  lastName: z.string().min(1, 'El apellido es obligatorio').max(255)
    .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/, 'Solo se permiten letras'),
  birthDate: z.string().min(1, 'La fecha de nacimiento es obligatoria')
    .refine((v) => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return new Date(v) < today;
    }, { message: 'La fecha de nacimiento no puede ser hoy ni una fecha futura' }),
  email: z.string().email('Correo electrónico inválido'),
  companyId: z.string().uuid('Selecciona una empresa'),
  positionId: z.string().uuid('Selecciona un cargo'),
  emergencyContact: z.object({
    name: z.string().max(255).optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    relationship: z.string().max(100).optional().or(z.literal('')),
  }).optional(),
});

export type PatientFormData = z.infer<typeof schema>;

interface CreatePatientModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePatientModal({ open, onClose }: CreatePatientModalProps) {
  const { mutate: createPatient, isPending } = useCreatePatient();
  const { data: companies = [] } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const { data: positions = [] } = usePositions(selectedCompanyId || undefined);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(schema),
  });

  const handleClose = () => {
    reset();
    setSelectedCompanyId('');
    onClose();
  };

  const handleCompanyChange = (id: string) => {
    setSelectedCompanyId(id);
    setValue('positionId', '' as PatientFormData['positionId']);
  };

  const onSubmit = (data: PatientFormData) => {
    const hasEmergency = !!(data.emergencyContact?.name || data.emergencyContact?.phone || data.emergencyContact?.relationship);
    const payload = {
      ...data,
      emergencyContact: hasEmergency ? data.emergencyContact : undefined,
    };
    createPatient(payload, { onSuccess: handleClose });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5,
        }}
      >
        Nuevo Paciente
        <IconButton size="small" onClick={handleClose} sx={{ color: 'inherit' }}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto', pt: 3 }}>
          <PatientFormFields
            control={control}
            errors={errors}
            companies={companies}
            positions={positions}
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={handleCompanyChange}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar Paciente'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
