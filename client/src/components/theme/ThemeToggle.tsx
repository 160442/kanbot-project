import { IconButton, Tooltip } from '@mui/material'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { useUiStore } from '@/stores/uiStore'

interface Props {
  /** For dark panels (login left side) */
  variant?: 'default' | 'onDark'
  size?: 'small' | 'medium'
}

export default function ThemeToggle({ variant = 'default', size = 'small' }: Props) {
  const themeMode = useUiStore((s) => s.themeMode)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const isDark = themeMode === 'dark'
  const onDark = variant === 'onDark'

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        onClick={toggleTheme}
        size={size}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={isDark}
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          border: 1,
          borderColor: onDark ? 'rgba(255,255,255,0.12)' : 'divider',
          color: onDark ? 'rgba(255,255,255,0.75)' : 'text.secondary',
          bgcolor: onDark ? 'transparent' : 'background.paper',
          transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
          '&:hover': {
            bgcolor: onDark ? 'rgba(255,255,255,0.08)' : 'action.hover',
            borderColor: onDark ? 'rgba(255,255,255,0.2)' : 'primary.light',
          },
        }}
      >
        {isDark ? (
          <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
        ) : (
          <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />
        )}
      </IconButton>
    </Tooltip>
  )
}
