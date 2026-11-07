import { useEffect, useRef, useState } from 'react'
import {
  Box, Drawer, Typography, IconButton, TextField, Button, Tabs, Tab, Chip,
  CircularProgress, Checkbox, FormControlLabel, Divider,
} from '@mui/material'
import { Close as CloseIcon, Send as SendIcon, AutoAwesome as AIIcon } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import { aiApi } from '@/api/ai'
import { todosApi } from '@/api/todos'
import { sprintsApi } from '@/api/sprints'
import { useQueryClient } from '@tanstack/react-query'
import type { ChatMessage, DraftTodo } from '@/types/api'
import { ApiError } from '@/api/client'

interface Props {
  open: boolean
  onClose: () => void
  projectId: string
}

export default function AiDrawer({ open, onClose, projectId }: Props) {
  const qc = useQueryClient()
  const [tab, setTab] = useState(0)
  const [mode, setMode] = useState<'mock' | 'ai'>('mock')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Generate todos
  const [genPrompt, setGenPrompt] = useState('')
  const [genCount, setGenCount] = useState(5)
  const [drafts, setDrafts] = useState<(DraftTodo & { selected: boolean })[]>([])
  const [genLoading, setGenLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Plan sprint
  const [capacity, setCapacity] = useState(20)
  const [focus, setFocus] = useState('')
  const [planResult, setPlanResult] = useState<{
    goal: string
    todoIds: string[]
    totalPoints: number
    reasoning: string
  } | null>(null)
  const [planLoading, setPlanLoading] = useState(false)
  const [creatingSprint, setCreatingSprint] = useState(false)

  useEffect(() => {
    if (open) {
      aiApi.status().then((s) => setMode(s.mode)).catch(() => {})
    }
  }, [open])

  useEffect(() => {
    setMessages([])
    setDrafts([])
    setPlanResult(null)
  }, [projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatLoading])

  const sendChat = async () => {
    const text = input.trim()
    if (!text || chatLoading) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setChatLoading(true)
    try {
      const res = await aiApi.chat(projectId, { messages: next })
      setMessages([...next, { role: 'assistant', content: res.message.content }])
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'AI chat failed')
      setMessages(next)
    } finally {
      setChatLoading(false)
    }
  }

  const generate = async () => {
    if (genPrompt.trim().length < 3) {
      toast.error('Prompt must be at least 3 characters')
      return
    }
    setGenLoading(true)
    setDrafts([])
    try {
      const res = await aiApi.generateTodos(projectId, { prompt: genPrompt, count: genCount })
      setDrafts(res.todos.map((t) => ({ ...t, selected: true })))
      toast.success(`Generated ${res.todos.length} tasks (${res.source})`)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Generation failed')
    } finally {
      setGenLoading(false)
    }
  }

  const saveSelected = async () => {
    const selected = drafts.filter((d) => d.selected)
    if (!selected.length) {
      toast.error('Select at least one task')
      return
    }
    setSaving(true)
    try {
      await todosApi.bulkCreate(projectId, {
        todos: selected.map(({ title, description, type, priority, storyPoints }) => ({
          title,
          description,
          type,
          priority,
          storyPoints,
        })),
      })
      qc.invalidateQueries({ queryKey: ['todos', projectId] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success(`Saved ${selected.length} tasks to backlog`)
      setDrafts([])
      setGenPrompt('')
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const plan = async () => {
    setPlanLoading(true)
    setPlanResult(null)
    try {
      const res = await aiApi.planSprint(projectId, { capacity, focus: focus || undefined })
      setPlanResult(res)
      toast.success(`Plan ready (${res.source})`)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Planning failed')
    } finally {
      setPlanLoading(false)
    }
  }

  const createFromPlan = async () => {
    if (!planResult) return
    setCreatingSprint(true)
    try {
      await sprintsApi.create(projectId, {
        goal: planResult.goal,
        todoIds: planResult.todoIds,
      })
      qc.invalidateQueries({ queryKey: ['sprints', projectId] })
      qc.invalidateQueries({ queryKey: ['todos', projectId] })
      toast.success('Sprint created from AI plan')
      setPlanResult(null)
      onClose()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not create sprint')
    } finally {
      setCreatingSprint(false)
    }
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <AIIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
            AI Assistant
          </Typography>
          <Chip
            size="small"
            label={mode === 'ai' ? 'Live AI' : 'Mock AI'}
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 600,
              bgcolor: mode === 'ai' ? '#D1FAE5' : '#FEF3C7',
              color: mode === 'ai' ? '#065F46' : '#92400E',
            }}
          />
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Chat" />
          <Tab label="Generate" />
          <Tab label="Plan sprint" />
        </Tabs>

        {/* Chat */}
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {messages.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                  Ask about your backlog, sprint priorities, or task breakdowns.
                </Typography>
              )}
              {messages.map((m, i) => (
                <Box
                  key={i}
                  sx={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: m.role === 'user' ? 'primary.main' : 'action.hover',
                    color: m.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    fontSize: 14,
                    '& p': { m: 0 },
                  }}
                >
                  {m.role === 'assistant' ? <ReactMarkdown>{m.content}</ReactMarkdown> : m.content}
                </Box>
              ))}
              {chatLoading && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: 'text.secondary' }}>
                  <CircularProgress size={16} /> Thinking…
                </Box>
              )}
              <div ref={bottomRef} />
            </Box>
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendChat())}
              />
              <IconButton color="primary" onClick={sendChat} disabled={chatLoading || !input.trim()}>
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* Generate */}
        {tab === 1 && (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto', flex: 1 }}>
            <TextField
              label="What do you want to build?"
              multiline
              rows={3}
              fullWidth
              value={genPrompt}
              onChange={(e) => setGenPrompt(e.target.value)}
              placeholder="e.g. User profile page with avatar upload"
            />
            <TextField
              label="Number of tasks"
              type="number"
              size="small"
              value={genCount}
              onChange={(e) => setGenCount(Math.min(10, Math.max(1, Number(e.target.value) || 5)))}
              inputProps={{ min: 1, max: 10 }}
              sx={{ width: 140 }}
            />
            <Button variant="contained" onClick={generate} disabled={genLoading} startIcon={genLoading ? <CircularProgress size={16} color="inherit" /> : <AIIcon />}>
              {genLoading ? 'Generating…' : 'Generate tasks'}
            </Button>

            {drafts.length > 0 && (
              <>
                <Divider />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Review & save ({drafts.filter((d) => d.selected).length} selected)
                </Typography>
                {drafts.map((d, i) => (
                  <Box key={i} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={d.selected}
                          onChange={(e) => {
                            const next = [...drafts]
                            next[i] = { ...d, selected: e.target.checked }
                            setDrafts(next)
                          }}
                        />
                      }
                      label={<Typography variant="body2" sx={{ fontWeight: 600 }}>{d.title}</Typography>}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ pl: 4 }}>
                      {d.type} · {d.priority} · {d.storyPoints ?? '—'} pts
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 4, mt: 0.5 }}>
                      {d.description}
                    </Typography>
                  </Box>
                ))}
                <Button variant="contained" onClick={saveSelected} disabled={saving}>
                  {saving ? 'Saving…' : 'Save selected to backlog'}
                </Button>
              </>
            )}
          </Box>
        )}

        {/* Plan sprint */}
        {tab === 2 && (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto', flex: 1 }}>
            <TextField
              label="Capacity (story points)"
              type="number"
              size="small"
              value={capacity}
              onChange={(e) => setCapacity(Math.min(200, Math.max(1, Number(e.target.value) || 20)))}
              inputProps={{ min: 1, max: 200 }}
            />
            <TextField
              label="Focus (optional)"
              fullWidth
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g. Auth and onboarding"
            />
            <Button variant="contained" onClick={plan} disabled={planLoading} startIcon={planLoading ? <CircularProgress size={16} color="inherit" /> : <AIIcon />}>
              {planLoading ? 'Planning…' : 'Plan sprint'}
            </Button>

            {planResult && (
              <>
                <Divider />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Suggested goal
                </Typography>
                <Typography variant="body2">{planResult.goal}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {planResult.todoIds.length} tasks · {planResult.totalPoints} points
                </Typography>
                <Typography variant="body2" sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 2 }}>
                  {planResult.reasoning}
                </Typography>
                <Button variant="contained" onClick={createFromPlan} disabled={creatingSprint || planResult.todoIds.length === 0}>
                  {creatingSprint ? 'Creating…' : 'Create sprint from plan'}
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>
    </Drawer>
  )
}
