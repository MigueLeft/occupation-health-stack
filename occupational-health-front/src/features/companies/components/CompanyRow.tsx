import { TableRow, TableCell, Box, IconButton, Tooltip, Typography } from '@mui/material';
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
      <TableCell sx={{ maxWidth: 200 }}>
        <Tooltip title={company.name.length > 28 ? company.name : ''} placement="top-start">
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {company.name}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ maxWidth: 220 }}>
        <Tooltip title={company.address.length > 35 ? company.address : ''} placement="top-start">
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {company.address}
          </Typography>
        </Tooltip>
      </TableCell>
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
