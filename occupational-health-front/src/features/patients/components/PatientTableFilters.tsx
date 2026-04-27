import { Box, TextField, InputAdornment, Autocomplete } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import type { Company, Position } from '../types';

interface PatientTableFiltersProps {
  search: string;
  onSearch: (v: string) => void;
  companyFilter: string;
  onCompanyFilter: (v: string) => void;
  positionFilter: string;
  onPositionFilter: (v: string) => void;
  companies: Company[];
  positions: Position[];
}

const LISTBOX_SLOT_PROPS = { listbox: { style: { maxHeight: 220 } } } as const;

export function PatientTableFilters({
  search, onSearch, companyFilter, onCompanyFilter,
  positionFilter, onPositionFilter, companies, positions,
}: PatientTableFiltersProps) {
  const selectedCompany = companies.find((c) => c.id === companyFilter) ?? null;
  const selectedPosition = positions.find((p) => p.id === positionFilter) ?? null;

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <TextField
        placeholder="Buscar paciente..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        sx={{ width: 280 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ color: 'text.disabled', fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <Autocomplete
        options={companies}
        getOptionLabel={(c) => c.name}
        value={selectedCompany}
        onChange={(_, company) => {
          onCompanyFilter(company?.id ?? '');
          onPositionFilter('');
        }}
        sx={{ width: 220 }}
        slotProps={LISTBOX_SLOT_PROPS}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            sx={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              display: 'block !important',
            }}
          >
            {option.name}
          </Box>
        )}
        renderInput={(params) => (
          <TextField {...params} label="Empresa" placeholder="Todas las empresas" />
        )}
      />

      {companyFilter && (
        <Autocomplete
          options={positions}
          getOptionLabel={(p) => p.name}
          value={selectedPosition}
          onChange={(_, position) => onPositionFilter(position?.id ?? '')}
          sx={{ width: 220 }}
          slotProps={LISTBOX_SLOT_PROPS}
          renderOption={(props, option) => (
            <Box
              component="li"
              {...props}
              sx={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                display: 'block !important',
              }}
            >
              {option.name}
            </Box>
          )}
          renderInput={(params) => (
            <TextField {...params} label="Cargo" placeholder="Todos los cargos" />
          )}
        />
      )}
    </Box>
  );
}
