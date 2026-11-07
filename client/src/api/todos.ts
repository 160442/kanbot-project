import { api } from './client'
import type {
  BulkCreateTodosRequest,
  BulkCreateTodosResponse,
  CreateTodoRequest,
  MoveTodoRequest,
  Todo,
  TodoListQuery,
  TodoListResponse,
  UpdateTodoRequest,
} from '@/types/api'

export const todosApi = {
  list: (projectId: string, query?: TodoListQuery) =>
    api
      .get<TodoListResponse>(`/projects/${projectId}/todos`, { params: query })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<{ todo: Todo }>(`/todos/${id}`).then((r) => r.data.todo),

  create: (projectId: string, data: CreateTodoRequest) =>
    api.post<{ todo: Todo }>(`/projects/${projectId}/todos`, data).then((r) => r.data.todo),

  bulkCreate: (projectId: string, data: BulkCreateTodosRequest) =>
    api
      .post<BulkCreateTodosResponse>(`/projects/${projectId}/todos/bulk`, data)
      .then((r) => r.data),

  update: (id: string, data: UpdateTodoRequest) =>
    api.patch<{ todo: Todo }>(`/todos/${id}`, data).then((r) => r.data.todo),

  remove: (id: string) => api.delete(`/todos/${id}`),

  move: (id: string, data: MoveTodoRequest) =>
    api.post<{ todo: Todo }>(`/todos/${id}/move`, data).then((r) => r.data.todo),
}
