import { useEffect, useRef, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Stack, TextField, Box, Typography, Avatar,
} from '@mui/material';
import { SearchableSelect } from '@/components/SearchableSelect';
import { CloseOutlined, CameraAltOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCompany, useUpdateCompany } from '../hooks/useCompanies';
import { useGeoCatalog } from '@/features/catalogs/hooks/useGeoCatalog';
import { autoFormatRif } from '@/utils/rif';
import { autoFormatPhone } from '@/utils/phone';
import type { CompanyWithPositions } from '../types';

const MAX_LOGO_SIZE = 200 * 1024; // 200 KB
const LOGO_MAX_DIMENSION = 256;

const schema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255),
  rif: z.string().min(10, 'El RIF debe tener al menos 10 caracteres'),
  address: z.string().min(1, 'La dirección es obligatoria').max(500),
  contact: z.string().regex(/^\d{4}-?\d{7}$/, 'El teléfono debe tener 11 dígitos (ej: 04145652189)'),
  email: z.string().email('El correo no tiene formato válido').optional().or(z.literal('')),
  stateId: z.string().optional(),
  cityId: z.string().optional(),
  municipalityId: z.string().optional(),
  parishId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CompanyFormModalProps {
  open: boolean;
  onClose: () => void;
  company?: CompanyWithPositions | null;
}

async function resizeImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > LOGO_MAX_DIMENSION || height > LOGO_MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * LOGO_MAX_DIMENSION) / width);
          width = LOGO_MAX_DIMENSION;
        } else {
          width = Math.round((width * LOGO_MAX_DIMENSION) / height);
          height = LOGO_MAX_DIMENSION;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function CompanyFormModal({ open, onClose, company }: CompanyFormModalProps) {
  const isEdit = !!company;
  const { mutate: createCompany, isPending: isCreating } = useCreateCompany();
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();
  const isPending = isCreating || isUpdating;

  const { data: states = [] } = useGeoCatalog('Estado');
  const { data: cities = [] } = useGeoCatalog('Ciudad');
  const { data: municipalities = [] } = useGeoCatalog('Municipio');
  const { data: parishes = [] } = useGeoCatalog('Parroquia');

  const [logo, setLogo] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      setLogo(company?.logo ?? null);
      reset(
        company
          ? {
              name: company.name, rif: company.rif, address: company.address,
              contact: company.contact, email: company.email ?? '',
              stateId: company.stateId ?? '', cityId: company.cityId ?? '',
              municipalityId: company.municipalityId ?? '', parishId: company.parishId ?? '',
            }
          : { name: '', rif: '', address: '', contact: '', email: '', stateId: '', cityId: '', municipalityId: '', parishId: '' },
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => { reset(); setLogo(null); onClose(); };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_SIZE) {
      alert('El logo no puede superar 200 KB.');
      return;
    }
    try {
      const b64 = await resizeImageToBase64(file);
      setLogo(b64);
    } catch {
      alert('Error al procesar la imagen.');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const onSubmit = (data: FormData) => {
    const commonFields = {
      ...data,
      email: data.email || undefined,
      stateId: data.stateId || undefined,
      cityId: data.cityId || undefined,
      municipalityId: data.municipalityId || undefined,
      parishId: data.parishId || undefined,
    };
    if (isEdit) {
      updateCompany({ id: company.id, payload: { ...commonFields, logo } }, { onSuccess: handleClose });
    } else {
      createCompany({ ...commonFields, logo: logo ?? undefined }, { onSuccess: handleClose });
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
            {/* Logo upload */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={logo ?? undefined}
                variant="rounded"
                sx={{ width: 72, height: 72, bgcolor: 'action.selected', fontSize: '2rem' }}
              >
                {!logo && <CameraAltOutlined sx={{ color: 'text.disabled' }} />}
              </Avatar>
              <Box>
                <Typography variant="subtitle2">Logo de la Empresa (opcional)</Typography>
                <Typography variant="caption" color="text.secondary">Máx. 200 KB · Se redimensiona automáticamente a 256×256</Typography>
                <Box>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                  <Button size="small" variant="outlined" sx={{ mt: 0.5, mr: 1 }} onClick={() => fileRef.current?.click()}>
                    {logo ? 'Cambiar' : 'Subir logo'}
                  </Button>
                  {logo && (
                    <Button size="small" color="error" onClick={() => setLogo(null)}>Quitar</Button>
                  )}
                </Box>
              </Box>
            </Box>

            <Stack direction="row" spacing={2}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Nombre de la Empresa" error={!!errors.name} helperText={errors.name?.message} fullWidth />
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
                    fullWidth
                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                    onBlur={(e) => { field.onChange(autoFormatRif(e.target.value)); field.onBlur(); }}
                  />
                )}
              />
            </Stack>

            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Dirección" error={!!errors.address} helperText={errors.address?.message} />
              )}
            />

            <Stack direction="row" spacing={2}>
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
                    fullWidth
                    onBlur={(e) => { field.onChange(autoFormatPhone(e.target.value)); field.onBlur(); }}
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Correo Electrónico (opcional)" type="email" error={!!errors.email} helperText={errors.email?.message} fullWidth />
                )}
              />
            </Stack>

            {/* Campos geográficos */}
            <Typography variant="subtitle2" color="text.secondary">Ubicación Geográfica (opcional)</Typography>
            <Stack direction="row" spacing={2}>
              <Controller
                name="stateId"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    ref={field.ref}
                    options={states}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    label="Estado"
                  />
                )}
              />
              <Controller
                name="cityId"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    ref={field.ref}
                    options={cities}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    label="Ciudad"
                  />
                )}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <Controller
                name="municipalityId"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    ref={field.ref}
                    options={municipalities}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    label="Municipio"
                  />
                )}
              />
              <Controller
                name="parishId"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    ref={field.ref}
                    options={parishes}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    label="Parroquia"
                  />
                )}
              />
            </Stack>
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
