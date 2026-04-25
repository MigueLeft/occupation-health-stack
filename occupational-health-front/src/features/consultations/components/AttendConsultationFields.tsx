import { Stack, TextField, MenuItem, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { CONSULTATION_RESULTS, PSYCHOLOGICAL_RESULTS } from '../types';

export function MedicaFields() {
  const { control, formState: { errors } } = useFormContext();
  return (
    <Stack spacing={2.5}>
      <Controller name="consultationResult" control={control}
        render={({ field }) => (
          <TextField {...field} select label="Resultado de Evaluación" fullWidth
            error={!!errors.consultationResult} helperText={errors.consultationResult?.message as string}
          >
            <MenuItem value=""><em>Sin resultado</em></MenuItem>
            {CONSULTATION_RESULTS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
        )} />

      <Controller name="currentTreatment" control={control}
        render={({ field }) => (
          <TextField {...field} label="Tratamiento Actual" fullWidth multiline rows={2} />
        )} />

      <Controller name="diagnosisDescription" control={control}
        render={({ field }) => (
          <TextField {...field} label="Diagnóstico" fullWidth multiline rows={3} />
        )} />

      <Typography variant="subtitle2" color="text.secondary">Recomendaciones</Typography>

      <Controller name="recommendations.suggestedPPE" control={control}
        render={({ field }) => <TextField {...field} label="EPP Sugerido" fullWidth />} />

      <Controller name="recommendations.medicalAdequacyMeasures" control={control}
        render={({ field }) => <TextField {...field} label="Medidas de Adecuación Médica" fullWidth multiline rows={2} />} />

      <Controller name="recommendations.psychologicalAdequacyMeasures" control={control}
        render={({ field }) => <TextField {...field} label="Medidas de Adecuación Psicológica" fullWidth multiline rows={2} />} />
    </Stack>
  );
}

export function PsicologicaFields() {
  const { control, formState: { errors } } = useFormContext();
  return (
    <Stack spacing={2.5}>
      <Controller name="psychologicalResult" control={control}
        render={({ field }) => (
          <TextField {...field} select label="Resultado Psicológico" fullWidth
            error={!!errors.psychologicalResult} helperText={errors.psychologicalResult?.message as string}
          >
            <MenuItem value=""><em>Sin resultado</em></MenuItem>
            {PSYCHOLOGICAL_RESULTS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
        )} />

      <Controller name="interviewConducted" control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
            label="Entrevista realizada"
          />
        )} />

      <Controller name="currentTreatment" control={control}
        render={({ field }) => (
          <TextField {...field} label="Tratamiento Actual" fullWidth multiline rows={2} />
        )} />

      <Controller name="diagnosisDescription" control={control}
        render={({ field }) => (
          <TextField {...field} label="Diagnóstico" fullWidth multiline rows={3} />
        )} />
    </Stack>
  );
}
