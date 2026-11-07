import { createTheme, type ThemeOptions, alpha } from '@mui/material/styles'

/** Brand primary — same in both themes */
export const BRAND = {
  primary: '#7C3AED',
  primaryHover: '#6D28D9',
  primarySoft: '#EDE9FE',
  primaryMuted: 'rgba(124, 58, 237, 0.18)',
}

/** Sidebar tokens — pick by mode */
export const sidebarDark = {
  bg: '#0F0E17',
  text: '#E2E8F0',
  muted: '#94A3B8',
  dim: '#64748B',
  activeBg: 'rgba(124, 58, 237, 0.22)',
  activeText: '#A78BFA',
  hover: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)',
  card: 'rgba(255,255,255,0.04)',
}

export const sidebarLight = {
  bg: '#FFFFFF',
  text: '#1E1B4B',
  muted: '#64748B',
  dim: '#94A3B8',
  activeBg: 'rgba(124, 58, 237, 0.10)',
  activeText: '#7C3AED',
  hover: 'rgba(124, 58, 237, 0.06)',
  border: '#E2E8F0',
  card: '#F4F5FB',
}

/** @deprecated use sidebarDark / sidebarLight via mode */
export const sidebar = sidebarDark

const typography = {
  fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  h1: { fontWeight: 700 },
  h2: { fontWeight: 700 },
  h3: { fontWeight: 600 },
  h4: { fontWeight: 700 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { textTransform: 'none' as const, fontWeight: 600 },
}

function buildComponents(mode: 'light' | 'dark'): ThemeOptions['components'] {
  const isDark = mode === 'dark'
  return {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          colorScheme: mode,
        },
        body: {
          backgroundColor: isDark ? '#0B0A12' : '#F4F5FB',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        },
        '*, *::before, *::after': {
          transitionProperty: 'background-color, border-color, color, box-shadow, fill, stroke',
          transitionDuration: '0.3s',
          transitionTimingFunction: 'ease',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            transitionDuration: '0.01ms !important',
            animationDuration: '0.01ms !important',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: BRAND.primary,
          color: '#fff',
          '&:hover': { backgroundColor: BRAND.primaryHover },
        },
        outlined: {
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#EEF0F6'}`,
          backgroundColor: isDark ? '#16151F' : '#FFFFFF',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: isDark ? '#1C1B26' : '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark ? 'rgba(167,139,250,0.5)' : '#C4B5FD',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: BRAND.primary,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: isDark ? '#16151F' : '#FFFFFF',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#EEF0F6'}`,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: isDark ? '#1C1B26' : '#FFFFFF',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#EEF0F6'}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: isDark ? '#2A2838' : '#1E1B4B',
          fontSize: 12,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  }
}

const lightOptions: ThemeOptions = {
  typography,
  shape: { borderRadius: 12 },
  palette: {
    mode: 'light',
    primary: { main: BRAND.primary, light: '#A78BFA', dark: '#5B21B6', contrastText: '#FFFFFF' },
    secondary: { main: '#6366F1', light: '#A5B4FC', dark: '#4338CA' },
    background: { default: '#F4F5FB', paper: '#FFFFFF' },
    text: { primary: '#1E1B4B', secondary: '#64748B', disabled: '#94A3B8' },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    info: { main: '#3B82F6' },
    divider: '#E2E8F0',
    action: {
      hover: alpha(BRAND.primary, 0.04),
      selected: alpha(BRAND.primary, 0.08),
      disabled: 'rgba(30, 27, 75, 0.26)',
      disabledBackground: 'rgba(30, 27, 75, 0.08)',
    },
  },
  components: buildComponents('light'),
}

const darkOptions: ThemeOptions = {
  typography,
  shape: { borderRadius: 12 },
  palette: {
    mode: 'dark',
    primary: { main: '#A78BFA', light: '#C4B5FD', dark: BRAND.primary, contrastText: '#0F0E17' },
    secondary: { main: '#818CF8', light: '#A5B4FC', dark: '#6366F1' },
    background: { default: '#0B0A12', paper: '#16151F' },
    text: { primary: '#F1F5F9', secondary: '#94A3B8', disabled: '#64748B' },
    success: { main: '#34D399' },
    warning: { main: '#FBBF24' },
    error: { main: '#F87171' },
    info: { main: '#60A5FA' },
    divider: 'rgba(255,255,255,0.08)',
    action: {
      hover: 'rgba(167, 139, 250, 0.08)',
      selected: 'rgba(167, 139, 250, 0.14)',
      disabled: 'rgba(241, 245, 249, 0.3)',
      disabledBackground: 'rgba(255,255,255,0.08)',
    },
  },
  components: buildComponents('dark'),
}

export const lightTheme = createTheme(lightOptions)
export const darkTheme = createTheme(darkOptions)
export const theme = lightTheme
