import { Box, IconButton, Tooltip } from '@mui/material';
import { EditOutlined, DeleteOutlined } from '@mui/icons-material';
import { usePermissions } from '@/features/auth';

interface CatalogRowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function CatalogRowActions({ onEdit, onDelete }: CatalogRowActionsProps) {
  const { can } = usePermissions();

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {can('catalogs', 'edit') && (
        <Tooltip title="Editar">
          <IconButton size="small" onClick={onEdit}>
            <EditOutlined fontSize="small" sx={{ color: 'secondary.main' }} />
          </IconButton>
        </Tooltip>
      )}
      {can('catalogs', 'delete') && (
        <Tooltip title="Eliminar">
          <IconButton size="small" onClick={onDelete}>
            <DeleteOutlined fontSize="small" color="error" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
