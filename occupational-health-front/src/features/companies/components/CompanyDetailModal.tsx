import { useState } from 'react';
import {
  Dialog, DialogContent, Box, Typography,
  Button, IconButton, Divider, Stack, Tooltip, Avatar,
} from '@mui/material';
import { CloseOutlined, EditOutlined, AddOutlined, BusinessOutlined } from '@mui/icons-material';
import { formatRif } from '@/utils/rif';
import { PositionsTable } from './PositionsTable';
import { PositionFormModal } from './PositionFormModal';
import { CompanyFormModal } from './CompanyFormModal';
import type { CompanyWithPositions } from '../types';

interface CompanyDetailModalProps {
  open: boolean;
  onClose: () => void;
  company: CompanyWithPositions | null;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  const isTruncated = value.length > 25;
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Tooltip title={isTruncated ? value : ''} placement="top-start">
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600, mt: 0.25, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontSize: value.length > 30 ? '0.85rem' : undefined,
          }}
        >
          {value}
        </Typography>
      </Tooltip>
    </Box>
  );
}

export function CompanyDetailModal({ open, onClose, company }: CompanyDetailModalProps) {
  const [createPositionOpen, setCreatePositionOpen] = useState(false);
  const [editCompanyOpen, setEditCompanyOpen] = useState(false);

  if (!company) return null;

  const geoLine = [company.stateName, company.cityName, company.municipalityName, company.parishName]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <Box
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            bgcolor: 'primary.main', color: 'primary.contrastText', px: 3, py: 2,
          }}
        >
          <Typography variant="h3" sx={{ color: 'inherit' }}>Detalles de la Empresa</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<EditOutlined />}
              size="small"
              onClick={() => setEditCompanyOpen(true)}
              sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' } }}
            >
              Editar
            </Button>
            <IconButton size="small" onClick={onClose} sx={{ color: 'inherit' }}>
              <CloseOutlined />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', minHeight: 480 }}>
            {/* Left panel - company info */}
            <Box sx={{ width: 290, flexShrink: 0, p: 3, borderRight: '1px solid', borderColor: 'divider' }}>
              {/* Logo */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
                <Avatar
                  src={company.logo ?? undefined}
                  variant="rounded"
                  sx={{ width: 80, height: 80, bgcolor: 'action.selected' }}
                >
                  {!company.logo && <BusinessOutlined sx={{ color: 'text.disabled', fontSize: 36 }} />}
                </Avatar>
              </Box>

              <Stack spacing={2.5} divider={<Divider />}>
                <InfoItem label="Empresa" value={company.name} />
                <InfoItem label="RIF" value={formatRif(company.rif)} />
                <InfoItem label="Dirección" value={company.address} />
                <InfoItem label="Contacto" value={company.contact} />
                {company.email && <InfoItem label="Correo" value={company.email} />}
                {geoLine && <InfoItem label="Ubicación" value={geoLine} />}
                <InfoItem label="Nro. Cargos" value={`${company.positions.length} cargos`} />
              </Stack>
            </Box>

            {/* Right panel - positions */}
            <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h3">Cargos y Riesgos de Exposición</Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddOutlined />}
                  onClick={() => setCreatePositionOpen(true)}
                >
                  Nuevo Cargo
                </Button>
              </Box>
              <Box sx={{ flex: 1 }}>
                <PositionsTable positions={company.positions} companyId={company.id} />
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <PositionFormModal
        open={createPositionOpen}
        onClose={() => setCreatePositionOpen(false)}
        companyId={company.id}
      />

      <CompanyFormModal
        open={editCompanyOpen}
        onClose={() => setEditCompanyOpen(false)}
        company={company}
      />
    </>
  );
}
