import { createTheme } from '@mui/material/styles';

const MONTSERRAT = '"Montserrat", "Helvetica", "Arial", sans-serif';
const SARABUN = '"Sarabun", "Helvetica", "Arial", sans-serif';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2A2455',
      light: '#6A5ACD',
      dark: '#1A1640',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6A5ACD',
      light: '#B8A7FF',
      dark: '#4A3AA0',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FBFAFF',
      paper: '#FFFFFF',
    },
    action: {
      hover: 'rgba(230, 225, 255, 0.5)',
    },
  },
  typography: {
    fontFamily: SARABUN,
    h1: { fontFamily: MONTSERRAT, fontSize: '2rem', fontWeight: 700, lineHeight: 1.25 },
    h2: { fontFamily: MONTSERRAT, fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 },
    h3: { fontFamily: MONTSERRAT, fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
    subtitle2: { fontFamily: MONTSERRAT, fontSize: '0.8125rem', fontWeight: 600 },
    body1: { fontFamily: SARABUN, fontSize: '1rem', fontWeight: 400 },
    body2: { fontFamily: SARABUN, fontSize: '0.875rem', fontWeight: 400 },
    caption: { fontFamily: SARABUN, fontSize: '0.75rem', fontWeight: 400 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: MONTSERRAT,
          borderRadius: 10,
          padding: '12px 24px',
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            backgroundColor: '#2A2455',
            '&:hover': { backgroundColor: '#1A1640' },
          },
        },
      ],
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontFamily: SARABUN,
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6A5ACD' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2455' },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontFamily: SARABUN },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: SARABUN, fontWeight: 600, fontSize: '0.75rem' },
      },
    },
  },
});
