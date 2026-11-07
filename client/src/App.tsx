import { useEffect } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import ProtectedRoute from '@/guards/ProtectedRoute'
import GuestRoute from '@/guards/GuestRoute'
import AppShell from '@/layouts/AppShell'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import ProjectsPage from '@/features/projects/pages/ProjectsPage'
import BacklogPage from '@/features/backlog/pages/BacklogPage'
import BoardPage from '@/features/board/pages/BoardPage'
import SprintsPage from '@/features/sprints/pages/SprintsPage'

function ProjectIndexRedirect() {
  const { projectId } = useParams()
  return <Navigate to={`/projects/${projectId}/backlog`} replace />
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const qc = useQueryClient()

  useEffect(() => {
    void initialize()
  }, [initialize])

  useEffect(() => {
    const onUnauthorized = () => {
      clearAuth()
      qc.clear()
    }
    window.addEventListener('kanbot:unauthorized', onUnauthorized)
    return () => window.removeEventListener('kanbot:unauthorized', onUnauthorized)
  }, [clearAuth, qc])

  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectIndexRedirect />} />
          <Route path="/projects/:projectId/backlog" element={<BacklogPage />} />
          <Route path="/projects/:projectId/board" element={<BoardPage />} />
          <Route path="/projects/:projectId/sprints" element={<SprintsPage />} />
          <Route path="/projects/:projectId/sprints/:sprintId" element={<SprintsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  )
}
