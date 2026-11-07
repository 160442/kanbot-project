import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, Card, LinearProgress, Avatar, IconButton, InputBase, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material'
import {
  Add as AddIcon, Search as SearchIcon, DeleteOutline as DeleteIcon, EditOutlined as EditIcon,
  FolderOutlined, CheckCircleOutline, Inventory2Outlined, RocketLaunchOutlined,
  MoreHoriz as MoreIcon, AssignmentOutlined, BoltOutlined,
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProjects, useCreateProject, useDeleteProject, useUpdateProject } from '@/hooks/useProjects'
import { useAuthStore } from '@/stores/authStore'
import { getInitials } from '@/lib/utils'
import type { ProjectWithStats } from '@/types/api'
import PageLoader from '@/components/feedback/PageLoader'

const projectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  key: z.string().trim().max(6).optional(),
  description: z.string().max(500).optional(),
})
type ProjectForm = z.infer<typeof projectSchema>

const avatarColors = ['#EDE9FE', '#DBEAFE', '#D1FAE5', '#FEF3C7', '#FCE7F3']
const avatarText = ['#7C3AED', '#3B82F6', '#059669', '#D97706', '#DB2777']

export default function ProjectsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: projectsData, isLoading, error } = useProjects()
  const projects = Array.isArray(projectsData) ? projectsData : []
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ProjectWithStats | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ProjectWithStats | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
  })

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase()),
  )

  const totalTasks = projects.reduce((s, p) => s + (p.stats?.totalTodos ?? 0), 0)
  const totalBacklog = projects.reduce((s, p) => s + (p.stats?.backlogCount ?? 0), 0)
  const activeSprints = projects.filter((p) => p.stats?.activeSprint).length
  const pointsInFlight = projects.reduce((s, p) => s + (p.stats?.activeSprint?.stats?.totalPoints ?? 0), 0)

  const stats = [
    { label: 'Total projects', value: projects.length, hint: '+1 this month', icon: <FolderOutlined sx={{ fontSize: 20 }} />, bg: '#EDE9FE', fg: '#7C3AED' },
    { label: 'Total tasks', value: totalTasks, hint: 'Across all projects', icon: <CheckCircleOutline sx={{ fontSize: 20 }} />, bg: '#DBEAFE', fg: '#3B82F6' },
    { label: 'Backlog tasks', value: totalBacklog, hint: 'Ready to prioritize', icon: <Inventory2Outlined sx={{ fontSize: 20 }} />, bg: '#FFEDD5', fg: '#EA580C' },
    { label: 'Active sprints', value: activeSprints, hint: pointsInFlight ? `${pointsInFlight} points in flight` : 'None in flight', icon: <RocketLaunchOutlined sx={{ fontSize: 20 }} />, bg: '#D1FAE5', fg: '#059669' },
  ]

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', key: '', description: '' })
    setDialogOpen(true)
  }
  const openEdit = (p: ProjectWithStats, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditing(p)
    reset({ name: p.name, key: p.key, description: p.description })
    setDialogOpen(true)
  }

  const onSubmit = async (data: ProjectForm) => {
    if (editing) {
      await updateProject.mutateAsync({ id: editing.id, data })
    } else {
      const created = await createProject.mutateAsync(data)
      navigate(`/projects/${created.id}/backlog`)
    }
    setDialogOpen(false)
  }

  if (isLoading) return <PageLoader message="Loading projects…" />
  if (error) {
    return <Typography color="error">Failed to load projects. Is the backend running?</Typography>
  }

  return (
    <Box>
      {/* Header — Figma */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: 26, sm: 32 },
              letterSpacing: -0.6,
              color: 'text.primary',
              lineHeight: 1.2,
            }}
          >
            My Projects
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 0.5, fontSize: 14 }}>
            Manage your work, one sprint at a time.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{
            borderRadius: 2.5,
            px: 2.25,
            py: 1.1,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
          }}
        >
          Create Project
        </Button>
      </Box>

      {/* Stat cards — Figma row of 4 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr 1fr',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3.5,
        }}
      >
        {stats.map((s) => (
          <Box
            key={s.label}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              gap: 1.75,
              alignItems: 'flex-start',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: s.bg,
                color: s.fg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {s.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 26, letterSpacing: -0.5, lineHeight: 1.2 }}>
                {s.value}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }} noWrap>
                {s.hint}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Section header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 16 }}>Your projects</Typography>
          <Chip
            label={`${filtered.length} project${filtered.length === 1 ? '' : 's'}`}
            size="small"
            sx={{
              height: 22,
              fontSize: 12,
              fontWeight: 600,
              bgcolor: 'action.hover',
              color: 'text.secondary',
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.85,
            borderRadius: 2.5,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            minWidth: { xs: '100%', sm: 220 },
          }}
        >
          <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <InputBase
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ fontSize: 14, flex: 1 }}
          />
        </Box>
      </Box>

      {/* Project cards grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 2,
        }}
      >
        {filtered.map((p, idx) => {
          const colorIdx = idx % avatarColors.length
          const progress = p.stats?.totalTodos
            ? Math.round(((p.stats.doneTodos ?? 0) / p.stats.totalTodos) * 100)
            : 0
          return (
            <Card
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}/backlog`)}
              sx={{
                p: 2.25,
                borderRadius: 3,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                bgcolor: 'background.paper',
                transition: 'box-shadow 0.15s, border-color 0.15s',
                '&:hover': {
                  borderColor: 'primary.light',
                  boxShadow: '0 8px 24px rgba(124,58,237,0.08)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    bgcolor: avatarColors[colorIdx],
                    color: avatarText[colorIdx],
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {p.key?.[0] || p.name[0]}
                </Avatar>
                <IconButton size="small" sx={{ color: 'text.disabled' }} onClick={(e) => e.stopPropagation()}>
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 16 }} noWrap>
                  {p.name}
                </Typography>
                <Chip
                  label={p.key}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                  }}
                />
              </Box>

              <Typography
                sx={{
                  fontSize: 13,
                  color: 'text.secondary',
                  mb: 2,
                  minHeight: 40,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {p.description || 'No description'}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 1.25, color: 'text.secondary', fontSize: 12 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AssignmentOutlined sx={{ fontSize: 14 }} />
                  {p.stats?.totalTodos ?? 0} tasks
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BoltOutlined sx={{ fontSize: 14 }} />
                  {p.stats?.activeSprint?.name || 'No active sprint'}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', flex: 1 }}>
                  Overall progress
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{progress}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'action.hover',
                  mb: 2,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    bgcolor: 'primary.main',
                  },
                }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: 'primary.dark' }}>
                  {user ? getInitials(user.name) : '?'}
                </Avatar>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmDelete(p)
                    }}
                    sx={{ color: 'text.secondary', textTransform: 'none', fontSize: 13 }}
                  >
                    Delete
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                    onClick={(e) => openEdit(p, e)}
                    sx={{ color: 'text.secondary', textTransform: 'none', fontSize: 13 }}
                  >
                    Edit
                  </Button>
                </Box>
              </Box>
            </Card>
          )
        })}

        {/* Create new project dashed card — Figma */}
        <Box
          onClick={openCreate}
          sx={{
            minHeight: 220,
            borderRadius: 3,
            border: '1.5px dashed',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            cursor: 'pointer',
            bgcolor: 'transparent',
            transition: 'border-color 0.15s, background 0.15s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
            }}
          >
            <AddIcon />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.primary' }}>
            Create a new project
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            Start with a clean backlog
          </Typography>
        </Box>
      </Box>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editing ? 'Edit project' : 'Create project'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name')}
            />
            <TextField
              label="Key (optional)"
              fullWidth
              placeholder="Auto-generated if empty"
              error={!!errors.key}
              helperText={errors.key?.message}
              {...register('key')}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              {...register('description')}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ textTransform: 'none' }}>
              {editing ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete project?</DialogTitle>
        <DialogContent>
          <Typography>
            Delete <strong>{confirmDelete?.name}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(null)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            sx={{ textTransform: 'none' }}
            onClick={async () => {
              if (confirmDelete) {
                await deleteProject.mutateAsync(confirmDelete.id)
                setConfirmDelete(null)
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
