import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import {
  AdminPanelSettingsOutlined,
  PersonOutlineOutlined,
  DeleteOutlined,
} from '@mui/icons-material';
import type { Role } from '../types';

interface RoleCardProps {
  role: Role;
  selected: boolean;
  onClick: () => void;
  onDelete?: (role: Role) => void;
}

export function RoleCard({ role, selected, onClick, onDelete }: RoleCardProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.75,
        borderRadius: 2,
        cursor: 'pointer',
        bgcolor: selected ? 'primary.main' : 'transparent',
        color: selected ? 'white' : 'text.primary',
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        mb: 1,
        transition: 'all 0.15s ease',
        '&:hover': {
          bgcolor: selected ? 'primary.dark' : 'action.hover',
          '& .role-delete-btn': { opacity: 1 },
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: selected ? 'rgba(255,255,255,0.2)' : 'primary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {selected ? (
          <AdminPanelSettingsOutlined sx={{ fontSize: 18, color: 'white' }} />
        ) : (
          <PersonOutlineOutlined sx={{ fontSize: 18, color: 'primary.main' }} />
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: 'inherit', lineHeight: 1.3 }}>
          {role.name}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: selected ? 'rgba(255,255,255,0.7)' : 'text.secondary',
            mt: 0.25,
          }}
        >
          {role.userCount === 0
            ? 'Sin usuarios'
            : `${role.userCount} usuario${role.userCount !== 1 ? 's' : ''}`}
        </Typography>
      </Box>

      {onDelete && (
        <Tooltip title="Eliminar rol">
          <IconButton
            className="role-delete-btn"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(role);
            }}
            sx={{
              opacity: 0,
              color: selected ? 'rgba(255,255,255,0.7)' : 'text.disabled',
              flexShrink: 0,
              transition: 'opacity 0.15s',
              '&:hover': { color: selected ? 'white' : 'error.main' },
            }}
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
