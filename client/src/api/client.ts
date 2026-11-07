import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiErrorBody, ErrorCode } from '@/types/api'

const TOKEN_KEY = 'kanbot_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  code: ErrorCode
  details?: { path: string; message: string }[]

  constructor(status: number, code: ErrorCode, message: string, details?: { path: string; message: string }[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/** Backend: /api/auth, /api/projects, /api/todos..., /api/sprints..., /api/ai... */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let handling401 = false

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorBody>) => {
    if (!error.response) {
      const msg =
        error.code === 'ECONNABORTED'
          ? 'Request timed out. Try again.'
          : 'Cannot reach the server. Start the backend: cd kanbot-server && npm run dev'
      return Promise.reject(new ApiError(0, 'INTERNAL_ERROR', msg))
    }
    const { status, data } = error.response
    const body = data?.error
    const apiErr = new ApiError(
      status,
      body?.code || 'INTERNAL_ERROR',
      body?.message || 'Something went wrong',
      body?.details,
    )

    if (status === 401 && body?.code === 'UNAUTHORIZED') {
      const url = error.config?.url || ''
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')
      if (!isAuthEndpoint && !handling401) {
        handling401 = true
        setStoredToken(null)
        window.dispatchEvent(new CustomEvent('kanbot:unauthorized'))
        setTimeout(() => {
          handling401 = false
        }, 1000)
      }
    }
    return Promise.reject(apiErr)
  },
)

export function toFieldErrors(details?: { path: string; message: string }[]) {
  if (!details?.length) return {}
  const out: Record<string, { message: string }> = {}
  for (const d of details) out[d.path] = { message: d.message }
  return out
}
