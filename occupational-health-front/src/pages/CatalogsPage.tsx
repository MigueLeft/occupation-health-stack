import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Navigate } from '@tanstack/react-router';
import { AppLayout } from '@/components/AppLayout';
import {
  CatalogLayout, ExamsPanel, RisksPanel, PsychometricTestsPanel,
  DiseasesPanel, AllergiesPanel, BodySystemsPanel, DiseaseCategoriesPanel,
  GeoCatalogPanel, MedicalSpecialtiesPanel, RiskExposureCategoriesPanel,
  DisabilitiesPanel, AccidentTypesPanel, PsychologicalIndicatorsPanel,
} from '@/features/catalogs';
import type { CatalogTab } from '@/features/catalogs';
import { usePermissions } from '@/features/auth';

const PANEL_MAP: Record<CatalogTab, React.ReactNode> = {
  exams: <ExamsPanel />,
  risks: <RisksPanel />,
  psychometric: <PsychometricTestsPanel />,
  'psychological-indicators': <PsychologicalIndicatorsPanel />,
  diseases: <DiseasesPanel />,
  allergies: <AllergiesPanel />,
  'body-systems': <BodySystemsPanel />,
  categories: <DiseaseCategoriesPanel />,
  accidents: <AccidentTypesPanel />,
  geo: <GeoCatalogPanel />,
  'medical-specialties': <MedicalSpecialtiesPanel />,
  'exposure-categories': <RiskExposureCategoriesPanel />,
  disabilities: <DisabilitiesPanel />,
};

export function CatalogsPage() {
  usePageTitle('Catálogos');

  const { can, isLoading } = usePermissions();
  const [activeTab, setActiveTab] = useState<CatalogTab>('exams');

  if (isLoading) return null;
  if (!can('catalogs', 'view')) return <Navigate to="/" />;

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ px: 4, pt: 3.5, pb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2">Catálogos del Sistema</Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <CatalogLayout activeTab={activeTab} onTabChange={setActiveTab}>
            {PANEL_MAP[activeTab]}
          </CatalogLayout>
        </Box>
      </Box>
    </AppLayout>
  );
}
