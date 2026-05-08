import { Typography, TextField, Grid, Paper } from '@mui/material';
import type { PhysicalExamPayload } from '../../services/sub-entities.service';

interface Props {
  value: PhysicalExamPayload;
  onChange: (v: PhysicalExamPayload) => void;
}

function calcBmi(weight?: number | null, height?: number | null): string {
  if (!weight || !height || height <= 0) return '';
  const hm = height / 100;
  return (weight / (hm * hm)).toFixed(1);
}

function NumField({ label, field, value, onChange, placeholder }: {
  label: string; field: keyof PhysicalExamPayload; placeholder?: string;
  value: PhysicalExamPayload; onChange: (v: PhysicalExamPayload) => void;
}) {
  return (
    <TextField label={label} size="small" type="number" fullWidth placeholder={placeholder}
      value={value[field] ?? ''}
      slotProps={{ htmlInput: { min: 0, max: 1000 } }}
      onChange={(e) => {
        if (e.target.value === '') {
          onChange({ ...value, [field]: undefined });
          return;
        }
        const num = Number(e.target.value);
        if (num < 0 || num > 1000) return;
        onChange({ ...value, [field]: num });
      }}
    />
  );
}

export function PhysicalExamSection({ value, onChange }: Props) {
  const bmi = calcBmi(value.weight, value.height);

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h3" sx={{ mb: 2.5, fontSize: '1rem' }}>Examen Físico</Typography>
      <Grid container spacing={2}>
        <Grid size={6}><NumField label="Peso (kg)" field="weight" placeholder="ej. 70" value={value} onChange={onChange} /></Grid>
        <Grid size={6}><NumField label="Talla (cm)" field="height" placeholder="ej. 165" value={value} onChange={onChange} /></Grid>
        <Grid size={6}>
          <TextField label="IMC (calculado)" size="small" fullWidth value={bmi || '—'}
            slotProps={{ input: { readOnly: true } }}
            sx={{ '& .MuiInputBase-root': { bgcolor: 'action.hover', cursor: 'default' }, '& .MuiInputBase-input': { color: bmi ? 'text.primary' : 'text.disabled', fontStyle: bmi ? 'normal' : 'italic', cursor: 'default' } }}
          />
        </Grid>
        <Grid size={6}><NumField label="P.A. Sistólica (mmHg)" field="systolicPressure" placeholder="ej. 120" value={value} onChange={onChange} /></Grid>
        <Grid size={6}><NumField label="P.A. Diastólica (mmHg)" field="diastolicPressure" placeholder="ej. 80" value={value} onChange={onChange} /></Grid>
        <Grid size={6}><NumField label="Frec. Cardíaca (lpm)" field="heartRate" placeholder="ej. 72" value={value} onChange={onChange} /></Grid>
        <Grid size={6}><NumField label="Frec. Respiratoria (rpm)" field="respiratoryRate" placeholder="ej. 16" value={value} onChange={onChange} /></Grid>
        <Grid size={6}><NumField label="Sat. O₂ (%)" field="oxygenSaturation" placeholder="ej. 98" value={value} onChange={onChange} /></Grid>
        <Grid size={12}>
          <TextField label="Notas del Examen" size="small" fullWidth multiline rows={2}
            placeholder="Observaciones adicionales del examen físico..."
            value={value.notes ?? ''}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
