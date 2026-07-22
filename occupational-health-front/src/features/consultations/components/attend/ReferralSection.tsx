import { useState } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { LocalHospitalOutlined } from '@mui/icons-material';
import { SearchableSelect } from '@/components/SearchableSelect';
import type { MedicalSpecialty } from '@/features/catalogs/types';

interface LocalReferral { id: string; specialtyId: string | null; }

interface Props {
  localReferrals: LocalReferral[];
  specialties: MedicalSpecialty[];
  onAdd: (specialtyId: string) => void;
  onRemove: (recordId: string) => void;
}

export function ReferralSection({ localReferrals, specialties, onAdd, onRemove }: Props) {
  const [selectorKey, setSelectorKey] = useState(0);

  const available = specialties.filter(
    (s) => !localReferrals.some((lr) => lr.specialtyId === s.id),
  );

  const handleAdd = (id: string) => {
    if (!id) return;
    onAdd(id);
    setSelectorKey((k) => k + 1);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LocalHospitalOutlined sx={{ color: 'primary.main' }} />
        <Typography variant="h3" sx={{ fontSize: '1rem' }}>Referir a Especialista</Typography>
      </Box>

      <SearchableSelect
        key={selectorKey}
        options={available}
        value=""
        onChange={handleAdd}
        label="Agregar especialidad"
        disabled={available.length === 0}
        noOptionsText="Sin especialidades disponibles"
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
        {localReferrals.length === 0
          ? <Typography variant="caption" color="text.disabled">Sin referencias registradas</Typography>
          : localReferrals.map((lr) => {
              const name = specialties.find((s) => s.id === lr.specialtyId)?.name ?? lr.specialtyId ?? 'Especialidad no especificada';
              return <Chip key={lr.id} label={name} size="small" onDelete={() => onRemove(lr.id)} />;
            })
        }
      </Box>
    </Paper>
  );
}
