import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sprintsApi } from '@/api/sprints'
import type { CompleteSprintRequest, CreateSprintRequest, StartSprintRequest, UpdateSprintRequest } from '@/types/api'
import { toast } from 'sonner'
import { ApiError } from '@/api/client'

export function useSprints(projectId: string | undefined) {
  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => sprintsApi.list(projectId!),
    enabled: !!projectId,
  })
}

export function useSprint(id: string | undefined) {
  return useQuery({
    queryKey: ['sprint', id],
    queryFn: () => sprintsApi.get(id!),
    enabled: !!id,
  })
}

export function useBoard(sprintId: string | undefined) {
  return useQuery({
    queryKey: ['board', sprintId],
    queryFn: () => sprintsApi.board(sprintId!),
    enabled: !!sprintId,
  })
}

export function useCreateSprint(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSprintRequest) => sprintsApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] })
      toast.success('Sprint created')
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Failed to create sprint'),
  })
}

export function useStartSprint(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: StartSprintRequest }) => sprintsApi.start(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['board'] })
      toast.success('Sprint started')
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Failed to start sprint'),
  })
}

export function useCompleteSprint(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteSprintRequest }) => sprintsApi.complete(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['board'] })
      qc.invalidateQueries({ queryKey: ['todos', projectId] })
      toast.success('Sprint completed')
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Failed to complete sprint'),
  })
}

export function useUpdateSprint(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSprintRequest }) => sprintsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] })
      toast.success('Sprint updated')
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Failed to update sprint'),
  })
}

export function useDeleteSprint(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => sprintsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] })
      toast.success('Sprint deleted')
    },
    onError: (err: Error) => toast.error(err instanceof ApiError ? err.message : 'Failed to delete sprint'),
  })
}
