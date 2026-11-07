import { api } from './client'
import type {
  AiStatusResponse,
  ChatRequest,
  ChatResponse,
  GenerateTodosRequest,
  GenerateTodosResponse,
  PlanSprintRequest,
  PlanSprintResponse,
  SprintSummaryResponse,
} from '@/types/api'

export const aiApi = {
  status: () => api.get<AiStatusResponse>('/ai/status').then((r) => r.data),
  chat: (projectId: string, data: ChatRequest) =>
    api.post<ChatResponse>(`/projects/${projectId}/ai/chat`, data).then((r) => r.data),
  generateTodos: (projectId: string, data: GenerateTodosRequest) =>
    api.post<GenerateTodosResponse>(`/projects/${projectId}/ai/generate-todos`, data).then((r) => r.data),
  planSprint: (projectId: string, data: PlanSprintRequest) =>
    api.post<PlanSprintResponse>(`/projects/${projectId}/ai/plan-sprint`, data).then((r) => r.data),
  summary: (sprintId: string) =>
    api.post<SprintSummaryResponse>(`/sprints/${sprintId}/ai/summary`).then((r) => r.data),
}
