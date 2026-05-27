import type { ReactNode } from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  MonitorHeart,
  AdminPanelSettingsOutlined,
  PeopleAltOutlined,
  PersonOutlined,
  BusinessOutlined,
  LibraryBooksOutlined,
  AssignmentOutlined,
  LocalHospitalOutlined,
  LogoutOutlined,
  AssessmentOutlined,
  BackupOutlined,
} from '@mui/icons-material';
import { Link, useRouterState } from '@tanstack/react-router';
import { useAuth } from '@/features/auth';
import { usePermissions } from '@/features/auth';

interface NavItem {
  label: string;
  icon: ReactNode;
  to: string;
  module?: string;
}

const MAIN_ITEMS: NavItem[] = [
  { label: 'Pacientes', icon: <PersonOutlined fontSize="small" />, to: '/pacientes', module: 'patients' },
  { label: 'Empresas', icon: <BusinessOutlined fontSize="small" />, to: '/empresas', module: 'companies' },
  { label: 'Solicitudes', icon: <AssignmentOutlined fontSize="small" />, to: '/solicitudes', module: 'requests' },
  { label: 'Consultas', icon: <LocalHospitalOutlined fontSize="small" />, to: '/consultas', module: 'consultations' },
  { label: 'Catálogos', icon: <LibraryBooksOutlined fontSize="small" />, to: '/catalogos', module: 'catalogs' },
  { label: 'Reportes', icon: <AssessmentOutlined fontSize="small" />, to: '/reportes', module: 'reports' },
];

const CONFIG_ITEMS: NavItem[] = [
  { label: 'Usuarios', icon: <PeopleAltOutlined fontSize="small" />, to: '/usuarios', module: 'users' },
  { label: 'Roles y Permisos', icon: <AdminPanelSettingsOutlined fontSize="small" />, to: '/config/roles', module: 'roles' },
  { label: 'Respaldos', icon: <BackupOutlined fontSize="small" />, to: '/config/backup', module: 'backup' },
];

function NavButton({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <ListItemButton
      component={Link}
      to={item.to}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        py: 1.25,
        color: 'white',
        opacity: isActive ? 1 : 0.65,
        bgcolor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', opacity: 1 },
      }}
    >
      <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{item.icon}</ListItemIcon>
      <ListItemText
        primary={item.label}
        slotProps={{ primary: { sx: { fontSize: '0.9rem', fontFamily: 'Sarabun, sans-serif' } } }}
      />
    </ListItemButton>
  );
}

export function SidebarContent() {
  const { user, signOut } = useAuth();
  const { can, isLoading } = usePermissions();
  const { location } = useRouterState();

  const visibleMain = isLoading
    ? MAIN_ITEMS
    : MAIN_ITEMS.filter((item) => !item.module || can(item.module, 'view'));

  const visibleConfig = isLoading
    ? CONFIG_ITEMS
    : CONFIG_ITEMS.filter((item) => !item.module || can(item.module, 'view'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            borderRadius: 1.5,
            p: 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MonitorHeart sx={{ color: 'white', fontSize: 22 }} />
        </Box>
        <Typography
          sx={{
            color: 'white',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: '0.9rem',
            lineHeight: 1.3,
          }}
        >
          Salud Ocupacional
        </Typography>
      </Box>

      {/* Navegación principal */}
      <List sx={{ px: 1.5, mt: 1 }} disablePadding>
        {visibleMain.map((item) => (
          <NavButton key={item.label} item={item} isActive={location.pathname === item.to} />
        ))}
      </List>

      {visibleConfig.length > 0 && (
        <>
          <Divider sx={{ mx: 2, my: 1.5, borderColor: 'rgba(255,255,255,0.12)' }} />

          <Box sx={{ px: 2.5, mb: 1 }}>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Configuración
            </Typography>
          </Box>

          <List sx={{ px: 1.5, flex: 1 }} disablePadding>
            {visibleConfig.map((item) => (
              <NavButton key={item.label} item={item} isActive={location.pathname.startsWith(item.to)} />
            ))}
          </List>
        </>
      )}

      {visibleConfig.length === 0 && <Box sx={{ flex: 1 }} />}

      <Divider sx={{ mx: 2, borderColor: 'rgba(255,255,255,0.12)' }} />

      {/* Usuario + logout */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: '0.875rem' }}>
          {(user?.name ?? 'A').charAt(0).toUpperCase()}
        </Avatar>
        <Typography sx={{ color: 'white', fontSize: '0.875rem', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name ?? 'Admin'}
        </Typography>
        <Tooltip title="Cerrar sesión">
          <IconButton size="small" onClick={signOut} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
            <LogoutOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export function AppSidebar() {
  return (
    <Box
      sx={{
        width: 230,
        flexShrink: 0,
        bgcolor: 'primary.main',
        minHeight: '100vh',
      }}
    >
      <SidebarContent />
    </Box>
  );
}
