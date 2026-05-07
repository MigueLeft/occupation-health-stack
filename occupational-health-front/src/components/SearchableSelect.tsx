import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

export interface SelectOption {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  sx?: SxProps<Theme>;
  noOptionsText?: string;
  getOptionLabel?: (option: SelectOption) => string;
  renderOptionContent?: (option: SelectOption) => React.ReactNode;
}

const MAX_VISIBLE = 7;
const ITEM_HEIGHT = 36;

export const SearchableSelect = React.forwardRef<HTMLInputElement, SearchableSelectProps>(
  function SearchableSelect(
    {
      options, value, onChange, onBlur, label, placeholder,
      disabled = false, size = 'small', fullWidth = true,
      error, helperText, sx,
      noOptionsText = 'Sin resultados',
      getOptionLabel,
      renderOptionContent,
    },
    ref,
  ) {
    const resolveLabel = getOptionLabel ?? ((o: SelectOption) => o.name);
    const selectedOption = options.find((o) => o.id === value) ?? null;

    return (
      <Autocomplete
        options={options}
        value={selectedOption}
        onChange={(_, option) => onChange(option?.id ?? '')}
        getOptionLabel={resolveLabel}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        noOptionsText={noOptionsText}
        slotProps={{ listbox: { style: { maxHeight: MAX_VISIBLE * ITEM_HEIGHT } } }}
        sx={sx}
        renderOption={
          renderOptionContent
            ? (props, option) => {
                const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };
                return (
                  <li key={key} {...rest}>
                    {renderOptionContent(option)}
                  </li>
                );
              }
            : undefined
        }
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={ref}
            label={label}
            placeholder={placeholder ?? `Buscar ${label.toLowerCase()}...`}
            error={error}
            helperText={helperText}
            onBlur={onBlur}
          />
        )}
      />
    );
  },
);
