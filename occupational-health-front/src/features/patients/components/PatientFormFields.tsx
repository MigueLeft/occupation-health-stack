import {
  Stack,
  TextField,
  Typography,
  Divider,
  Autocomplete,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { autoFormatPhone } from '@/utils/phone';
import type { PatientFormData } from './CreatePatientModal';
import type { Company, Position } from '../types';

const SEX_OPTIONS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
];

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
      <Controller
        name="cedula"
        control={control}
        render={({ field }) => {
          const match = (field.value ?? '').match(/^([VEve])-?(\d*)$/);
          const prefix = match ? match[1].toUpperCase() : 'V';
          const digits = match ? match[2] : (field.value ?? '').replace(/\D/g, '');
          return (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="medium" error={!!errors.cedula} sx={{ width: 110, flexShrink: 0 }}>
                <InputLabel>Tipo</InputLabel>
                <Select
                  label="Tipo"
                  value={prefix}
                  onChange={(e) => field.onChange(`${e.target.value}-${digits}`)}
                >
                  <MenuItem value="V">V</MenuItem>
                  <MenuItem value="E">E</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Número de Cédula"
                placeholder="Ej: 27736710"
                value={digits}
                error={!!errors.cedula}
                helperText={errors.cedula?.message}
                fullWidth
                slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                  field.onChange(`${prefix}-${onlyDigits}`);
                }}
                onBlur={() => field.onBlur()}
              />
            </Box>
          );
        }}
      />
      <Stack direction="row" spacing={2}>
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
              onChange={(e) => {
                const lettersOnly = e.target.value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]/g, '');
                field.onChange(lettersOnly);
              }}
            />
          )}
        />
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
              onChange={(e) => {
                const lettersOnly = e.target.value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]/g, '');
                field.onChange(lettersOnly);
              }}
            />
          )}
        />
      </Stack>

      <Stack direction="row" spacing={2}>
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
        <Controller
          name="sex"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Sexo</InputLabel>
              <Select {...field} label="Sexo" value={field.value ?? ''}>
                <MenuItem value=""><em>Sin especificar</em></MenuItem>
                {SEX_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
          )}
        />
      </Stack>

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
