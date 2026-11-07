import { useState } from 'react'
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography,
  Avatar, IconButton, Button, Badge, Divider, Tooltip, Menu, MenuItem,
  useTheme, useMediaQuery,
} from '@mui/material'
import {
  DashboardOutlined as ProjectsIcon,
  ViewListOutlined as BacklogIcon,
  ViewKanbanOutlined as BoardIcon,
  HistoryOutlined as HistoryIcon,
  AutoAwesome as AIIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  PersonOutline as PersonIcon,
} from '@mui/icons-material'
import { SIDEBAR_WIDTH } from '@/lib/constants'
import { sidebarDark, sidebarLight } from '@/theme/theme'
import { useAuthStore } from '@/stores/authStore'
import { useProjects } from '@/hooks/useProjects'
import { useUiStore } from '@/stores/uiStore'
import { useQueryClient } from '@tanstack/react-query'
import { getInitials } from '@/lib/utils'
import AiDrawer from '@/features/ai/components/AiDrawer'
import ThemeToggle from '@/components/theme/ThemeToggle'
import KanbotLogo from '@/components/brand/KanbotLogo'

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const theme = useTheme()
  const sb = theme.palette.mode === 'dark' ? sidebarDark : sidebarLight
  const location = useLocation()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const qc = useQueryClient()
  const { data: projects } = useProjects()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const projectList = Array.isArray(projects) ? projects : []
  const current = projectList.find((p) => p.id === projectId) || projectList[0]
  const pid = current?.id

  const navItems = [
    {
      label: 'Projects',
      path: '/projects',
      icon: <ProjectsIcon fontSize="small" />,
      match: (p: string) => p === '/projects',
    },
    {
      label: 'Backlog',
      path: pid ? `/projects/${pid}/backlog` : '/projects',
      icon: <BacklogIcon fontSize="small" />,
      badge: current?.stats?.backlogCount,
      match: (p: string) => p.includes('/backlog'),
    },
    {
      label: 'Active Board',
      path: pid ? `/projects/${pid}/board` : '/projects',
      icon: <BoardIcon fontSize="small" />,
      match: (p: string) => p.includes('/board'),
    },
    {
      label: 'Sprint History',
      path: pid ? `/projects/${pid}/sprints` : '/projects',
      icon: <HistoryIcon fontSize="small" />,
      match: (p: string) => p.includes('/sprints'),
    },
  ]

  const go = (path: string) => {
    navigate(path)
    onNavigate?.()
  }

  const logout = () => {
    clearAuth()
    qc.clear()
    navigate('/login', { replace: true })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: sb.bg,
        color: sb.text,
        borderRight: 1,
        borderColor: sb.border,
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center' }}>
        <KanbotLogo height={40} />
      </Box>

      <Box sx={{ px: 2, mb: 2 }}>
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.25,
            borderRadius: 2.5,
            bgcolor: sb.card,
            cursor: 'pointer',
            border: 1,
            borderColor: sb.border,
            '&:hover': { bgcolor: sb.hover },
          }}
        >
          <Avatar sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 700, bgcolor: 'primary.main' }}>
            {current?.key?.[0] || 'P'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: sb.muted, display: 'block', lineHeight: 1.2 }}>
              Current project
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: sb.text }} noWrap>
              {current?.name || 'Select project'}
            </Typography>
          </Box>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { minWidth: 220, mt: 1 } }}
        >
          {projectList.map((p) => (
            <MenuItem
              key={p.id}
              selected={p.id === current?.id}
              onClick={() => {
                setAnchorEl(null)
                navigate(`/projects/${p.id}/backlog`)
                onNavigate?.()
              }}
            >
              <Avatar sx={{ width: 24, height: 24, fontSize: 11, mr: 1.5, bgcolor: 'primary.main' }}>
                {p.key[0]}
              </Avatar>
              {p.name}
            </MenuItem>
          ))}
          {projectList.length === 0 && (
            <MenuItem disabled>No projects yet</MenuItem>
          )}
        </Menu>
      </Box>

      <Typography
        variant="caption"
        sx={{ px: 3, mb: 1, color: sb.dim, fontWeight: 600, letterSpacing: 0.8 }}
      >
        WORKSPACE
      </Typography>

      <List sx={{ px: 1.5, flex: 1 }}>
        {navItems.map((item) => {
          const active = item.match(location.pathname)
          return (
            <ListItemButton
              key={item.label}
              onClick={() => go(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: active ? sb.activeText : sb.muted,
                backgroundColor: active ? sb.activeBg : 'transparent',
                '&:hover': { backgroundColor: active ? sb.activeBg : sb.hover },
                '& .MuiListItemIcon-root': { color: active ? sb.activeText : 'inherit' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
              />
              {item.badge != null && item.badge > 0 && (
                <Badge
                  badgeContent={item.badge}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: sb.activeBg,
                      color: sb.activeText,
                      fontSize: 11,
                      fontWeight: 600,
                    },
                  }}
                />
              )}
            </ListItemButton>
          )
        })}
      </List>

      <Divider sx={{ borderColor: sb.border, mx: 2 }} />

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: 'primary.dark' }}>
          {user ? getInitials(user.name) : '?'}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: sb.text, lineHeight: 1.2 }} noWrap>
            {user?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: sb.dim }} noWrap>
            {user?.email}
          </Typography>
        </Box>
        <Tooltip title="Logout">
          <IconButton size="small" sx={{ color: sb.dim }} onClick={logout}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default function AppShell() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileEl, setProfileEl] = useState<null | HTMLElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const { data: projects } = useProjects()
  const aiDrawerOpen = useUiStore((s) => s.aiDrawerOpen)
  const setAiDrawerOpen = useUiStore((s) => s.setAiDrawerOpen)
  const qc = useQueryClient()

  const projectList = Array.isArray(projects) ? projects : []
  const current = projectList.find((p) => p.id === projectId) || projectList[0]
  const pid = current?.id
  const sbBg = theme.palette.mode === 'dark' ? sidebarDark.bg : sidebarLight.bg

  const pageLabel = location.pathname.includes('/backlog')
    ? 'Backlog'
    : location.pathname.includes('/board')
      ? 'Active Board'
      : location.pathname.includes('/sprints')
        ? 'Sprint History'
        : 'Projects'

  const logout = () => {
    clearAuth()
    qc.clear()
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              borderRight: 'none',
              bgcolor: sbBg,
            },
          }}
        >
          <SidebarContent />
        </Drawer>
      )}

      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              borderRight: 'none',
              bgcolor: sbBg,
            },
          }}
        >
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Box
          sx={{
            height: 60,
            display: 'flex',
            alignItems: 'center',
            px: { xs: 1.5, sm: 2, md: 2.5 },
            gap: { xs: 0.75, sm: 1.25 },
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: (th) =>
              th.palette.mode === 'dark' ? 'rgba(22, 21, 31, 0.72)' : 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(14px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(14px) saturate(1.2)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)} size="small" sx={{ color: 'text.secondary' }}>
              <MenuIcon />
            </IconButton>
          )}

          <Box
            onClick={() => navigate('/projects')}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mr: 1 }}
          >
            <KanbotLogo height={36} />
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ display: { xs: 'none', md: 'block' }, maxWidth: 240 }}
          >
            {current?.name || 'Workspace'}
            <Box component="span" sx={{ mx: 0.75, opacity: 0.45 }}>
              /
            </Box>
            <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
              {pageLabel}
            </Box>
          </Typography>

          <Typography
            variant="subtitle2"
            sx={{ display: { xs: 'block', md: 'none' }, fontWeight: 600, flex: 1 }}
            noWrap
          >
            {pageLabel}
          </Typography>

          <Box sx={{ flex: 1 }} />

          <ThemeToggle />

          <Button
            onClick={() => setAiDrawerOpen(true)}
            startIcon={<AIIcon sx={{ fontSize: '16px !important' }} />}
            sx={{
              height: 36,
              minWidth: { xs: 36, sm: 'auto' },
              px: { xs: 1, sm: 1.75 },
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 13,
              textTransform: 'none',
              boxShadow: 'none',
              bgcolor: 'action.selected',
              color: 'primary.main',
              '&:hover': { bgcolor: 'action.hover', boxShadow: 'none' },
              '& .MuiButton-startIcon': {
                marginRight: { xs: 0, sm: 0.75 },
                marginLeft: 0,
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Ask AI
            </Box>
          </Button>

          <Tooltip title="Account">
            <Avatar
              onClick={(e) => setProfileEl(e.currentTarget)}
              sx={{
                width: 32,
                height: 32,
                fontSize: 12,
                bgcolor: 'primary.dark',
                display: { xs: 'none', sm: 'flex' },
                cursor: 'pointer',
                '&:hover': { outline: '2px solid', outlineColor: 'primary.light' },
              }}
            >
              {user ? getInitials(user.name) : '?'}
            </Avatar>
          </Tooltip>
          <Menu
            anchorEl={profileEl}
            open={!!profileEl}
            onClose={() => setProfileEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { minWidth: 220, mt: 1 } }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{user?.email}</Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                setProfileEl(null)
                navigate('/projects')
              }}
            >
              <PersonIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
              My projects
            </MenuItem>
            <MenuItem
              onClick={() => {
                setProfileEl(null)
                logout()
              }}
              sx={{ color: 'error.main' }}
            >
              <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
              Log out
            </MenuItem>
          </Menu>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            p: { xs: 1.5, sm: 2, md: 3 },
            bgcolor: 'background.default',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>

      {pid && <AiDrawer open={aiDrawerOpen} onClose={() => setAiDrawerOpen(false)} projectId={pid} />}
    </Box>
  )
}
