import { createTheme } from '@mui/material/styles'

const NAVY = '#0B1929'
const TEAL = '#0E7490'
const TEAL_LIGHT = '#E0F2F7'
const AMBER = '#D97706'
const AMBER_LIGHT = '#FEF3C7'
const CREAM = '#F4F2ED'
const WHITE = '#FFFFFF'
const GRAY_100 = '#F3F4F6'
const GRAY_200 = '#E5E7EB'
const GRAY_500 = '#6B7280'
const GRAY_700 = '#374151'
const GRAY_900 = '#111827'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: TEAL,
      light: TEAL_LIGHT,
      dark: '#0C6177',
      contrastText: WHITE,
    },
    secondary: {
      main: AMBER,
      light: AMBER_LIGHT,
      dark: '#B45309',
      contrastText: WHITE,
    },
    background: {
      default: CREAM,
      paper: WHITE,
    },
    text: {
      primary: GRAY_900,
      secondary: GRAY_500,
    },
    divider: GRAY_200,
    success: { main: '#059669', light: '#D1FAE5' },
    warning: { main: AMBER, light: AMBER_LIGHT },
    error: { main: '#DC2626', light: '#FEE2E2' },
    info: { main: TEAL, light: TEAL_LIGHT },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    h1: {
      fontFamily: "'Fraunces', serif",
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.2,
      color: GRAY_900,
    },
    h2: {
      fontFamily: "'Fraunces', serif",
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: 1.25,
      color: GRAY_900,
    },
    h3: {
      fontFamily: "'Fraunces', serif",
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
      color: GRAY_900,
    },
    h4: {
      fontFamily: "'Fraunces', serif",
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.35,
      color: GRAY_900,
    },
    h5: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 600,
      fontSize: '1.1rem',
      color: GRAY_900,
    },
    h6: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 600,
      fontSize: '0.95rem',
      color: GRAY_700,
    },
    body1: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '0.9375rem',
      lineHeight: 1.6,
      color: GRAY_700,
    },
    body2: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: GRAY_500,
    },
    caption: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '0.75rem',
      color: GRAY_500,
    },
    button: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: 0.3,
    },
    overline: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 700,
      fontSize: '0.7rem',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
    },
  },
  shape: { borderRadius: 10 },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.05)',
    '0 1px 4px rgba(0,0,0,0.08)',
    '0 2px 8px rgba(0,0,0,0.08)',
    '0 4px 12px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.10)',
    '0 8px 24px rgba(0,0,0,0.10)',
    '0 8px 32px rgba(0,0,0,0.12)',
    '0 12px 40px rgba(0,0,0,0.12)',
    '0 16px 48px rgba(0,0,0,0.14)',
    '0 20px 60px rgba(0,0,0,0.14)',
    '0 24px 64px rgba(0,0,0,0.16)',
    '0 28px 72px rgba(0,0,0,0.16)',
    '0 32px 80px rgba(0,0,0,0.18)',
    '0 36px 88px rgba(0,0,0,0.18)',
    '0 40px 96px rgba(0,0,0,0.20)',
    '0 44px 104px rgba(0,0,0,0.20)',
    '0 48px 112px rgba(0,0,0,0.22)',
    '0 52px 120px rgba(0,0,0,0.22)',
    '0 56px 128px rgba(0,0,0,0.24)',
    '0 60px 136px rgba(0,0,0,0.24)',
    '0 64px 144px rgba(0,0,0,0.26)',
    '0 68px 152px rgba(0,0,0,0.26)',
    '0 72px 160px rgba(0,0,0,0.28)',
    '0 76px 168px rgba(0,0,0,0.28)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: CREAM },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          border: `1px solid ${GRAY_200}`,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(14,116,144,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${TEAL} 0%, #0C6177 100%)`,
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${AMBER} 0%, #B45309 100%)`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: 6,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: GRAY_100,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: GRAY_500,
            borderBottom: `2px solid ${GRAY_200}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.875rem',
          borderBottom: `1px solid ${GRAY_200}`,
          padding: '10px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': { backgroundColor: '#F9F9F7' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.875rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.16)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.75rem',
          borderRadius: 6,
          backgroundColor: NAVY,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 6 },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: GRAY_200 },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          width: 'calc(100% - 16px)',
          transition: 'all 0.15s ease',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" },
      },
    },
  },
})

export { NAVY, TEAL, AMBER, CREAM }
export default theme
