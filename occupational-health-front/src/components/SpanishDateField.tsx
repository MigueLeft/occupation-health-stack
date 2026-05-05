import { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

function isoToDisplay(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function displayToISO(display: string): string {
  if (!display || !/^\d{2}\/\d{2}\/\d{4}$/.test(display)) return '';
  const [d, m, y] = display.split('/');
  return `${y}-${m}-${d}`;
}

type Props = Omit<TextFieldProps, 'value' | 'onChange' | 'type'> & {
  value: string;
  onChange: (isoValue: string) => void;
};

export function SpanishDateField({ value, onChange, ...props }: Props) {
  const [display, setDisplay] = useState(() => isoToDisplay(value) || value);

  useEffect(() => {
    setDisplay(isoToDisplay(value) || value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplay(raw);
    const iso = displayToISO(raw);
    if (iso) onChange(iso);
    else if (!raw) onChange('');
  };

  return (
    <TextField
      {...props}
      value={display}
      onChange={handleChange}
      placeholder="DD/MM/AAAA"
      slotProps={{ inputLabel: { shrink: true }, htmlInput: { maxLength: 10 } }}
    />
  );
}
