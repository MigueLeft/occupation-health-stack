import {
  TableRow,
  TableCell,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { EditOutlined, DeleteOutlined } from '@mui/icons-material';
import type { AppUser } from '../types';

const TRUNCATE = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const;

function getAvatarColor(name: string): string {
  const colors = ['#7B68EE', '#6495ED', '#9370DB', '#8FBC8F', '#F4A460'];
  return colors[name.charCodeAt(0) % colors.length];
}

interface UserRowProps {
  user: AppUser;
  onToggleStatus: (user: AppUser) => void;
  onEdit: (user: AppUser) => void;
  onDelete: (user: AppUser) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function UserRow({ user, onToggleStatus, onEdit, onDelete, canEdit = true, canDelete = true }: UserRowProps) {
  const isActive = !user.banned;

  return (
    <TableRow sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}>
      <TableCell sx={{ maxWidth: 220 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Avatar sx={{ width: 34, height: 34, flexShrink: 0, fontSize: '0.875rem', bgcolor: getAvatarColor(user.name) }}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Tooltip title={user.name} placement="top-start">
            <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', ...TRUNCATE }}>{user.name}</Typography>
          </Tooltip>
        </Box>
      </TableCell>

      <TableCell sx={{ maxWidth: 220 }}>
        <Tooltip title={user.email} placement="top-start">
          <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', ...TRUNCATE }}>{user.email}</Typography>
        </Tooltip>
      </TableCell>

      <TableCell sx={{ maxWidth: 160 }}>
        {user.roleName ? (
          <Tooltip title={user.roleName} placement="top-start">
            <Typography sx={{ fontSize: '0.9rem', ...TRUNCATE }}>{user.roleName}</Typography>
          </Tooltip>
        ) : (
          <Typography component="span" sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>
            Sin rol
          </Typography>
        )}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Chip
          label={isActive ? 'Activo' : 'Inactivo'}
          size="small"
          onClick={() => onToggleStatus(user)}
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            bgcolor: isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
            color: isActive ? 'success.dark' : 'error.main',
            cursor: 'pointer',
            '&:hover': { opacity: 0.85 },
          }}
        />
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {canEdit && (
            <Tooltip title="Editar rol">
              <IconButton size="small" onClick={() => onEdit(user)}>
                <EditOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Eliminar usuario">
              <IconButton size="small" color="error" onClick={() => onDelete(user)}>
                <DeleteOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
}
