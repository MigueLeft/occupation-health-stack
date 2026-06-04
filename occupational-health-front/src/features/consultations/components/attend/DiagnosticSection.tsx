import { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Chip, Stack,
  Autocomplete, FormControlLabel, Checkbox,
} from '@mui/material';
import { AddOutlined, CheckCircleOutlined, HotelOutlined } from '@mui/icons-material';
import { CONSULTATION_RESULTS } from '../../types';
import type { ConsultationResult } from '../../types';
import type { ConsultationDiagnostic } from '../../services/sub-entities.service';

interface DiagRow {
  categoryId: string;
  diseaseId?: string;
  accidentTypeId?: string;
  bodySystemId?: string;
}
interface Cat { id: string; name: string; }
interface Disease { id: string; name: string; }
interface BodySystem { id: string; name: string; }
interface AccidentType { id: string; name: string; }

export interface RestEntry { diagId: string; days: number; }

interface Props {
  diagnostics: ConsultationDiagnostic[];
  onAddDiagnostic: (row: DiagRow, isRest: boolean, restDays: number | '') => void;
  onRemoveDiagnostic: (id: string) => void;
  categories: Cat[];
  diseases: Disease[];
  bodySystems: BodySystem[];
  accidentTypes: AccidentType[];
  result: ConsultationResult | '' | undefined;
  onResultChange: (r: ConsultationResult | '') => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  isHealthy: boolean;
  onIsHealthyChange: (v: boolean) => void;
  restEntries: RestEntry[];
}

const ACCIDENT_KEYWORD = 'accidente';

function isAccidentCategory(cat: Cat | null): boolean {
  return cat?.name.toLowerCase().includes(ACCIDENT_KEYWORD) ?? false;
}

