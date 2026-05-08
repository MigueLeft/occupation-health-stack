import type { ReactNode } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Skeleton,
} from '@mui/material';
import { AddOutlined } from '@mui/icons-material';

interface CatalogTableViewProps {
  title: string;
  headers: string[];
  isLoading: boolean;
  onAdd?: () => void;
  showAddButton?: boolean;
  children: ReactNode;
  emptyLabel?: string;
}

export function CatalogTableView({
  title, headers, isLoading, onAdd, showAddButton = true, children, emptyLabel = 'Sin registros',
}: CatalogTableViewProps) {
  const colSpan = headers.length + 1; // +1 for Acciones

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h2">{title}</Typography>
        {showAddButton && onAdd && (
          <Button variant="contained" startIcon={<AddOutlined />} onClick={onAdd}>
            Agregar
          </Button>
        )}
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                {headers.map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 600, py: 1.5, color: 'white', borderBottom: 'none', whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
                <TableCell sx={{ fontWeight: 600, py: 1.5, color: 'white', borderBottom: 'none', whiteSpace: 'nowrap' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: colSpan }).map((__, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : children}
            </TableBody>
          </Table>
        </TableContainer>
        {!isLoading && (
          <Box id="catalog-empty-sentinel" sx={{ display: 'none' }}>{emptyLabel}</Box>
        )}
      </Paper>
    </Box>
  );
}

// Shared empty state row
export function CatalogEmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 6, color: 'text.disabled' }}>
        {label}
      </TableCell>
    </TableRow>
  );
}
