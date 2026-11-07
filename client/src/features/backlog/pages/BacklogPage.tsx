import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box, Typography, Button, Chip, InputBase, IconButton, Avatar, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material'
import { Add as AddIcon, AutoAwesome as AIIcon, Search as SearchIcon, FilterList as FilterIcon, DragIndicator as DragIcon, Flag as FlagIcon } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTodos, useCreateTodo, useDeleteTodo, useUpdateTodo } from '@/hooks/useTodos'
import { useSprints, useStartSprint } from '@/hooks/useSprints'
import { useProject } from '@/hooks/useProjects'
import { useUiStore } from '@/stores/uiStore'
import type { Todo, TodoPriority, TodoType } from '@/types/api'
import { TODO_PRIORITIES, TODO_TYPES, STORY_POINTS } from '@/types/api'
import PageLoader from '@/components/feedback/PageLoader'

const priorityColor: Record<string, string> = { high: '#F59E0B', medium: '#64748B', urgent: '#EF4444', low: '#94A3B8' }
const typeLabel: Record<string, string> = { story: '📖', task: '✓', bug: '🐞' }

const todoSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional(),
  type: z.enum(['task', 'story', 'bug']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  storyPoints: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(5), z.literal(8), z.literal(13), z.null()]).optional(),
})
type TodoForm = z.infer<typeof todoSchema>

