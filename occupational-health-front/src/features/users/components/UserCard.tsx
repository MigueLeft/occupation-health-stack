import { Box, Typography, Avatar, IconButton } from '@mui/material';
import { ChevronRightOutlined } from '@mui/icons-material';
import type { AppUser } from '../types';

function getAvatarColor(name: string): string {
  const colors = ['#7B68EE', '#6495ED', '#9370DB', '#8FBC8F', '#F4A460'];
  return colors[name.charCodeAt(0) % colors.length];
}

interface UserCardProps {
  user: AppUser;
  onEdit?: (user: AppUser) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  const isActive = !user.banned;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Avatar
        sx={{ width: 44, height: 44, fontSize: '1rem', bgcolor: getAvatarColor(user.name) }}
      >
        {user.name.charAt(0).toUpperCase()}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</Typography>
        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.25 }}>
          {user.roleName ?? 'Sin rol'} ·{' '}
          <Box component="span" sx={{ color: isActive ? 'success.main' : 'error.main' }}>
            {isActive ? 'Activo' : 'Inactivo'}
          </Box>
        </Typography>
      </Box>

      {onEdit && (
        <IconButton size="small" onClick={() => onEdit(user)} sx={{ color: 'text.disabled' }}>
          <ChevronRightOutlined />
        </IconButton>
      )}
    </Box>
  );
}
