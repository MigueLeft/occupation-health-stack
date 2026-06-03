export const SYSTEM_MODULES = [
  { key: 'users', label: 'Usuarios' },
  { key: 'roles', label: 'Roles y Permisos' },
  { key: 'patients', label: 'Pacientes' },
  { key: 'expediente', label: 'Expediente de Paciente' },
  { key: 'companies', label: 'Empresas' },
  { key: 'positions', label: 'Cargos' },
  { key: 'requests', label: 'Solicitudes' },
  { key: 'consultations', label: 'Consultas' },
  { key: 'reports', label: 'Reportes' },
  { key: 'catalogs', label: 'Catálogos' },
  { key: 'backup', label: 'Respaldos' },
  { key: 'es-medico', label: 'Es Médico' },
  { key: 'es-psicologo', label: 'Es Psicólogo' },
] as const;

export type SystemModuleKey = (typeof SYSTEM_MODULES)[number]['key'];
