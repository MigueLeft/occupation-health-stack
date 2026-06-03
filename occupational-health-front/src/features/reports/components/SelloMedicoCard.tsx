import { useRef, useState } from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { UploadFileOutlined, DeleteOutlined, LocalHospitalOutlined } from '@mui/icons-material';
import { useReportConfig, useUpdateSelloMedico } from '../hooks/useReportConfig';

export function SelloMedicoCard() {
  const { data: config, isLoading } = useReportConfig();
  const { mutate: updateSello, isPending } = useUpdateSelloMedico();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateSello(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const hasSello = !!config?.selloMedico;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LocalHospitalOutlined sx={{ color: 'primary.main' }} />
        <Typography variant="h3" sx={{ fontSize: '1rem', fontWeight: 700 }}>Sello Médico</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Aparece en la esquina inferior derecha de cada reporte, antes del pie de página.
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={28} /></Box>
      ) : (
        <Box
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: isDragOver ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            bgcolor: isDragOver ? 'primary.50' : 'background.default',
            '&:hover': { borderColor: 'primary.light' },
          }}
        >
          {hasSello ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src={config.selloMedico!}
                alt="Sello médico"
                sx={{ maxHeight: 100, maxWidth: 200, objectFit: 'contain', borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                Arrastra una imagen para reemplazar
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <UploadFileOutlined sx={{ fontSize: 40, color: 'text.disabled' }} />
              <Typography variant="body2" color="text.secondary">
                Arrastra tu imagen aquí o haz clic para seleccionar
              </Typography>
              <Typography variant="caption" color="text.disabled">
                PNG, JPG o SVG recomendado
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />

      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<UploadFileOutlined />}
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
        >
          {hasSello ? 'Cambiar sello' : 'Seleccionar imagen'}
        </Button>
        {hasSello && (
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<DeleteOutlined />}
            onClick={(e) => { e.stopPropagation(); updateSello(null); }}
            disabled={isPending}
          >
            Quitar sello
          </Button>
        )}
        {isPending && <CircularProgress size={20} sx={{ ml: 1, alignSelf: 'center' }} />}
      </Box>
    </Paper>
  );
}
