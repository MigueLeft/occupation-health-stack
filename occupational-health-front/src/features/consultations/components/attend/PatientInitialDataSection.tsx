import { useState, useEffect } from 'react';
import { Box, TextField, MenuItem, Checkbox, FormControlLabel, Autocomplete, Button, Typography } from '@mui/material';
import { EditOutlined, SaveOutlined } from '@mui/icons-material';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const HAND_OPTIONS = [
  { value: 'right', label: 'Derecha' },
  { value: 'left', label: 'Izquierda' },
  { value: 'both', label: 'Ambas' },
];
const HAND_LABELS: Record<string, string> = { right: 'Derecha', left: 'Izquierda', both: 'Ambas' };

interface Allergy { id: string; name: string; }

interface Props {
  bloodType: string | null | undefined;
  dominantHand: string | null | undefined;
  usesGlasses: boolean | null | undefined;
  currentAllergies: Allergy[];
  allAllergies: Allergy[];
  onSave: (data: { bloodType?: string; dominantHand?: string; usesGlasses?: boolean; allergyIds?: string[] }) => Promise<void>;
}

export function PatientInitialDataSection({ bloodType, dominantHand, usesGlasses, currentAllergies, allAllergies, onSave }: Props) {
  const hasData = !!(bloodType && dominantHand);
  const [editing, setEditing] = useState(!hasData);
  const [bt, setBt] = useState(bloodType ?? '');
  const [hand, setHand] = useState(dominantHand ?? '');
  const [glasses, setGlasses] = useState(usesGlasses ?? false);
  const [allergies, setAllergies] = useState<Allergy[]>(currentAllergies);
  const [saving, setSaving] = useState(false);

  // Sync when parent data refreshes
  useEffect(() => {
    setBt(bloodType ?? '');
    setHand(dominantHand ?? '');
    setGlasses(usesGlasses ?? false);
    setAllergies(currentAllergies);
    if (bloodType && dominantHand) setEditing(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloodType, dominantHand, usesGlasses]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        bloodType: bt || undefined,
        dominantHand: hand || undefined,
        usesGlasses: glasses,
        allergyIds: allergies.map((a) => a.id),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const readonlyField = (label: string, value: string) => (
    <TextField
      size="small"
      label={label}
      value={value || '—'}
      slotProps={{ input: { readOnly: true } }}
      sx={{ flex: 1, '& .MuiInputBase-root': { bgcolor: 'action.hover', cursor: 'default' } }}
    />
  );

  return (
    <Box sx={{ mt: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem' }}>
          Datos Clínicos
        </Typography>
        {!editing && (
          <Button size="small" startIcon={<EditOutlined fontSize="small" />} onClick={() => setEditing(true)} sx={{ minWidth: 0, fontSize: '0.78rem' }}>
            Editar
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {editing ? (
            <>
              <TextField select size="small" label="Grupo Sanguíneo" value={bt} onChange={(e) => setBt(e.target.value)} sx={{ flex: 1 }}>
                <MenuItem value=""><em>Sin especificar</em></MenuItem>
                {BLOOD_TYPES.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Mano Dominante" value={hand} onChange={(e) => setHand(e.target.value)} sx={{ flex: 1 }}>
                <MenuItem value=""><em>Sin especificar</em></MenuItem>
                {HAND_OPTIONS.map((h) => <MenuItem key={h.value} value={h.value}>{h.label}</MenuItem>)}
              </TextField>
              <FormControlLabel
                control={<Checkbox checked={glasses} onChange={(e) => setGlasses(e.target.checked)} size="small" />}
                label="Usa lentes"
                sx={{ flex: 0, whiteSpace: 'nowrap', ml: 0.5 }}
              />
            </>
          ) : (
            <>
              {readonlyField('Grupo Sanguíneo', bt)}
              {readonlyField('Mano Dominante', HAND_LABELS[hand] ?? hand)}
              {readonlyField('Usa lentes', glasses ? 'Sí' : 'No')}
            </>
          )}
        </Box>

        {editing ? (
          <Autocomplete
            multiple
            size="small"
            options={allAllergies}
            value={allergies}
            getOptionLabel={(o) => o.name}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onChange={(_, v) => setAllergies(v)}
            renderInput={(params) => <TextField {...params} label="Alergias" placeholder="Buscar alergia..." />}
          />
        ) : (
          readonlyField('Alergias', allergies.map((a) => a.name).join(', ') || 'Sin alergias')
        )}

        {editing && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {hasData && (
              <Button size="small" variant="outlined" onClick={() => { setBt(bloodType ?? ''); setHand(dominantHand ?? ''); setGlasses(usesGlasses ?? false); setAllergies(currentAllergies); setEditing(false); }}>
                Cancelar
              </Button>
            )}
            <Button size="small" variant="contained" startIcon={<SaveOutlined />} onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