export function DiagnosticSection({
  diagnostics, onAddDiagnostic, onRemoveDiagnostic,
  categories, diseases, bodySystems, accidentTypes,
  result, onResultChange,
  description, onDescriptionChange,
  isHealthy, onIsHealthyChange,
  restEntries,
}: Props) {
  const [cat, setCat] = useState<Cat | null>(null);
  const [disease, setDisease] = useState<Disease | null>(null);
  const [accidentType, setAccidentType] = useState<AccidentType | null>(null);
  const [sys, setSys] = useState<BodySystem | null>(null);
  const [isRest, setIsRest] = useState(false);
  const [localRestDays, setLocalRestDays] = useState<number | ''>('');

  const isAccident = isAccidentCategory(cat);

  const handleCategoryChange = (newCat: Cat | null) => {
    setCat(newCat);
    setDisease(null);
    setAccidentType(null);
  };

  const canAdd = cat !== null && (isAccident ? accidentType !== null : disease !== null);

  const handleAdd = () => {
    if (!canAdd) return;
    onAddDiagnostic(
      {
        categoryId: cat!.id,
        diseaseId: isAccident ? undefined : disease?.id,
        accidentTypeId: isAccident ? accidentType?.id : undefined,
        bodySystemId: sys?.id,
      },
      isRest,
      localRestDays,
    );
    setCat(null);
    setDisease(null);
    setAccidentType(null);
    setSys(null);
    setIsRest(false);
    setLocalRestDays('');
  };

  const getName = (list: Cat[], id: string) => list.find((x) => x.id === id)?.name ?? id;

  const getDiagLabel = (d: ConsultationDiagnostic) => {
    const catName = getName(categories, d.categoryId);
    const entityName = d.accidentTypeId
      ? getName(accidentTypes, d.accidentTypeId)
      : getName(diseases, d.diseaseId ?? '');
    return `${catName} · ${entityName}`;
  };

  const getRestEntry = (d: ConsultationDiagnostic) =>
    restEntries.find((e) => e.diagId === d.id);

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h3" sx={{ fontSize: '1rem' }}>Diagnóstico</Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={isHealthy}
              onChange={(e) => onIsHealthyChange(e.target.checked)}
              color="success"
              icon={<CheckCircleOutlined />}
              checkedIcon={<CheckCircleOutlined />}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: isHealthy ? 700 : 400, color: isHealthy ? 'success.main' : 'text.secondary' }}>
              Paciente Sano
            </Typography>
          }
          sx={{ mr: 0 }}
        />
      </Box>

      {isHealthy ? (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <CheckCircleOutlined sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
          <Typography variant="body1" color="success.main" sx={{ fontWeight: 600 }}>
            Paciente sin diagnósticos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            El paciente fue evaluado y no presenta patologías.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          <Autocomplete
            size="small"
            options={categories}
            getOptionLabel={(c) => c.name}
            value={cat}
            onChange={(_, v) => handleCategoryChange(v)}
            renderInput={(params) => <TextField {...params} label="Categoría" placeholder="Buscar categoría..." />}
            fullWidth
            noOptionsText="Sin resultados"
            slotProps={{ listbox: { style: { maxHeight: 7 * 36 } } }}
          />

          {isAccident ? (
            <Autocomplete
              size="small"
              options={accidentTypes}
              getOptionLabel={(a) => a.name}
              value={accidentType}
              onChange={(_, v) => setAccidentType(v)}
              renderInput={(params) => (
                <TextField {...params} label="Tipo de Accidente" placeholder="Buscar tipo de accidente..." />
              )}
              fullWidth
              noOptionsText="Sin resultados"
              slotProps={{ listbox: { style: { maxHeight: 7 * 36 } } }}
            />
          ) : (
            <Autocomplete
              size="small"
              options={diseases}
              getOptionLabel={(d) => d.name}
              value={disease}
              onChange={(_, v) => setDisease(v)}
              renderInput={(params) => <TextField {...params} label="Enfermedad" placeholder="Buscar enfermedad..." />}
              fullWidth
              noOptionsText="Sin resultados"
              slotProps={{ listbox: { style: { maxHeight: 7 * 36 } } }}
            />
          )}

          <Autocomplete
            size="small"
            options={bodySystems}
            getOptionLabel={(b) => b.name}
            value={sys}
            onChange={(_, v) => setSys(v)}
            renderInput={(params) => <TextField {...params} label="Aparato/Sistema (opcional)" placeholder="Buscar aparato o sistema..." />}
            fullWidth
            noOptionsText="Sin resultados"
            slotProps={{ listbox: { style: { maxHeight: 7 * 36 } } }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isRest}
                  onChange={(e) => {
                    setIsRest(e.target.checked);
                    if (!e.target.checked) setLocalRestDays('');
                  }}
                  icon={<HotelOutlined />}
                  checkedIcon={<HotelOutlined />}
                  color="primary"
                />
              }
              label={<Typography variant="body2">Reposo médico</Typography>}
              sx={{ m: 0 }}
            />
            {isRest && (
              <TextField
                label="Días de reposo"
                type="number"
                size="small"
                value={localRestDays}
                onChange={(e) => {
                  if (e.target.value === '') { setLocalRestDays(''); return; }
                  const val = parseInt(e.target.value, 10);
                  setLocalRestDays(isNaN(val) || val < 1 ? '' : val);
                }}
                slotProps={{ htmlInput: { min: 1, max: 365 } }}
                placeholder="Ej: 7"
                sx={{ width: 160 }}
              />
            )}
          </Box>

          <Button
            variant="outlined"
            startIcon={<AddOutlined />}
            onClick={handleAdd}
            disabled={!canAdd}
            fullWidth
          >
            Agregar
          </Button>

          {diagnostics.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {diagnostics.map((d) => {
                const entry = getRestEntry(d);
                const label = `${getDiagLabel(d)}${entry ? ` · Reposo: ${entry.days} día(s)` : ''}`;
                return (
                  <Chip
                    key={d.id}
                    size="small"
                    onDelete={() => onRemoveDiagnostic(d.id)}
                    icon={entry ? <HotelOutlined fontSize="inherit" /> : undefined}
                    label={label}
                    color={entry ? 'primary' : 'default'}
                    variant={entry ? 'outlined' : 'filled'}
                  />
                );
              })}
            </Box>
          )}
        </Stack>
      )}

      <Box sx={{ mt: isHealthy ? 2 : 0 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Resultado</Typography>
        <Stack direction="row" spacing={1}>
          {CONSULTATION_RESULTS.map((r) => {
            const isSelected = result === r;
            const color = isSelected
              ? (r === 'Apto' ? 'success' : r === 'No Apto' ? 'error' : 'warning')
              : 'inherit';
            return (
              <Button key={r} size="small" color={color}
                variant={isSelected ? 'contained' : 'outlined'}
                onClick={() => onResultChange(isSelected ? '' : r)}
              >{r}</Button>
            );
          })}
        </Stack>
      </Box>

      {!isHealthy && (
        <TextField label="Descripción del diagnóstico" size="small" fullWidth multiline rows={3} sx={{ mt: 1.5 }}
          placeholder="Describa el diagnóstico del paciente..."
          value={description} onChange={(e) => onDescriptionChange(e.target.value)}
        />
      )}
    </Paper>
  );
}
