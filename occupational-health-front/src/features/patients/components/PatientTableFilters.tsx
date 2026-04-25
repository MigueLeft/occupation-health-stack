import { Box, TextField, InputAdornment, Select, MenuItem, FormControl } from '@mui/material';
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

export function PatientTableFilters({
  search,
  onSearch,
  companyFilter,
  onCompanyFilter,
  positionFilter,
  onPositionFilter,
  companies,
  positions,
}: PatientTableFiltersProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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

      <FormControl sx={{ minWidth: 180 }}>
        <Select
          value={companyFilter}
          onChange={(e) => {
            onCompanyFilter(e.target.value);
            onPositionFilter('');
          }}
          displayEmpty
          renderValue={(v) =>
            v ? companies.find((c) => c.id === v)?.name ?? 'Empresa' : 'Empresa'
          }
        >
          <MenuItem value="">Todas las empresas</MenuItem>
          {companies.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 180 }}>
        <Select
          value={positionFilter}
          onChange={(e) => onPositionFilter(e.target.value)}
          displayEmpty
          renderValue={(v) =>
            v ? positions.find((p) => p.id === v)?.name ?? 'Cargo' : 'Cargo'
          }
        >
          <MenuItem value="">Todos los cargos</MenuItem>
          {positions.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
