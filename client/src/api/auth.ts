import { api } from './client'
import type { AuthResponse, LoginRequest, MeResponse, RegisterRequest } from '@/types/api'

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
  me: () => api.get<MeResponse>('/auth/me').then((r) => r.data),
}
