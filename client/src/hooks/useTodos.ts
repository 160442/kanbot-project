import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { todosApi } from '@/api/todos'
import type { CreateTodoRequest, MoveTodoRequest, TodoListQuery, UpdateTodoRequest } from '@/types/api'
import { toast } from 'sonner'
import { ApiError } from '@/api/client'

export function useTodos(projectId: string | undefined, query?: TodoListQuery) {
  return useQuery({
    queryKey: ['todos', projectId, query],
    queryFn: () => todosApi.list(projectId!, query),
    enabled: !!projectId,
  })
}

export function useCreateTodo(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTodoRequest) => todosApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos', projectId] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success('Todo created')
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Failed to create todo'),
  })
}

export function useUpdateTodo(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) => todosApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos', projectId] })
      qc.invalidateQueries({ queryKey: ['board'] })
      toast.success('Todo updated')
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Failed to update todo'),
  })
}

export function useDeleteTodo(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => todosApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos', projectId] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Todo deleted')
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Failed to delete todo'),
  })
}

export function useMoveTodo(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveTodoRequest }) => todosApi.move(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos', projectId] })
      qc.invalidateQueries({ queryKey: ['board'] })
      qc.invalidateQueries({ queryKey: ['sprints', projectId] })
    },
    onError: (err: Error) => {
      qc.invalidateQueries({ queryKey: ['todos', projectId] })
      qc.invalidateQueries({ queryKey: ['board'] })
      toast.error(err instanceof ApiError ? err.message : 'Failed to move todo')
    },
  })
}
