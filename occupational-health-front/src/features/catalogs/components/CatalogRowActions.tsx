import { Box, IconButton, Tooltip } from '@mui/material';
import { EditOutlined, DeleteOutlined } from '@mui/icons-material';

interface CatalogRowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function CatalogRowActions({ onEdit, onDelete }: CatalogRowActionsProps) {
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <Tooltip title="Editar">
        <IconButton size="small" onClick={onEdit}>
          <EditOutlined fontSize="small" sx={{ color: 'secondary.main' }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Eliminar">
        <IconButton size="small" onClick={onDelete}>
          <DeleteOutlined fontSize="small" color="error" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
