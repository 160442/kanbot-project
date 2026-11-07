import { api } from './client'
import type { CreateProjectRequest, ProjectWithStats, UpdateProjectRequest } from '@/types/api'

export const projectsApi = {
  list: () =>
    api.get<{ projects: ProjectWithStats[] }>('/projects').then((r) => r.data.projects),

  get: (id: string) =>
    api.get<{ project: ProjectWithStats }>(`/projects/${id}`).then((r) => r.data.project),

  create: (data: CreateProjectRequest) =>
    api.post<{ project: ProjectWithStats }>('/projects', data).then((r) => r.data.project),

  update: (id: string, data: UpdateProjectRequest) =>
    api.patch<{ project: ProjectWithStats }>(`/projects/${id}`, data).then((r) => r.data.project),

  remove: (id: string) => api.delete(`/projects/${id}`),
}
