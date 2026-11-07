import { useState } from 'react'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box, Button, TextField, Typography, Link, Alert, InputAdornment, IconButton,
  Checkbox, FormControlLabel, LinearProgress, useTheme,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { toast } from 'sonner'
import { authApi } from '@/api/auth'
import { ApiError, toFieldErrors } from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { loginSchema, type LoginForm } from '../schemas/authSchemas'
import KanbotLogo from '@/components/brand/KanbotLogo'
import ThemeToggle from '@/components/theme/ThemeToggle'

export default function LoginPage() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginForm) => {
    setFormError(null)
    try {
      const res = await authApi.login(data)
      setAuth(res.token, res.user)
      toast.success(`Welcome back, ${res.user.name}`)
      const redirect = params.get('redirect')
      const dest = redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/projects'
      navigate(dest, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details?.length) {
          Object.entries(toFieldErrors(err.details)).forEach(([k, v]) => setError(k as keyof LoginForm, v))
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
      {/* Navbar */}
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
          backdropFilter: 'blur(14px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(14px) saturate(1.2)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <KanbotLogo height={50} />
        <ThemeToggle />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 0 }}>
        {/* Left panel — theme aware */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            width: { md: '48%', lg: '50%' },
            flexDirection: 'column',
            position: 'relative',
            bgcolor: isDark ? '#12111A' : '#F0EDF8',
            backgroundImage: isDark
              ? 'radial-gradient(ellipse 90% 70% at 20% 30%, rgba(124,58,237,0.28) 0%, transparent 55%)'
              : 'radial-gradient(ellipse 90% 70% at 20% 30%, rgba(124,58,237,0.12) 0%, transparent 55%)',
            color: isDark ? '#fff' : 'text.primary',
            p: { md: 4, lg: 5 },
            overflow: 'hidden',
            borderRight: 1,
            borderColor: 'divider',
            transition: 'background-color 0.3s ease, color 0.3s ease',
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 1,
              py: 4,
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                alignSelf: 'flex-start',
                px: 1.25,
                py: 0.4,
                borderRadius: 99,
                bgcolor: isDark ? 'rgba(167,139,250,0.15)' : 'rgba(124,58,237,0.1)',
                border: 1,
                borderColor: isDark ? 'rgba(167,139,250,0.25)' : 'rgba(124,58,237,0.2)',
                fontSize: 12,
                fontWeight: 600,
                color: isDark ? '#C4B5FD' : '#7C3AED',
                mb: 2.5,
              }}
            >
              <Box component="span" sx={{ fontSize: 13 }}>✦</Box>
              AI-powered planning
            </Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { md: 40, lg: 48 },
                lineHeight: 1.15,
                letterSpacing: -1,
                mb: 2.5,
                maxWidth: 440,
                color: isDark ? '#FFFFFF' : 'text.primary',
              }}
            >
              Turn your plans
              <br />
              into meaningful
              <br />
              progress.
            </Typography>
            <Typography
              sx={{
                color: isDark ? 'rgba(226,232,240,0.72)' : 'text.secondary',
                fontSize: 15,
                lineHeight: 1.6,
                maxWidth: 400,
                mb: 5,
              }}
            >
              Organize your ideas, plan focused sprints, and let AI handle the busywork.
            </Typography>

            <Box
              sx={{
                maxWidth: 360,
                p: 2,
                borderRadius: 3,
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'background.paper',
                border: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'divider',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 14, color: isDark ? '#fff' : 'text.primary' }}>
                  Product sprint
                </Typography>
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 99,
                    bgcolor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)',
                    color: isDark ? '#6EE7B7' : '#059669',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  68% complete
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={68}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  mb: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
                  },
                }}
              />
              <Box sx={{ display: 'flex', gap: 1.25 }}>
                {[1, 2, 3].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      flex: 1,
                      height: 64,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'action.hover',
                      border: 1,
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'divider',
                      p: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.75,
                    }}
                  >
                    <Box
                      sx={{
                        height: 6,
                        width: '70%',
                        borderRadius: 1,
                        bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'divider',
                      }}
                    />
                    <Box
                      sx={{
                        height: 6,
                        width: '45%',
                        borderRadius: 1,
                        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'action.selected',
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
          <Typography
            sx={{
              fontSize: 13,
              color: isDark ? 'rgba(148,163,184,0.8)' : 'text.secondary',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Designed for people who build.
          </Typography>
        </Box>

        {/* Right form — theme aware */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            p: { xs: 3, sm: 4 },
            transition: 'background-color 0.3s ease',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: 26, sm: 30 },
                letterSpacing: -0.6,
                color: 'text.primary',
                mb: 0.75,
              }}
            >
              Welcome back
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14.5, mb: 3.5 }}>
              Sign in to continue managing your projects.
            </Typography>

            {formError && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {formError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', mb: 0.75 }}>
                Email address
              </Typography>
              <TextField
                fullWidth
                size="small"
                autoComplete="email"
                autoFocus
                placeholder="alex@example.com"
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={fieldSx}
                {...register('email')}
              />

              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', mb: 0.75 }}>
                Password
              </Typography>
              <TextField
                fullWidth
                size="small"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="At least 8 characters"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small">
                        {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
                {...register('password')}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      size="small"
                      sx={{ color: 'text.disabled', '&.Mui-checked': { color: 'primary.main' } }}
                    />
                  }
                  label={<Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>Remember me</Typography>}
                  sx={{ ml: -0.5 }}
                />
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: 'primary.main',
                    border: 0,
                    background: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => toast.message('Password reset is not available in the demo.')}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                disabled={isSubmitting}
                sx={{
                  py: 1.4,
                  borderRadius: 2.5,
                  fontWeight: 600,
                  fontSize: 15,
                  textTransform: 'none',
                  color: '#fff',
                  bgcolor: '#7C3AED',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#6D28D9', boxShadow: 'none' },
                }}
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </Box>

            <Typography align="center" sx={{ mt: 3, fontSize: 14, color: 'text.secondary' }}>
              New to Kanbot?{' '}
              <Link
                component={RouterLink}
                to="/register"
                underline="hover"
                sx={{ fontWeight: 600, color: 'primary.main' }}
              >
                Create an Account
              </Link>
            </Typography>

            {/* <Box
              sx={{
                mt: 3,
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: 'action.hover',
                border: 1,
                borderColor: 'divider',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.25 }}>Demo</Typography>
              <Typography sx={{ fontSize: 13, fontFamily: 'ui-monospace, monospace', color: 'text.primary' }}>
                demo@kanbot.dev / password123
              </Typography>
            </Box> */}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
