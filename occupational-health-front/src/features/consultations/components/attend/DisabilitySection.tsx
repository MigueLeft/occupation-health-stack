import { useState } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { AccessibilityNewOutlined } from '@mui/icons-material';
import { SearchableSelect } from '@/components/SearchableSelect';
import type { Disability } from '@/features/catalogs/types';

interface LocalDisability { id: string; disabilityId: string; }

interface Props {
  localDisabilities: LocalDisability[];
  allDisabilities: Disability[];
  onAdd: (disabilityId: string) => void;
  onRemove: (recordId: string) => void;
}

export function DisabilitySection({ localDisabilities, allDisabilities, onAdd, onRemove }: Props) {
  const [selectorKey, setSelectorKey] = useState(0);

  const available = allDisabilities.filter(
    (d) => !localDisabilities.some((ld) => ld.disabilityId === d.id),
  );

  const handleAdd = (id: string) => {
    if (!id) return;
    onAdd(id);
    setSelectorKey((k) => k + 1);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AccessibilityNewOutlined sx={{ color: 'primary.main' }} />
        <Typography variant="h3" sx={{ fontSize: '1rem' }}>Discapacidad</Typography>
      </Box>

      <SearchableSelect
        key={selectorKey}
        options={available}
        value=""
        onChange={handleAdd}
        label="Agregar discapacidad"
        disabled={available.length === 0}
        noOptionsText="Sin discapacidades disponibles"
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
        {localDisabilities.length === 0
          ? <Typography variant="caption" color="text.disabled">Sin discapacidades registradas</Typography>
          : localDisabilities.map((ld) => {
              const name = allDisabilities.find((d) => d.id === ld.disabilityId)?.name ?? ld.disabilityId;
              return <Chip key={ld.id} label={name} size="small" onDelete={() => onRemove(ld.id)} />;
            })
        }
      </Box>
    </Paper>
  );
}
