import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Divider,
} from '@mui/material';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { autoFormatCedula } from '@/utils/cedula';
import { autoFormatPhone } from '@/utils/phone';
import type { PatientFormData } from './CreatePatientModal';
import type { Company, Position } from '../types';

interface PatientFormFieldsProps {
  control: Control<PatientFormData>;
  errors: FieldErrors<PatientFormData>;
  companies: Company[];
  positions: Position[];
  selectedCompanyId: string;
  onCompanyChange: (id: string) => void;
}

export function PatientFormFields({
  control,
  errors,
  companies,
  positions,
  selectedCompanyId,
  onCompanyChange,
}: PatientFormFieldsProps) {
  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={2}>
        <Controller
          name="cedula"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Cédula de Identidad"
              placeholder="Ej: 27736710"
              error={!!errors.cedula}
              helperText={errors.cedula?.message}
              fullWidth
              onBlur={(e) => {
                const formatted = autoFormatCedula(e.target.value);
                field.onChange(formatted);
                field.onBlur();
              }}
            />
          )}
        />
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nombre"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              fullWidth
            />
          )}
        />
      </Stack>

      <Stack direction="row" spacing={2}>
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Apellido"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              fullWidth
            />
          )}
        />
        <Controller
          name="birthDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="date"
              label="Fecha de Nacimiento"
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.birthDate}
              helperText={errors.birthDate?.message}
              fullWidth
            />
          )}
        />
      </Stack>

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Correo Electrónico"
            type="email"
            placeholder="correo@empresa.com"
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        )}
      />

      <Stack direction="row" spacing={2}>
        <Controller
          name="companyId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.companyId}>
              <InputLabel>Empresa empleadora</InputLabel>
              <Select
                {...field}
                label="Empresa empleadora"
                onChange={(e) => {
                  field.onChange(e);
                  onCompanyChange(e.target.value);
                }}
              >
                {companies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.companyId && <FormHelperText>{errors.companyId.message}</FormHelperText>}
            </FormControl>
          )}
        />
        <Controller
          name="positionId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.positionId} disabled={!selectedCompanyId}>
              <InputLabel>Cargo del paciente</InputLabel>
              <Select {...field} label="Cargo del paciente">
                {positions.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.positionId && <FormHelperText>{errors.positionId.message}</FormHelperText>}
            </FormControl>
          )}
        />
      </Stack>

      <Divider />
      <Typography variant="subtitle2" color="text.secondary">
        Contacto de Emergencia
      </Typography>

      <Stack direction="row" spacing={2}>
        <Controller
          name="emergencyContact.name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nombre del contacto"
              error={!!errors.emergencyContact?.name}
              helperText={errors.emergencyContact?.name?.message}
              fullWidth
            />
          )}
        />
        <Controller
          name="emergencyContact.phone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Teléfono"
              placeholder="04145652189"
              error={!!errors.emergencyContact?.phone}
              helperText={errors.emergencyContact?.phone?.message}
              fullWidth
              onBlur={(e) => {
                const formatted = autoFormatPhone(e.target.value);
                field.onChange(formatted);
                field.onBlur();
              }}
            />
          )}
        />
      </Stack>

      <Controller
        name="emergencyContact.relationship"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Parentesco"
            placeholder="Ej: Madre, Cónyuge, Hermano"
            error={!!errors.emergencyContact?.relationship}
            helperText={errors.emergencyContact?.relationship?.message}
          />
        )}
      />
    </Stack>
  );
}
