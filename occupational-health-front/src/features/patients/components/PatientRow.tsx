import { TableRow, TableCell, Avatar, Typography, Box, IconButton, Tooltip, Checkbox } from '@mui/material';
import { ArticleOutlined, ManageAccountsOutlined } from '@mui/icons-material';
import { formatCedula, calculateAge } from '@/utils/cedula';
import type { Patient } from '../types';

const AVATAR_COLORS = ['#7B68EE', '#6495ED', '#9370DB', '#8FBC8F', '#F4A460'];
const TRUNCATE = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const;

function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

interface PatientRowProps {
  patient: Patient;
  selected: boolean;
  onToggleSelect: (cedula: string) => void;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
}

export function PatientRow({ patient, selected, onToggleSelect, onView, onEdit }: PatientRowProps) {
  const fullName = `${patient.firstName} ${patient.lastName}`;
  const age = calculateAge(patient.birthDate);

  return (
    <TableRow sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }} selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onChange={() => onToggleSelect(patient.cedula)} />
      </TableCell>
      <TableCell sx={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
        {formatCedula(patient.cedula)}
      </TableCell>

      <TableCell sx={{ maxWidth: 220 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Avatar sx={{ width: 34, height: 34, flexShrink: 0, fontSize: '0.875rem', bgcolor: getAvatarColor(patient.firstName) }}>
            {patient.firstName.charAt(0).toUpperCase()}
          </Avatar>
          <Tooltip title={fullName} placement="top-start">
            <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', ...TRUNCATE }}>{fullName}</Typography>
          </Tooltip>
        </Box>
      </TableCell>

      <TableCell sx={{ maxWidth: 180 }}>
        {patient.company?.name ? (
          <Tooltip title={patient.company.name} placement="top-start">
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', ...TRUNCATE }}>
              {patient.company.name}
            </Typography>
          </Tooltip>
        ) : (
          <Typography component="span" sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>
            Sin empresa
          </Typography>
        )}
      </TableCell>

      <TableCell sx={{ maxWidth: 160 }}>
        {patient.position?.name ? (
          <Tooltip title={patient.position.name} placement="top-start">
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', ...TRUNCATE }}>
              {patient.position.name}
            </Typography>
          </Tooltip>
        ) : (
          <Typography component="span" sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>
            Sin cargo
          </Typography>
        )}
      </TableCell>

      <TableCell sx={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{age}</TableCell>

      <TableCell>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Ver expediente">
            <IconButton size="small" onClick={() => onView(patient)}>
              <ArticleOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar paciente">
            <IconButton size="small" color="primary" onClick={() => onEdit(patient)}>
              <ManageAccountsOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
}
