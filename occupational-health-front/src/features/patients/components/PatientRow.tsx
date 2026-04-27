import { TableRow, TableCell, Avatar, Typography, Box, IconButton, Tooltip, Checkbox } from '@mui/material';
import { ArticleOutlined, ManageAccountsOutlined } from '@mui/icons-material';
import { formatCedula, calculateAge } from '@/utils/cedula';
import type { Patient } from '../types';

const AVATAR_COLORS = ['#7B68EE', '#6495ED', '#9370DB', '#8FBC8F', '#F4A460'];

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
      <TableCell sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
        {formatCedula(patient.cedula)}
      </TableCell>

      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: '0.875rem',
              bgcolor: getAvatarColor(patient.firstName),
            }}
          >
            {patient.firstName.charAt(0).toUpperCase()}
          </Avatar>
          <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>{fullName}</Typography>
        </Box>
      </TableCell>

      <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
        {patient.company?.name ?? (
          <Typography component="span" sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>
            Sin empresa
          </Typography>
        )}
      </TableCell>

      <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
        {patient.position?.name ?? (
          <Typography component="span" sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>
            Sin cargo
          </Typography>
        )}
      </TableCell>

      <TableCell sx={{ fontSize: '0.9rem' }}>{age}</TableCell>

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
