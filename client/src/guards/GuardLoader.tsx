import { Box, CircularProgress, Typography } from '@mui/material'

interface Props {
  message?: string
  fullScreen?: boolean
}

export default function GuardLoader({ message = 'Loading Kanbot…', fullScreen = true }: Props) {
  return (
    <Box
      sx={{
        height: fullScreen ? '100vh' : '100%',
        minHeight: fullScreen ? '100vh' : 240,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        bgcolor: 'background.default',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2.5,
          background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: 20,
          mb: 0.5,
        }}
      >
        K
      </Box>
      <CircularProgress size={32} thickness={4} color="primary" />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  )
}
