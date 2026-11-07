import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, LinearProgress, Chip, Avatar, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material'
import { AutoAwesome as AIIcon, CheckCircleOutline as CompleteIcon, Flag as FlagIcon } from '@mui/icons-material'
import { useState, useMemo } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners,
  type DragStartEvent, type DragEndEvent, useDroppable,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSprints, useBoard, useCompleteSprint } from '@/hooks/useSprints'
import { useProject } from '@/hooks/useProjects'
import { useMoveTodo } from '@/hooks/useTodos'
import { aiApi } from '@/api/ai'
import { toast } from 'sonner'
import type { Todo, TodoStatus } from '@/types/api'
import { TODO_STATUSES } from '@/types/api'
import PageLoader from '@/components/feedback/PageLoader'
import { ApiError } from '@/api/client'

const priorityColor: Record<string, string> = { high: '#F59E0B', medium: '#94A3B8', urgent: '#EF4444', low: '#64748B' }
const colColor: Record<TodoStatus, string> = { todo: '#94A3B8', in_progress: '#3B82F6', in_review: '#F59E0B', done: '#10B981' }
const colTitle: Record<TodoStatus, string> = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' }

function TaskCard({ todo, dragging }: { todo: Todo; dragging?: boolean }) {
  return (
    <Box
      sx={{
        p: 1.75,
        bgcolor: 'background.paper',
        borderRadius: 2.5,
        border: 1,
        borderColor: 'divider',
        opacity: dragging ? 0.9 : 1,
        boxShadow: dragging ? (theme) => theme.palette.mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.45)' : '0 8px 24px rgba(0,0,0,0.12)' : 'none',
        cursor: 'grab',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.3s ease',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 4px 16px rgba(0,0,0,0.35)' : '0 4px 12px rgba(0,0,0,0.06)',
        },
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{todo.key}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, mt: 0.5, lineHeight: 1.35 }}>{todo.title}</Typography>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
        {todo.labels.map((l) => (
          <Chip key={l} label={l} size="small" sx={{ height: 20, fontSize: 11 }} />
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FlagIcon sx={{ fontSize: 13, color: priorityColor[todo.priority] }} />
          <Typography variant="caption" sx={{ color: priorityColor[todo.priority], fontWeight: 600, textTransform: 'capitalize' }}>
            {todo.priority}
          </Typography>
        </Box>
        <Avatar sx={{ width: 22, height: 22, fontSize: 10, fontWeight: 600, bgcolor: 'action.hover', color: 'text.secondary' }}>
          {todo.storyPoints ?? '—'}
        </Avatar>
      </Box>
    </Box>
  )
}

function SortableCard({ todo }: { todo: Todo }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id, data: { todo } })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard todo={todo} />
    </div>
  )
}

