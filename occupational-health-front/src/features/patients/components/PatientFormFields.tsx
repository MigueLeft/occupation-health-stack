import {
  Stack,
  TextField,
  Typography,
  Divider,
  Autocomplete,
  Box,
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

const LISTBOX_SLOT_PROPS = {
  listbox: { style: { maxHeight: 220 } },
} as const;

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
              onChange={(e) => {
                // Allow only digits and V/E prefix chars
                const val = e.target.value.replace(/[^0-9VEve-]/g, '');
                field.onChange(val);
              }}
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
            <Box sx={{ flex: 1 }}>
              <Autocomplete
                options={companies}
                getOptionLabel={(c) => c.name}
                value={companies.find((c) => c.id === field.value) ?? null}
                onChange={(_, company) => {
                  field.onChange(company?.id ?? '');
                  onCompanyChange(company?.id ?? '');
                }}
                slotProps={LISTBOX_SLOT_PROPS}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {option.name}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Empresa empleadora"
                    error={!!errors.companyId}
                    helperText={errors.companyId?.message}
                  />
                )}
              />
            </Box>
          )}
        />
        <Controller
          name="positionId"
          control={control}
          render={({ field }) => (
            <Box sx={{ flex: 1 }}>
              <Autocomplete
                options={positions}
                getOptionLabel={(p) => p.name}
                value={positions.find((p) => p.id === field.value) ?? null}
                onChange={(_, position) => field.onChange(position?.id ?? '')}
                disabled={!selectedCompanyId}
                slotProps={LISTBOX_SLOT_PROPS}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {option.name}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cargo del paciente"
                    error={!!errors.positionId}
                    helperText={errors.positionId?.message}
                  />
                )}
              />
            </Box>
          )}
        />
      </Stack>

      <Divider />
      <Typography variant="subtitle2" color="text.secondary">
        Contacto de Emergencia (opcional)
      </Typography>

      <Stack direction="row" spacing={2}>
        <Controller
          name="emergencyContact.name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nombre del contacto (opcional)"
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
            label="Parentesco (opcional)"
            placeholder="Ej: Madre, Cónyuge, Hermano"
            error={!!errors.emergencyContact?.relationship}
            helperText={errors.emergencyContact?.relationship?.message}
          />
        )}
      />
    </Stack>
  );
}
