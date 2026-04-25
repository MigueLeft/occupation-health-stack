import { TableRow, TableCell, Box, IconButton, Tooltip } from '@mui/material';
import { VisibilityOutlined } from '@mui/icons-material';
import { formatRif } from '@/utils/rif';
import type { CompanyWithPositions } from '../types';

interface CompanyRowProps {
  company: CompanyWithPositions;
  onView: (company: CompanyWithPositions) => void;
}

export function CompanyRow({ company, onView }: CompanyRowProps) {
  return (
    <TableRow sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}>
      <TableCell sx={{ fontWeight: 500, fontSize: '0.9rem' }}>{company.name}</TableCell>
      <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>{company.address}</TableCell>
      <TableCell sx={{ fontSize: '0.9rem' }}>{formatRif(company.rif)}</TableCell>
      <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>{company.contact}</TableCell>
      <TableCell sx={{ fontSize: '0.9rem' }}>{company.positions.length}</TableCell>
      <TableCell>
        <Box sx={{ display: 'flex' }}>
          <Tooltip title="Ver detalles">
            <IconButton size="small" onClick={() => onView(company)}>
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
}
