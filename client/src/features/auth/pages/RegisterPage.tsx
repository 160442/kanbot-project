import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box, Button, TextField, Typography, Link, Alert, InputAdornment, IconButton,
  LinearProgress, useTheme,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { toast } from 'sonner'
import { authApi } from '@/api/auth'
import { ApiError, toFieldErrors } from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { registerSchema, type RegisterForm } from '../schemas/authSchemas'
import KanbotLogo from '@/components/brand/KanbotLogo'
import ThemeToggle from '@/components/theme/ThemeToggle'

export default function RegisterPage() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterForm) => {
    setFormError(null)
    try {
      const res = await authApi.register(data)
      setAuth(res.token, res.user)
      toast.success('Account created — welcome to Kanbot')
      navigate('/projects', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details?.length) {
          Object.entries(toFieldErrors(err.details)).forEach(([k, v]) => setError(k as keyof RegisterForm, v))
        } else {
          setFormError(err.message)
          toast.error(err.message)
        }
      } else {
        setFormError('Something went wrong')
        toast.error('Something went wrong')
      }
    }
  }

  const fieldSx = {
    mb: 2.25,
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,
      bgcolor: 'background.paper',
      '& fieldset': { borderColor: 'divider' },
      '&:hover fieldset': { borderColor: 'primary.light' },
      '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 1.5 },
    },
    '& input': { py: 1.35, fontSize: 14 },
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: (th) =>
            th.palette.mode === 'dark' ? 'rgba(22, 21, 31, 0.75)' : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(14px)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <KanbotLogo height={40} />
        <ThemeToggle />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            width: { md: '48%', lg: '50%' },
            flexDirection: 'column',
            bgcolor: isDark ? '#12111A' : '#F0EDF8',
            backgroundImage: isDark
              ? 'radial-gradient(ellipse 90% 70% at 20% 30%, rgba(124,58,237,0.28) 0%, transparent 55%)'
              : 'radial-gradient(ellipse 90% 70% at 20% 30%, rgba(124,58,237,0.12) 0%, transparent 55%)',
            p: { md: 4, lg: 5 },
            borderRight: 1,
            borderColor: 'divider',
            transition: 'background-color 0.3s ease',
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { md: 40, lg: 48 },
                lineHeight: 1.15,
                letterSpacing: -1,
                mb: 2.5,
                color: isDark ? '#fff' : 'text.primary',
              }}
            >
              Start shipping
              <br />
              with clarity.
            </Typography>
            <Typography sx={{ color: isDark ? 'rgba(226,232,240,0.72)' : 'text.secondary', fontSize: 15, maxWidth: 400, mb: 4 }}>
              Create your workspace, build a backlog, and let AI help you plan the next sprint.
            </Typography>
            <Box
              sx={{
                maxWidth: 360,
                p: 2,
                borderRadius: 3,
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'background.paper',
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5, color: isDark ? '#fff' : 'text.primary' }}>
                Your first sprint
              </Typography>
              <LinearProgress
                variant="determinate"
                value={20}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
                  },
                }}
              />
            </Box>
          </Box>
          <Typography sx={{ fontSize: 13, color: isDark ? 'rgba(148,163,184,0.8)' : 'text.secondary' }}>
            Designed for people who build.
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            p: { xs: 3, sm: 4 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 26, sm: 30 }, letterSpacing: -0.6, color: 'text.primary', mb: 0.75 }}>
              Create an account
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14.5, mb: 3.5 }}>
              Start managing projects with Kanbot.
            </Typography>

            {formError && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{formError}</Alert>}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', mb: 0.75 }}>Name</Typography>
              <TextField fullWidth size="small" autoComplete="name" autoFocus error={!!errors.name} helperText={errors.name?.message} sx={fieldSx} {...register('name')} />

              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', mb: 0.75 }}>Email address</Typography>
              <TextField fullWidth size="small" autoComplete="email" placeholder="alex@example.com" error={!!errors.email} helperText={errors.email?.message} sx={fieldSx} {...register('email')} />

              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', mb: 0.75 }}>Password</Typography>
              <TextField
                fullWidth size="small" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                placeholder="At least 8 characters"
                error={!!errors.password} helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small">
                        {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx} {...register('password')}
              />

              <Button
                type="submit" fullWidth disabled={isSubmitting}
                sx={{
                  py: 1.4, borderRadius: 2.5, fontWeight: 600, fontSize: 15, textTransform: 'none',
                  color: '#fff', bgcolor: '#7C3AED', boxShadow: 'none',
                  '&:hover': { bgcolor: '#6D28D9', boxShadow: 'none' },
                }}
              >
                {isSubmitting ? 'Creating…' : 'Create account'}
              </Button>
            </Box>

            <Typography align="center" sx={{ mt: 3, fontSize: 14, color: 'text.secondary' }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
