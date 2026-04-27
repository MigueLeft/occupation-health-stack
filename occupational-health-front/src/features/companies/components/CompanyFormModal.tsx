import { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Stack, TextField,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCompany, useUpdateCompany } from '../hooks/useCompanies';
import { autoFormatRif } from '@/utils/rif';
import { autoFormatPhone } from '@/utils/phone';
import type { CompanyWithPositions } from '../types';

const schema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255),
  rif: z.string().min(10, 'El RIF debe tener al menos 10 caracteres'),
  address: z.string().min(1, 'La dirección es obligatoria').max(500),
  contact: z.string().regex(/^\d{4}-?\d{7}$/, 'El teléfono debe tener 11 dígitos (ej: 04145652189)'),
});

type FormData = z.infer<typeof schema>;

interface CompanyFormModalProps {
  open: boolean;
  onClose: () => void;
  company?: CompanyWithPositions | null;
}

export function CompanyFormModal({ open, onClose, company }: CompanyFormModalProps) {
  const isEdit = !!company;
  const { mutate: createCompany, isPending: isCreating } = useCreateCompany();
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();
  const isPending = isCreating || isUpdating;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset(
        company
          ? { name: company.name, rif: company.rif, address: company.address, contact: company.contact }
          : { name: '', rif: '', address: '', contact: '' },
      );
    }
  }, [open, company, reset]);

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateCompany({ id: company.id, payload: data }, { onSuccess: handleClose });
    } else {
      createCompany(data, { onSuccess: handleClose });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          bgcolor: 'primary.main', color: 'primary.contrastText', pb: 1.5,
        }}
      >
        {isEdit ? 'Editar Empresa' : 'Crear Nueva Empresa'}
        <IconButton size="small" onClick={handleClose} sx={{ color: 'inherit' }}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Nombre de la Empresa" placeholder="Nombre de la empresa"
                    error={!!errors.name} helperText={errors.name?.message} fullWidth />
                )}
              />
              <Controller
                name="rif"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="RIF"
                    placeholder="Ej: 3009871230"
                    error={!!errors.rif}
                    // helperText={errors.rif?.message ?? 'Ingresa los números y sal del campo'}
                    fullWidth
                    onBlur={(e) => {
                      const formatted = autoFormatRif(e.target.value);
                      field.onChange(formatted);
                      field.onBlur();
                    }}
                  />
                )}
              />
            </Stack>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Dirección" placeholder="Dirección de la empresa"
                  error={!!errors.address} helperText={errors.address?.message} />
              )}
            />
            <Controller
              name="contact"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contacto"
                  placeholder="04145652189"
                  error={!!errors.contact}
                  helperText={errors.contact?.message}
                  onBlur={(e) => {
                    const formatted = autoFormatPhone(e.target.value);
                    field.onChange(formatted);
                    field.onBlur();
                  }}
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isPending}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Guardar Empresa'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
