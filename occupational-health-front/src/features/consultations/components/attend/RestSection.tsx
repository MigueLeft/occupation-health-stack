import { Box, Typography, Paper, TextField, Checkbox, FormControlLabel, Switch, Stack } from '@mui/material';
import { HotelOutlined } from '@mui/icons-material';
import type { ConsultationDiagnostic } from '../../services/sub-entities.service';

interface Cat { id: string; name: string; }
interface Disease { id: string; name: string; }
interface AccidentType { id: string; name: string; }

interface Props {
  diagnostics: ConsultationDiagnostic[];
  categories: Cat[];
  diseases: Disease[];
  accidentTypes: AccidentType[];
  restEnabled: boolean;
  onRestEnabledChange: (v: boolean) => void;
  restDays: number | '';
  onRestDaysChange: (v: number | '') => void;
  restDiagIds: Set<string>;
  onRestDiagIdsChange: (ids: Set<string>) => void;
}

export function RestSection({
  diagnostics, categories, diseases, accidentTypes,
  restEnabled, onRestEnabledChange,
  restDays, onRestDaysChange,
  restDiagIds, onRestDiagIdsChange,
}: Props) {
  const getName = (list: Cat[], id: string) => list.find((x) => x.id === id)?.name ?? id;

  const getDiagLabel = (d: ConsultationDiagnostic) => {
    const catName = getName(categories, d.categoryId);
    const entityName = d.accidentTypeId
      ? getName(accidentTypes, d.accidentTypeId)
      : getName(diseases, d.diseaseId ?? '');
    return `${catName} · ${entityName}`;
  };

  const toggleDiag = (id: string, checked: boolean) => {
    const next = new Set(restDiagIds);
    if (checked) next.add(id);
    else next.delete(id);
    onRestDiagIdsChange(next);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, bgcolor: restEnabled ? 'primary.50' : undefined, borderColor: restEnabled ? 'primary.200' : undefined }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <HotelOutlined sx={{ color: restEnabled ? 'primary.main' : 'text.disabled', fontSize: '1.1rem' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: restEnabled ? 'primary.main' : 'text.secondary' }}>
            Reposo Médico
          </Typography>
        </Box>
        <Switch
          checked={restEnabled}
          onChange={(e) => {
            onRestEnabledChange(e.target.checked);
            if (!e.target.checked) {
              onRestDiagIdsChange(new Set());
              onRestDaysChange('');
            }
          }}
          size="small"
          color="primary"
        />
      </Box>

      {restEnabled && (
        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          <TextField
            label="Días de reposo"
            type="number"
            size="small"
            value={restDays}
            onChange={(e) => {
              if (e.target.value === '') { onRestDaysChange(''); return; }
              const val = parseInt(e.target.value, 10);
              onRestDaysChange(isNaN(val) || val < 1 ? '' : val);
            }}
            slotProps={{ htmlInput: { min: 1, max: 365 } }}
            placeholder="Ej: 7"
            sx={{ width: 180 }}
          />

          {diagnostics.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                Diagnósticos con reposo
              </Typography>
              <Stack sx={{ mt: 0.5 }}>
                {diagnostics.map((d) => (
                  <FormControlLabel
                    key={d.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={restDiagIds.has(d.id)}
                        onChange={(e) => toggleDiag(d.id, e.target.checked)}
                        color="primary"
                      />
                    }
                    label={<Typography variant="body2">{getDiagLabel(d)}</Typography>}
                    sx={{ ml: 0 }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      )}
    </Paper>
  );
}
