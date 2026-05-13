export const SYSTEM_MODULES = [
  { key: 'users', label: 'Usuarios' },
  { key: 'roles', label: 'Roles y Permisos' },
  { key: 'patients', label: 'Pacientes' },
  { key: 'companies', label: 'Empresas' },
  { key: 'positions', label: 'Cargos' },
  { key: 'requests', label: 'Solicitudes' },
  { key: 'consultations', label: 'Consultas' },
  { key: 'physical_exams', label: 'Exámenes Físicos' },
  { key: 'exam_results', label: 'Resultados de Exámenes' },
  { key: 'rest_periods', label: 'Períodos de Reposo' },
  { key: 'diagnostics', label: 'Diagnósticos' },
  { key: 'psychometric_tests', label: 'Pruebas Psicométricas' },
  { key: 'reports', label: 'Reportes' },
  { key: 'catalogs', label: 'Catálogos' },
  { key: 'backup', label: 'Respaldos' },
] as const;

export type SystemModuleKey = (typeof SYSTEM_MODULES)[number]['key'];
