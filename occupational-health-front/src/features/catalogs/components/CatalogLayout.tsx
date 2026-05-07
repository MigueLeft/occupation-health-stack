import type { ReactNode } from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, Divider } from '@mui/material';

export type CatalogTab =
  | 'exams'
  | 'risks'
  | 'psychometric'
  | 'diseases'
  | 'allergies'
  | 'body-systems'
  | 'categories'
  | 'geo';

const NAV_ITEMS: { id: CatalogTab; label: string }[] = [
  { id: 'exams', label: 'Exámenes' },
  { id: 'risks', label: 'Riesgo de Exposición' },
  { id: 'psychometric', label: 'Tests Psicométricos' },
  { id: 'diseases', label: 'Enfermedades' },
  { id: 'allergies', label: 'Alergias' },
  { id: 'body-systems', label: 'Aparatos y Sistemas' },
  { id: 'categories', label: 'Categorías de Diagnóstico' },
  { id: 'geo', label: 'Catálogo Geográfico' },
];

interface CatalogLayoutProps {
  activeTab: CatalogTab;
  onTabChange: (tab: CatalogTab) => void;
  children: ReactNode;
}

export function CatalogLayout({ activeTab, onTabChange, children }: CatalogLayoutProps) {
  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Left nav */}
      <Box
        sx={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          pt: 3,
        }}
      >
        <Typography
          sx={{
            px: 2.5,
            mb: 1,
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'text.disabled',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          Catálogos
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <List disablePadding>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <ListItemButton
                key={item.id}
                onClick={() => onTabChange(item.id)}
                sx={{
                  py: 1.25,
                  pl: 2.5,
                  borderLeft: '3px solid',
                  borderColor: isActive ? 'primary.main' : 'transparent',
                  bgcolor: isActive ? 'rgba(106,90,205,0.08)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(106,90,205,0.05)' },
                }}
              >
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: isActive ? 600 : 400, color: isActive ? 'primary.main' : 'text.primary' } } }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Right content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 4 }}>{children}</Box>
    </Box>
  );
}
