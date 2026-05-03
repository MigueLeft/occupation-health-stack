import { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Box, Typography, Divider,
  TextField, MenuItem, FormControlLabel, Checkbox, Autocomplete,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdatePatient } from '../hooks/usePatients';
import { useCompanies } from '../hooks/useCompanies';
import { usePositions } from '../hooks/usePositions';
import { useAllergies } from '@/features/catalogs/hooks/useAllergies';
import type { Patient } from '../types';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DOMINANT_HANDS = [
  { value: 'right', label: 'Derecha' },
  { value: 'left', label: 'Izquierda' },
  { value: 'both', label: 'Ambas' },
];

const schema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio').max(255)
    .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/, 'Solo se permiten letras'),
  lastName: z.string().min(1, 'El apellido es obligatorio').max(255)
    .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/, 'Solo se permiten letras'),
  birthDate: z.string().min(1, 'La fecha de nacimiento es obligatoria')
    .refine((v) => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return new Date(v) < today;
    }, { message: 'La fecha de nacimiento no puede ser hoy ni una fecha futura' }),
  email: z.email('Correo electrónico inválido'),
  companyId: z.string().uuid('Selecciona una empresa'),
  positionId: z.string().uuid('Selecciona un cargo'),
  bloodType: z.string().optional(),
  dominantHand: z.string().optional(),
  usesGlasses: z.boolean().optional(),
  allergyIds: z.array(z.string()).optional(),
  emergencyContact: z.object({
    name: z.string().max(255).optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    relationship: z.string().max(100).optional().or(z.literal('')),
  }).optional(),
});

type EditPatientFormData = z.infer<typeof schema>;

interface EditPatientModalProps {
  open: boolean;
  patient: Patient | null;
  onClose: () => void;
}

export function EditPatientModal({ open, patient, onClose }: EditPatientModalProps) {
  const { mutate: updatePatient, isPending } = useUpdatePatient();
  const { data: companies = [] } = useCompanies();
  const { data: allergies = [] } = useAllergies();

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<EditPatientFormData>({
    resolver: zodResolver(schema),
  });

  const watchedCompanyId = useWatch({ control, name: 'companyId' }) ?? '';
  const allergyIds = useWatch({ control, name: 'allergyIds' }) ?? [];
  const { data: positions = [] } = usePositions(watchedCompanyId || undefined);
  const selectedAllergies = allergies.filter((a) => allergyIds.includes(a.id));

  useEffect(() => {
    if (patient && open) {
      reset({
        firstName: patient.firstName,
        lastName: patient.lastName,
        birthDate: patient.birthDate ?? '',
        email: patient.email ?? '',
        companyId: patient.companyId ?? '',
        positionId: patient.positionId ?? '',
        bloodType: patient.bloodType ?? '',
        dominantHand: patient.dominantHand ?? '',
        usesGlasses: patient.usesGlasses ?? false,
        allergyIds: patient.allergies?.map((a) => a.id) ?? [],
        emergencyContact: patient.emergencyContact ?? { name: '', phone: '', relationship: '' },
      });
    }
  }, [patient, open, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: EditPatientFormData) => {
    if (!patient) return;
    const hasEmergency = !!(data.emergencyContact?.name || data.emergencyContact?.phone || data.emergencyContact?.relationship);
    const payload = {
      ...data,
      emergencyContact: hasEmergency ? data.emergencyContact : undefined,
    };
    updatePatient({ cedula: patient.cedula, payload }, { onSuccess: handleClose });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5,
        }}
      >
        Editar Paciente
        <IconButton size="small" onClick={handleClose} sx={{ color: 'inherit' }}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto', pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Basic info */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.07em' }}>
              Datos Básicos
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller name="firstName" control={control} render={({ field }) => (
                <TextField {...field} label="Nombre" error={!!errors.firstName} helperText={errors.firstName?.message} size="small" fullWidth
                  onChange={(e) => field.onChange(e.target.value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]/g, ''))}
                />
              )} />
              <Controller name="lastName" control={control} render={({ field }) => (
                <TextField {...field} label="Apellido" error={!!errors.lastName} helperText={errors.lastName?.message} size="small" fullWidth
                  onChange={(e) => field.onChange(e.target.value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]/g, ''))}
                />
              )} />
              <Controller name="birthDate" control={control} render={({ field }) => (
                <TextField {...field} label="Fecha de Nacimiento" type="date" error={!!errors.birthDate} helperText={errors.birthDate?.message} size="small" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
              )} />
              <Controller name="email" control={control} render={({ field }) => (
                <TextField {...field} label="Correo Electrónico" error={!!errors.email} helperText={errors.email?.message} size="small" fullWidth />
              )} />
              <Controller name="companyId" control={control} render={({ field }) => (
                <TextField {...field} select label="Empresa" error={!!errors.companyId} helperText={errors.companyId?.message} size="small" fullWidth
                  onChange={(e) => { field.onChange(e); setValue('positionId', ''); }}
                >
                  {companies.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </TextField>
              )} />
              <Controller name="positionId" control={control} render={({ field }) => (
                <TextField {...field} select label="Cargo" error={!!errors.positionId} helperText={errors.positionId?.message} size="small" fullWidth disabled={!watchedCompanyId}>
                  {positions.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </TextField>
              )} />
            </Box>

            <Divider />

            {/* Clinical data */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.07em' }}>
              Datos Clínicos
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller name="bloodType" control={control} render={({ field }) => (
                <TextField {...field} select label="Grupo Sanguíneo" size="small" fullWidth>
                  <MenuItem value=""><em>Sin especificar</em></MenuItem>
                  {BLOOD_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              )} />
              <Controller name="dominantHand" control={control} render={({ field }) => (
                <TextField {...field} select label="Mano Dominante" size="small" fullWidth>
                  <MenuItem value=""><em>Sin especificar</em></MenuItem>
                  {DOMINANT_HANDS.map((h) => <MenuItem key={h.value} value={h.value}>{h.label}</MenuItem>)}
                </TextField>
              )} />
            </Box>
            <Controller name="usesGlasses" control={control} render={({ field }) => (
              <FormControlLabel control={<Checkbox checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} />} label="Usa lentes" />
            )} />
            <Autocomplete
              multiple
              options={allergies}
              getOptionLabel={(o) => o.name}
              value={selectedAllergies}
              onChange={(_, newValue) => setValue('allergyIds', newValue.map((a) => a.id))}
              renderInput={(params) => <TextField {...params} label="Alergias" size="small" />}
              isOptionEqualToValue={(o, v) => o.id === v.id}
            />

            <Divider />

            {/* Emergency contact */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.07em' }}>
              Contacto de Emergencia (opcional)
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <Controller name="emergencyContact.name" control={control} render={({ field }) => (
                <TextField {...field} label="Nombre (opcional)" error={!!errors.emergencyContact?.name} helperText={errors.emergencyContact?.name?.message} size="small" fullWidth />
              )} />
              <Controller name="emergencyContact.phone" control={control} render={({ field }) => (
                <TextField {...field} label="Teléfono (opcional)" error={!!errors.emergencyContact?.phone} helperText={errors.emergencyContact?.phone?.message} size="small" fullWidth />
              )} />
              <Controller name="emergencyContact.relationship" control={control} render={({ field }) => (
                <TextField {...field} label="Parentesco (opcional)" error={!!errors.emergencyContact?.relationship} helperText={errors.emergencyContact?.relationship?.message} size="small" fullWidth />
              )} />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isPending}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