export default function BacklogPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | ''>('')
  const [typeFilter, setTypeFilter] = useState<TodoType | ''>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Todo | null>(null)

  const { data: project } = useProject(projectId)
  const query = useMemo(() => ({
    sprintId: 'backlog' as const,
    search: search || undefined,
    priority: priorityFilter || undefined,
    type: typeFilter || undefined,
  }), [search, priorityFilter, typeFilter])

  const { data: todoData, isLoading } = useTodos(projectId, query)
  const { data: sprintData } = useSprints(projectId)
  const createTodo = useCreateTodo(projectId!)
  const updateTodo = useUpdateTodo(projectId!)
  const deleteTodo = useDeleteTodo(projectId!)
  const startSprint = useStartSprint(projectId!)
  const setAiDrawerOpen = useUiStore((s) => s.setAiDrawerOpen)

  const planned = sprintData?.sprints.filter((s) => s.status === 'planned') ?? []
  const todos = todoData?.todos ?? []
  const totalPoints = todos.reduce((s, t) => s + (t.storyPoints || 0), 0)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<TodoForm>({
    resolver: zodResolver(todoSchema),
    defaultValues: { type: 'task', priority: 'medium', storyPoints: null },
  })

  const openCreate = () => { setEditing(null); reset({ title: '', description: '', type: 'task', priority: 'medium', storyPoints: null }); setDialogOpen(true) }
  const openEdit = (t: Todo) => {
    setEditing(t)
    reset({ title: t.title, description: t.description, type: t.type, priority: t.priority, storyPoints: t.storyPoints })
    setDialogOpen(true)
  }

  const onSubmit = async (data: TodoForm) => {
    if (editing) await updateTodo.mutateAsync({ id: editing.id, data })
    else await createTodo.mutateAsync(data)
    setDialogOpen(false)
  }

  if (!projectId) return null
  if (isLoading) return <PageLoader message="Loading backlog…" />

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
            {project?.key || 'PROJECT'} / BACKLOG
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>Backlog</Typography>
          <Typography variant="body2" color="text.secondary">Prioritize your work and shape upcoming sprints.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<AIIcon />} sx={{ borderColor: 'divider' }} onClick={() => setAiDrawerOpen(true)}>Generate with AI</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Create Todo</Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, px: 2.5, py: 1.5, mb: 2.5, borderRadius: 3, backgroundColor: 'background.paper', border: 1, borderColor: 'divider', fontSize: 13, color: 'text.secondary' }}>
        <Typography component="span" variant="body2" color="text.secondary"><Box component="strong" sx={{ color: 'text.primary' }}>{todos.length}</Box> total tasks</Typography>
        <Typography component="span" variant="body2" color="text.secondary"><Box component="strong" sx={{ color: 'text.primary' }}>{totalPoints}</Box> story points</Typography>
        <Typography component="span" variant="body2" color="text.secondary"><Box component="strong" sx={{ color: 'text.primary' }}>{planned.length}</Box> planned sprints</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, borderRadius: 2, backgroundColor: 'background.paper', border: 1, borderColor: 'divider' }}>
          <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <InputBase placeholder="Search by key, title, description, or label..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ fontSize: 14, flex: 1 }} />
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select label="Priority" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TodoPriority | '')}>
            <MenuItem value="">All</MenuItem>
            {TODO_PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TodoType | '')}>
            <MenuItem value="">All</MenuItem>
            {TODO_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
        {(priorityFilter || typeFilter || search) && (
          <Button size="small" onClick={() => { setPriorityFilter(''); setTypeFilter(''); setSearch('') }}>Clear filters</Button>
        )}
      </Box>

      {planned.map((sp) => (
        <Box key={sp.id} sx={{ backgroundColor: 'background.paper', borderRadius: 3, border: 1, borderColor: 'divider', mb: 2, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.5, borderBottom: 1, borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {sp.name} · {sp.startDate || '—'} – {sp.endDate || '—'} · {sp.stats.totalTodos} tasks · {sp.stats.totalPoints} pts
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" onClick={() => startSprint.mutate({ id: sp.id })} disabled={startSprint.isPending}>
                Start Sprint
              </Button>
            </Box>
          </Box>
        </Box>
      ))}

      <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">{todos.length} tasks · {totalPoints} pts</Typography>
        </Box>
        {todos.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography>No backlog items. Create your first todo.</Typography>
          </Box>
        )}
        {todos.map((t) => (
          <Box key={t.id} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, borderBottom: '1px solid #F8FAFC',
            '&:hover': { backgroundColor: 'action.hover' },
          }}>
            <DragIcon sx={{ fontSize: 16, color: '#CBD5E1' }} />
            <Typography sx={{ fontSize: 14 }}>{typeLabel[t.type]}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 64 }}>{t.key}</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }} onClick={() => openEdit(t)} style={{ cursor: 'pointer' }}>{t.title}</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {t.labels.map((l) => <Chip key={l} label={l} size="small" sx={{ height: 22, fontSize: 11 }} />)}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 70 }}>
              <FlagIcon sx={{ fontSize: 14, color: priorityColor[t.priority] }} />
              <Typography variant="caption" sx={{ color: priorityColor[t.priority], fontWeight: 600, textTransform: 'capitalize' }}>{t.priority}</Typography>
            </Box>
            <Avatar sx={{ width: 24, height: 24, fontSize: 11, fontWeight: 600, bgcolor: '#F1F5F9', color: '#475569' }}>{t.storyPoints ?? '—'}</Avatar>
            <IconButton size="small" onClick={() => openEdit(t)}>⋯</IconButton>
            <IconButton size="small" color="error" onClick={() => deleteTodo.mutate(t.id)}><span style={{ fontSize: 12 }}>✕</span></IconButton>
          </Box>
        ))}
        <Box onClick={openCreate} sx={{
          px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: '#7C3AED', cursor: 'pointer',
          '&:hover': { backgroundColor: '#F5F3FF' },
        }}>
          <AddIcon fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>Create todo</Typography>
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? `Edit ${editing.key}` : 'Create todo'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" fullWidth error={!!errors.title} helperText={errors.title?.message} {...register('title')} />
            <TextField label="Description" fullWidth multiline rows={3} {...register('description')} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select label="Type" value={watch('type') || 'task'} onChange={(e) => setValue('type', e.target.value as TodoType)}>
                  {TODO_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select label="Priority" value={watch('priority') || 'medium'} onChange={(e) => setValue('priority', e.target.value as TodoPriority)}>
                  {TODO_PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Points</InputLabel>
                <Select label="Points" value={watch('storyPoints') ?? ''} onChange={(e) => setValue('storyPoints', e.target.value === '' ? null : Number(e.target.value) as typeof STORY_POINTS[number])}>
                  <MenuItem value="">None</MenuItem>
                  {STORY_POINTS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>{editing ? 'Save' : 'Create'}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}
