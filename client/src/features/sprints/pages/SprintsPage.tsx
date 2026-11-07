import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Chip, LinearProgress, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { Add as AddIcon, ChevronRight as ChevronIcon } from '@mui/icons-material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSprints, useCreateSprint, useStartSprint } from '@/hooks/useSprints'
import type { Sprint } from '@/types/api'
import PageLoader from '@/components/feedback/PageLoader'

const statusColor: Record<string, string> = { active: '#3B82F6', planned: '#F59E0B', completed: '#10B981' }

export default function SprintsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useSprints(projectId)
  const createSprint = useCreateSprint(projectId!)
  const startSprint = useStartSprint(projectId!)
  const [createOpen, setCreateOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: '', goal: '', startDate: '', endDate: '' } })

  const sprints = data?.sprints ?? []
  const completed = sprints.filter((s) => s.status === 'completed')
  const avgCompletion = completed.length
    ? Math.round(completed.reduce((s, sp) => s + (sp.completedStats ? (sp.completedStats.doneTodos / Math.max(sp.completedStats.totalTodos, 1)) * 100 : 0), 0) / completed.length)
    : 0
  const avgVelocity = completed.length
    ? Math.round(completed.reduce((s, sp) => s + (sp.completedStats?.donePoints || 0), 0) / completed.length)
    : 0
  const tasksDelivered = completed.reduce((s, sp) => s + (sp.completedStats?.doneTodos || 0), 0)

  const stats = [
    { label: 'Completed sprints', value: String(completed.length), hint: 'All time' },
    { label: 'Avg. completion', value: `${avgCompletion}%`, hint: 'Completed sprints' },
    { label: 'Avg. velocity', value: `${avgVelocity} pts`, hint: 'Per sprint' },
    { label: 'Tasks delivered', value: String(tasksDelivered), hint: 'Completed' },
  ]

  if (isLoading) return <PageLoader message="Loading sprints…" />

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Sprint History</Typography>
          <Typography variant="body2" color="text.secondary">Review performance and learn from every sprint.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { reset(); setCreateOpen(true) }}>New Sprint</Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        {stats.map((s) => (
          <Box key={s.label} sx={{ p: 2.5, backgroundColor: 'background.paper', borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>{s.value}</Typography>
            <Typography variant="caption" color="text.secondary">{s.hint}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {sprints.map((s: Sprint) => {
          const progress = s.status === 'completed' && s.completedStats
            ? Math.round((s.completedStats.doneTodos / Math.max(s.completedStats.totalTodos, 1)) * 100)
            : s.stats.totalTodos ? Math.round((s.stats.doneTodos / s.stats.totalTodos) * 100) : 0
          const tasks = s.status === 'completed' && s.completedStats
            ? `${s.completedStats.doneTodos} / ${s.completedStats.totalTodos}`
            : `${s.stats.doneTodos} / ${s.stats.totalTodos}`
          const points = s.status === 'completed' && s.completedStats
            ? `${s.completedStats.donePoints} / ${s.completedStats.totalPoints}`
            : `${s.stats.donePoints} / ${s.stats.totalPoints}`

          return (
            <Box key={s.id} sx={{
              display: 'flex', alignItems: 'center', gap: 2, p: 2.5, backgroundColor: 'background.paper', borderRadius: 3, border: 1, borderColor: 'divider',
              cursor: s.status === 'active' ? 'pointer' : 'default', flexWrap: 'wrap',
              '&:hover': { borderColor: 'primary.light' },
            }} onClick={() => s.status === 'active' && navigate(`/projects/${projectId}/board`)}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, backgroundColor: statusColor[s.status] + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColor[s.status], fontSize: 18 }}>
                {s.status === 'active' ? '⚡' : s.status === 'planned' ? '🕐' : '✓'}
              </Box>
              <Box sx={{ flex: 1, minWidth: 180 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{s.name}</Typography>
                  <Chip label={s.status} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 600, backgroundColor: statusColor[s.status] + '18', color: statusColor[s.status], textTransform: 'capitalize' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>{s.goal || 'No goal'}</Typography>
                <Typography variant="caption" color="text.secondary">{s.startDate || '—'} – {s.endDate || '—'}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 70 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{tasks}</Typography>
                <Typography variant="caption" color="text.secondary">Tasks</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 70 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{points}</Typography>
                <Typography variant="caption" color="text.secondary">Story points</Typography>
              </Box>
              <Box sx={{ width: 100 }}>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, backgroundColor: 'action.hover', '& .MuiLinearProgress-bar': { backgroundColor: 'primary.main', borderRadius: 3 } }} />
                <Typography variant="caption" sx={{ fontWeight: 600, mt: 0.25, display: 'block', textAlign: 'right' }}>{progress}%</Typography>
              </Box>
              {s.status === 'planned' && (
                <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); startSprint.mutate({ id: s.id }) }}>Start</Button>
              )}
              {s.status === 'active' && <ChevronIcon sx={{ color: 'text.secondary' }} />}
            </Box>
          )
        })}
        {sprints.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No sprints yet. Create your first planned sprint.</Box>
        )}
      </Box>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New sprint</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(async (data) => {
          await createSprint.mutateAsync({
            name: data.name || undefined,
            goal: data.goal || undefined,
            startDate: data.startDate || null,
            endDate: data.endDate || null,
          })
          setCreateOpen(false)
        })}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Name" fullWidth placeholder="Auto: Sprint N" {...register('name')} />
            <TextField label="Goal" fullWidth multiline rows={2} {...register('goal')} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Start date" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('startDate')} />
              <TextField label="End date" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('endDate')} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}
