import { api } from './client'
import type {
  CompleteSprintRequest,
  CreateSprintRequest,
  Sprint,
  SprintBoardResponse,
  SprintListResponse,
  StartSprintRequest,
  UpdateSprintRequest,
} from '@/types/api'

export const sprintsApi = {
  list: (projectId: string) =>
    api.get<SprintListResponse>(`/projects/${projectId}/sprints`).then((r) => r.data),

  get: (id: string) =>
    api.get<{ sprint: Sprint }>(`/sprints/${id}`).then((r) => r.data.sprint),

  board: (id: string) =>
    api.get<SprintBoardResponse>(`/sprints/${id}/todos`).then((r) => r.data),

  create: (projectId: string, data: CreateSprintRequest) =>
    api.post<{ sprint: Sprint }>(`/projects/${projectId}/sprints`, data).then((r) => r.data.sprint),

  update: (id: string, data: UpdateSprintRequest) =>
    api.patch<{ sprint: Sprint }>(`/sprints/${id}`, data).then((r) => r.data.sprint),

  remove: (id: string) => api.delete(`/sprints/${id}`),

  start: (id: string, data?: StartSprintRequest) =>
    api.post<{ sprint: Sprint }>(`/sprints/${id}/start`, data || {}).then((r) => r.data.sprint),

  complete: (id: string, data: CompleteSprintRequest) =>
    api.post<{ sprint: Sprint }>(`/sprints/${id}/complete`, data).then((r) => r.data.sprint),
}