function Column({ status, todos }: { status: TodoStatus; todos: Todo[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <Box
      ref={setNodeRef}
      sx={{
        minWidth: 240,
        maxWidth: 300,
        flex: 1,
        alignSelf: 'stretch',
        minHeight: '100%',
        bgcolor: isOver ? 'action.selected' : 'action.hover',
        borderRadius: 3,
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        border: 1,
        borderColor: isOver ? 'primary.light' : 'transparent',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 0.5 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colColor[status] }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>{colTitle[status]}</Typography>
        <Chip label={todos.length} size="small" sx={{ height: 20, fontSize: 11 }} />
      </Box>
      <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, minHeight: 120, overflowY: 'auto' }}>
          {todos.map((t) => (
            <SortableCard key={t.id} todo={t} />
          ))}
          {todos.length === 0 && (
            <Box sx={{ py: 2, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>Drop tasks here</Box>
          )}
        </Box>
      </SortableContext>
    </Box>
  )
}

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { data: project } = useProject(projectId)
  const { data: sprintData, isLoading: sLoading } = useSprints(projectId)
  const active = sprintData?.sprints.find((s) => s.status === 'active')
  const { data: board, isLoading: bLoading } = useBoard(active?.id)
  const completeSprint = useCompleteSprint(projectId!)
  const moveTodo = useMoveTodo(projectId!)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [moveTo, setMoveTo] = useState<'backlog' | string>('backlog')
  const [summarizing, setSummarizing] = useState(false)
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null)

  const planned = sprintData?.sprints.filter((s) => s.status === 'planned') ?? []
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const columns = useMemo(() => {
    const cols: Record<TodoStatus, Todo[]> = { todo: [], in_progress: [], in_review: [], done: [] }
    if (board?.columns) {
      for (const s of TODO_STATUSES) cols[s] = board.columns[s] || []
    }
    return cols
  }, [board])

  const findStatus = (id: string): TodoStatus | null => {
    for (const s of TODO_STATUSES) {
      if (columns[s].some((t) => t.id === id)) return s
      if (s === id) return s
    }
    return null
  }

  const onDragStart = (e: DragStartEvent) => {
    const todo = e.active.data.current?.todo as Todo | undefined
    if (todo) setActiveTodo(todo)
  }

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveTodo(null)
    const { active: a, over } = e
    if (!over || !active) return
    const todoId = String(a.id)
    const fromStatus = findStatus(todoId)
    let toStatus = findStatus(String(over.id))
    // if dropped on a card, use that card's column
    if (toStatus && TODO_STATUSES.includes(String(over.id) as TodoStatus) === false) {
      toStatus = findStatus(String(over.id))
    }
    // over.id might be a column id
    if (TODO_STATUSES.includes(String(over.id) as TodoStatus)) {
      toStatus = String(over.id) as TodoStatus
    }
    if (!fromStatus || !toStatus) return

    const targetList = [...columns[toStatus]]
    const overIndex = targetList.findIndex((t) => t.id === String(over.id))
    let position = overIndex >= 0 ? overIndex : targetList.length
    // If same column and moving down, adjust
    if (fromStatus === toStatus) {
      const fromIndex = columns[fromStatus].findIndex((t) => t.id === todoId)
      if (fromIndex === position || fromIndex + 1 === position) return
      if (fromIndex < position) position = Math.max(0, position - (overIndex >= 0 ? 0 : 0))
      // position after remove
      const without = columns[fromStatus].filter((t) => t.id !== todoId)
      const newOver = without.findIndex((t) => t.id === String(over.id))
      position = newOver >= 0 ? newOver : without.length
    } else {
      const withoutTarget = targetList.filter((t) => t.id !== todoId)
      const newOver = withoutTarget.findIndex((t) => t.id === String(over.id))
      position = newOver >= 0 ? newOver : withoutTarget.length
    }

    try {
      await moveTodo.mutateAsync({
        id: todoId,
        data: { status: toStatus, position },
      })
    } catch {
      // toast handled in hook
    }
  }

  const onSummarize = async () => {
    if (!active) return
    setSummarizing(true)
    try {
      await aiApi.summary(active.id)
      toast.success('Summary generated and saved')
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Failed to summarize')
    } finally {
      setSummarizing(false)
    }
  }

  if (sLoading || (active && bLoading)) return <PageLoader message="Loading board…" />

  if (!active) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>No active sprint</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Start a planned sprint from the backlog or create one in Sprint History.
        </Typography>
        <Button variant="contained" onClick={() => navigate(`/projects/${projectId}/backlog`)}>
          Go to Backlog
        </Button>
      </Box>
    )
  }

  const sprint = board?.sprint || active
  const progress = sprint.stats.totalTodos
    ? Math.round((sprint.stats.doneTodos / sprint.stats.totalTodos) * 100)
    : 0

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
            {project?.key || 'PROJECT'} / ACTIVE SPRINT
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>{sprint.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{sprint.goal || 'No goal set'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={summarizing ? <CircularProgress size={16} /> : <AIIcon />} onClick={onSummarize} disabled={summarizing} sx={{ borderColor: 'divider' }}>
            Summarize
          </Button>
          <Button variant="contained" startIcon={<CompleteIcon />} onClick={() => setCompleteOpen(true)}>
            Complete Sprint
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, px: 2.5, py: 1.75, mb: 3, borderRadius: 3, backgroundColor: 'background.paper', border: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 100 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{progress}%</Typography>
          <Typography variant="caption" color="text.secondary">Sprint progress</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 120 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, backgroundColor: 'action.hover', '& .MuiLinearProgress-bar': { backgroundColor: 'primary.main', borderRadius: 4 } }} />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{sprint.stats.donePoints} / {sprint.stats.totalPoints}</Typography>
          <Typography variant="caption" color="text.secondary">Story points</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{sprint.stats.doneTodos} / {sprint.stats.totalTodos}</Typography>
          <Typography variant="caption" color="text.secondary">Tasks complete</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{sprint.startDate || '—'} – {sprint.endDate || '—'}</Typography>
        </Box>
      </Box>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0, overflowX: 'auto', overflowY: 'hidden', pb: 1, alignItems: 'stretch' }}>
          {TODO_STATUSES.map((status) => (
            <Column key={status} status={status} todos={columns[status]} />
          ))}
        </Box>
        <DragOverlay>{activeTodo ? <TaskCard todo={activeTodo} dragging /> : null}</DragOverlay>
      </DndContext>

      <Dialog open={completeOpen} onClose={() => setCompleteOpen(false)}>
        <DialogTitle>Complete sprint</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Where should unfinished tasks go?</Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Move unfinished to</InputLabel>
            <Select label="Move unfinished to" value={moveTo} onChange={(e) => setMoveTo(e.target.value)}>
              <MenuItem value="backlog">Backlog</MenuItem>
              {planned.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await completeSprint.mutateAsync({ id: active.id, data: { moveUnfinishedTo: moveTo } })
              setCompleteOpen(false)
              navigate(`/projects/${projectId}/sprints`)
            }}
          >
            Complete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
